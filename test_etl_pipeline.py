import pytest
import pandas as pd
import numpy as np
from etl_pipeline import clean_data, generate_metrics

# ==========================================
# FIXTURES (fake data for testing)
# ==========================================
@pytest.fixture
def mock_data():
    """Provides mock DataFrames to test the ETL logic isolated from CSV files."""
    
    customers = pd.DataFrame({
        'id': ['1', '2', '2', np.nan], # Duplicate '2', missing ID
        'name': ['Alice', 'Bob', 'Bob', 'Charlie'],
        'age': [25, np.nan, np.nan, 30],
        'region': ['North', np.nan, np.nan, 'South']
    })
    
    # Adicionando sujeira: p2 duplicado, um ID nulo, e p3 sem categoria
    products = pd.DataFrame({
        'id': ['p1', 'p2', 'p2', np.nan, 'p3'],
        'product_name': ['Laptop', 'Shirt', 'Shirt', 'Shoes', 'Hat'],
        'category': ['Electronics', 'Fashion', 'Fashion', 'Footwear', np.nan],
        'price': [1000.0, 50.0, 50.0, 120.0, 25.0]
    })
    
    sales = pd.DataFrame({
        'id': ['s1', 's2', 's3', 's4'],
        'customer_id': ['1', '2', '1', np.nan], # s4 has missing customer
        'product_id': ['p1', 'p2', 'p1', 'p2'],
        'date': ['2026-01-01', '2026-01-02', 'invalid_date', '2026-01-03'], # s3 has invalid date
        'quantity': [1, 2, 9999, 1] # 9999 is a clear outlier
    })
    
    return customers, products, sales

# ==========================================
# TESTS
# ==========================================
def test_clean_data_handles_inconsistencies(mock_data):
    """Tests if the clean_data function properly handles duplicates, NaNs, and outliers"""
    cust, prod, sales = mock_data
    clean_cust, clean_prod, clean_sales = clean_data(cust, prod, sales)
    
    # --- CUSTOMERS TESTS ---
    # 1. test duplicate removal and null ID drop
    # Initial was 4 rows. 1 duplicate removed, 1 missing ID removed. Should be 2.
    assert len(clean_cust) == 2
    
    # 2. test string NaN filling ('Unknown')
    # Bob had no region, it should be 'Unknown' now
    bob_region = clean_cust[clean_cust['id'] == '2']['region'].iloc[0]
    assert bob_region == 'Unknown'
    
    # 3. test numerical NaN preservation
    # Bob's age should remain NaN
    assert pd.isna(clean_cust[clean_cust['id'] == '2']['age'].iloc[0])
    
    # --- PRODUCTS TESTS ---
    # initial was 5 rows. 1 duplicate removed, 1 missing ID removed. Should be 3.
    assert len(clean_prod) == 3
    
    # test string NaN filling in products ('Unknown')
    # p3 (Hat) had no category, it should be 'Unknown'
    hat_category = clean_prod[clean_prod['id'] == 'p3']['category'].iloc[0]
    assert hat_category == 'Unknown'
    
    # --- SALES TESTS ---
    # s4 dropped (missing customer), s3 dropped (invalid date & outlier)
    assert len(clean_sales) <= 2 
    # ensure the outlier quantity (9999) was removed
    assert 9999 not in clean_sales['quantity'].values

def test_generate_metrics_calculates_correctly():
    """Tests if the metrics calculation logic is mathematically correct for all outputs"""
    
    # Adding a bit more complexity to test grouping and sorting
    cust = pd.DataFrame({
        'id': ['1', '2'], 
        'name': ['Alice', 'Bob'], 
        'age': [25, 30], 
        'region': ['North', 'South']
    })
    
    prod = pd.DataFrame({
        'id': ['p1', 'p2'], 
        'product_name': ['Laptop', 'Mouse'], 
        'category': ['Electronics', 'Electronics'], 
        'price': [1000.0, 50.0]
    })
    
    sales = pd.DataFrame({
        'id': ['s1', 's2', 's3'], 
        'customer_id': ['1', '1', '2'], # Alice makes 2 purchases, Bob makes 1
        'product_id': ['p1', 'p2', 'p1'], # Alice buys Laptop & Mouse. Bob buys Laptop
        'date': ['2026-01-01', '2026-01-02', '2026-01-03'], 
        'quantity': [2, 1, 1] 
    })
    
    rev_by_region, top_prod, sales_by_cat, top_buyers = generate_metrics(cust, prod, sales)
    
    # --- 1. test Revenue by Region ---
    # North (Alice): (2 * 1000) + (1 * 50) = 2050.0
    # South (Bob): (1 * 1000) = 1000.0
    assert rev_by_region[rev_by_region['region'] == 'North']['total_value'].item() == 2050.0
    assert rev_by_region[rev_by_region['region'] == 'South']['total_value'].item() == 1000.0
    
    # --- 2. test Top Selling Products ---
    # Laptop (p1): 2 + 1 = 3 total units
    # Mouse (p2): 1 unit
    # Expected rank 1: Laptop
    assert top_prod.iloc[0]['product_name'] == 'Laptop'
    assert top_prod.iloc[0]['quantity'] == 3
    
    # --- 3. test Sales by Category ---
    # Electronics: 2050.0 (Alice) + 1000.0 (Bob) = 3050.0
    assert sales_by_cat[sales_by_cat['category'] == 'Electronics']['total_value'].item() == 3050.0
    
    # --- 4. test Top Buyers ---
    # Alice spent 2050.0, Bob spent 1000.0
    # Expected rank 1: Alice
    assert top_buyers.iloc[0]['name'] == 'Alice'
    assert top_buyers.iloc[0]['total_value'] == 2050.0