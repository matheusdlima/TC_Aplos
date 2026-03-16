import pandas as pd
import numpy as np
import random
from faker import Faker
from datetime import datetime

fake = Faker()
Faker.seed(42)
random.seed(42)

NUM_CUSTOMERS = 1000
NUM_PRODUCTS = 50
NUM_SALES = 5000

REGIONS = ['North', 'South', 'East', 'West', 'Central']
CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Groceries', 'Toys']
SUPPLIERS = ['TechCorp', 'StyleInc', 'HomeBasics', 'GlobalSupply', 'ToyUniverse']
PRODUCT_CATALOG = {
    'Electronics': [
        'Smartphone', 'Laptop', 'Smartwatch', 'Bluetooth Headphones', 'Tablet',
        'Gaming Console', '4K TV', 'Wireless Router', 'Portable Speaker', 'Monitor'
    ],
    'Fashion': [
        'Jeans', 'T-Shirt', 'Sneakers', 'Jacket', 'Dress',
        'Backpack', 'Cap', 'Sunglasses', 'Boots', 'Hoodie'
    ],
    'Home': [
        'Blender', 'Vacuum Cleaner', 'Microwave', 'Coffee Maker', 'Desk Lamp',
        'Mattress', 'Curtains', 'Bookshelf', 'Office Chair', 'Air Purifier'
    ],
    'Groceries': [
        'Rice Pack', 'Olive Oil', 'Pasta', 'Coffee Beans', 'Milk',
        'Cereal', 'Chocolate Bar', 'Orange Juice', 'Tomato Sauce', 'Cookies'
    ],
    'Toys': [
        'Building Blocks', 'Action Figure', 'Puzzle', 'Board Game', 'Doll',
        'Toy Car', 'Drone Toy', 'Plush Bear', 'Water Gun', 'Kite'
    ]
}

def generate_customers():
    customers = []
    for _ in range(NUM_CUSTOMERS):
        customers.append({
            'id': fake.uuid4(),
            'name': fake.name(),
            'age': random.randint(18, 70),
            'region': random.choice(REGIONS)
        })
    
    df = pd.DataFrame(customers)
    
    # INGECTING INCONSISTENCIES (for the step 3 of ETL)
    # 1. Nul values
    null_indices = df.sample(frac=0.05).index
    df.loc[null_indices, 'age'] = np.nan 
    
    # 2. Duplicates
    duplicates = df.sample(n=10)
    df = pd.concat([df, duplicates], ignore_index=True)
    
    return df

def generate_products():
    # Flatten from the catalog: each item is created with the correct name and category from the start
    catalog_items = [
        {'name': name, 'category': category}
        for category, names in PRODUCT_CATALOG.items()
        for name in names
    ]

    # if request is less than or equal to the catalog size, avoid repetition
    # if request is more, allow repetition while maintaining name-category link
    if NUM_PRODUCTS <= len(catalog_items):
        selected = random.sample(catalog_items, NUM_PRODUCTS)
    else:
        selected = [random.choice(catalog_items) for _ in range(NUM_PRODUCTS)]

    products = []
    for i, item in enumerate(selected, start=1):
        products.append({
            'id': i,  # example: Smartphone - Electronics - id 1
            'product_name': item['name'],
            'category': item['category'],
            'price': round(random.uniform(10.0, 500.0), 2),
            'supplier': random.choice(SUPPLIERS)
        })

    return pd.DataFrame(products)

def generate_sales(customers_df, products_df):
    sales = []
    
    # separating products by category to facilitate the creation of biased sales data (for the step 6 of Insights)
    fashion_products = products_df[products_df['category'] == 'Fashion']['id'].tolist()
    electronics_products = products_df[products_df['category'] == 'Electronics']['id'].tolist()
    other_products = products_df[~products_df['category'].isin(['Fashion', 'Electronics'])]['id'].tolist()

    start_date = datetime(2025, 1, 1)
    
    for _ in range(NUM_SALES):
        customer = customers_df.sample(1).iloc[0]
        customer_id = customer['id']
        customer_age = customer['age']
        customer_region = customer['region']
        
        # BUSINESS LOGIC INJECTED (for the step 6 of Insights)
        # If young (<25), has 70% chance of buying Fashion
        if pd.notna(customer_age) and customer_age < 25 and random.random() < 0.7:
            product_id = random.choice(fashion_products)
        # If from the South, has 60% chance of buying Electronics
        elif customer_region == 'South' and random.random() < 0.6:
            product_id = random.choice(electronics_products)
        else:
            product_id = random.choice(other_products) if other_products else random.choice(products_df['id'].tolist())

        sales.append({
            'id': fake.uuid4(),
            'customer_id': customer_id,
            'product_id': product_id,
            'date': fake.date_between(start_date=start_date, end_date='today'),
            'quantity': random.choices([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100], weights=[60, 20, 10, 5, 5, 5, 5, 5, 5, 5, 1])[0] # The '100' is an intentional outlier
        })
        
    return pd.DataFrame(sales)

if __name__ == "__main__":
    print("Generating data...")
    
    df_customers = generate_customers()
    df_products = generate_products()
    df_sales = generate_sales(df_customers, df_products)
    
    # Exporting to CSV as required
    df_customers.to_csv('base_files/customers.csv', index=False)
    df_products.to_csv('base_files/products.csv', index=False)
    df_sales.to_csv('base_files/sales.csv', index=False)
    
    print("Files customers.csv, products.csv and sales.csv generated successfully!")