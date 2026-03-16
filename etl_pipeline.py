import pandas as pd
import json

# ==========================================
# 1. EXTRACT
# ==========================================
def load_data():
    """Reads the raw CSV files into pandas DataFrames"""
    print("Extracting data...")
    try:
        customers = pd.read_csv('base_files/customers.csv')
        products = pd.read_csv('base_files/products.csv')
        sales = pd.read_csv('base_files/sales.csv')
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
        return None, None, None
    except pd.errors.EmptyDataError as e:
        print(f"Error: Empty data - {e}")
        return None, None, None
        
    return customers, products, sales

# ==========================================
# 2. TRANSFORM
# ==========================================
def clean_data(customers, products, sales):
    """
    Handles inconsistencies in raw data such as duplicates, missing values, outliers, and date formatting
    """
    print("Cleaning data...")
    
    # duplicate removal
    customers = customers.drop_duplicates()
    products = products.drop_duplicates()
    sales = sales.drop_duplicates()
    
    # critical missing values (ontology integrity)
    # drop rows where primary or foreign keys are missing across all dataframes
    customers = customers.dropna(subset=['id'])
    products = products.dropna(subset=['id'])
    sales = sales.dropna(subset=['id', 'customer_id', 'product_id'])
    
    # generic handling for missing values in text columns
    # dynamically finds all string/object columns and fills NaNs with 'Unknown'
    for df in [customers, products, sales]:
        string_cols = df.select_dtypes(include=['object', 'string']).columns
        df[string_cols] = df[string_cols].fillna('Unknown')
    
    # Note: numerical columns (like 'age', 'price', 'quantity') are intentionally 
    # left as NaN. Pandas ignores NaNs in aggregations (like sum or mean), 
    # avoiding data distortion (e.g., assuming a price of 0 or an age of 0)..
    
    # dynamic outlier detection (using 99th percentile)
    # any quantity in the top 1% most extreme values is flagged as an outlier
    q99 = sales['quantity'].quantile(0.99)
    sales = sales[sales['quantity'] <= q99]
    
    # date handling and standardization
    # errors='coerce' turns invalid dates into NaT, which we then drop
    sales['date'] = pd.to_datetime(sales['date'], errors='coerce')
    sales = sales.dropna(subset=['date'])
    
    # ensuring IDs are treated as strings to match the ontology definitions
    customers['id'] = customers['id'].astype(str)
    products['id'] = products['id'].astype(str)
    sales['customer_id'] = sales['customer_id'].astype(str)
    sales['product_id'] = sales['product_id'].astype(str)
    
    return customers, products, sales

def generate_metrics(customers, products, sales):
    """Generates business metrics."""
    print("Generating metrics...")
    
    # merge tables to get a complete sales view
    # sales + products (to include price and category)
    enriched_sales = sales.merge(products, left_on='product_id', right_on='id', suffixes=('_sale', '_product'))
    
    # calculate total value per sales row (quantity * price)
    enriched_sales['total_value'] = enriched_sales['quantity'] * enriched_sales['price']
    
    # merge with customers (to include region and age)
    enriched_sales = enriched_sales.merge(customers, left_on='customer_id', right_on='id', suffixes=('', '_customer'))
    
    # metric 1: revenue by region
    revenue_by_region = enriched_sales.groupby('region')['total_value'].sum().reset_index()
    revenue_by_region = revenue_by_region.sort_values(by='total_value', ascending=False)
    
    # metric 2: top selling products (top 5 by quantity)
    top_products = enriched_sales.groupby(['product_id', 'product_name', 'category'])['quantity'].sum().reset_index()
    top_products = top_products.sort_values(by='quantity', ascending=False).head(5)
    
    # metric 3: sales by category
    sales_by_category = enriched_sales.groupby('category')['total_value'].sum().reset_index()
    sales_by_category = sales_by_category.sort_values(by='total_value', ascending=False)

    # metric 4: top 5 customers by total spend
    top_buyers = enriched_sales.groupby(['customer_id', 'name', 'age', 'region'])['total_value'].sum().reset_index()
    top_buyers = top_buyers.sort_values(by='total_value', ascending=False).head(5)
    
    # metric 5: 100 most recent sales
    recent_sales = enriched_sales.sort_values(by='date', ascending=False)
    
    # only 100 most recent to not overwhelm the json file
    columns_to_keep = ['date', 'name', 'product_name', 'category', 'region', 'quantity', 'total_value']
    recent_sales = recent_sales[columns_to_keep].head(100)
    
    recent_sales['date'] = recent_sales['date'].astype(str)

    return revenue_by_region, top_products, sales_by_category, top_buyers, recent_sales

# ==========================================
# 3. LOAD (Export)
# ==========================================
def export_to_json(revenue_by_region, top_products, sales_by_category, top_buyers, recent_sales):
    """Exports metrics to a JSON file consumable by the backend."""
    print("Exporting results to JSON...")
    
    dashboard_data = {
        "revenue_by_region": revenue_by_region.to_dict(orient='records'),
        "top_selling_products": top_products.to_dict(orient='records'),
        "sales_by_category": sales_by_category.to_dict(orient='records'),
        "top_buyers": top_buyers.to_dict(orient='records'),
        "recent_sales": recent_sales.to_dict(orient='records')
    }
    
    with open('insight_files/dashboard_metrics.json', 'w') as f:
        json.dump(dashboard_data, f, indent=4)
        
    print("Pipeline finished! File 'dashboard_metrics.json' generated.")

# ==========================================
# PIPELINE EXECUTION
# ==========================================
if __name__ == "__main__":
    df_cust, df_prod, df_sales = load_data()

    # check if any of the dataframes failed to load before proceeding with the pipeline
    if any(df is None for df in [df_cust, df_prod, df_sales]):
        print("Pipeline aborted: failed to read one or more input files.")
    else:
        df_cust_clean, df_prod_clean, df_sales_clean = clean_data(df_cust, df_prod, df_sales)
        metrics_region, metrics_top_prod, metrics_category, metrics_top_buyers, metrics_recent_sales = generate_metrics(
            df_cust_clean, df_prod_clean, df_sales_clean
        )
        export_to_json(metrics_region, metrics_top_prod, metrics_category, metrics_top_buyers, metrics_recent_sales)