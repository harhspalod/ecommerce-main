/*
  # E-commerce CRM Database Schema

  1. New Tables
    - `customers` - Customer information and contact details
    - `products` - Product catalog with pricing and inventory
    - `purchases` - Purchase history linking customers to products
    - `campaigns` - Marketing campaigns with product connections
    - `call_triggers` - Call scheduling and tracking records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Ensure data integrity with foreign keys

  3. Features
    - UUID primary keys for all tables
    - Timestamps for audit trails
    - Proper indexing for performance
    - Cascading deletes where appropriate
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price > 0),
  sale_price decimal(10,2) CHECK (sale_price IS NULL OR sale_price < price),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_paid decimal(10,2) NOT NULL CHECK (price_paid > 0),
  purchase_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Active', 'Scheduled', 'Paused', 'Completed')),
  condition text NOT NULL,
  discount text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_date > start_date)
);

-- Call triggers table
CREATE TABLE IF NOT EXISTS call_triggers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  trigger_type text NOT NULL CHECK (trigger_type IN ('price_drop', 'stock_alert', 'promotion')),
  discount_percent integer CHECK (discount_percent >= 0 AND discount_percent <= 100),
  new_price decimal(10,2) CHECK (new_price > 0),
  original_price decimal(10,2) CHECK (original_price > 0),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'failed', 'cancelled')),
  scheduled_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_product_id ON campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_call_triggers_status ON call_triggers(status);
CREATE INDEX IF NOT EXISTS idx_call_triggers_scheduled_at ON call_triggers(scheduled_at);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON purchases
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON call_triggers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert sample data
INSERT INTO customers (name, email, phone) VALUES
  ('Alice Johnson', 'alice@example.com', '+1-555-123-4567'),
  ('Bob Smith', 'bob@example.com', '+1-555-987-6543'),
  ('Carol Williams', 'carol@example.com', '+1-555-456-7890'),
  ('David Brown', 'david@example.com', '+1-555-321-9876'),
  ('Eva Davis', 'eva@example.com', '+1-555-654-3210');

INSERT INTO products (name, category, price, sale_price, stock, description) VALUES
  ('iPhone 15 Pro', 'Electronics', 999.99, 899.99, 45, 'Latest iPhone with advanced features'),
  ('Samsung Galaxy S24', 'Electronics', 849.99, NULL, 12, 'Premium Android smartphone'),
  ('MacBook Air M3', 'Electronics', 1299.99, 1199.99, 0, 'Lightweight laptop with M3 chip'),
  ('Nike Air Max', 'Fashion', 129.99, NULL, 156, 'Comfortable running shoes'),
  ('Coffee Table Oak', 'Furniture', 299.99, 249.99, 8, 'Solid oak coffee table');

-- Insert sample purchases (using the actual UUIDs from the inserted data)
DO $$
DECLARE
  alice_id uuid;
  bob_id uuid;
  carol_id uuid;
  david_id uuid;
  eva_id uuid;
  iphone_id uuid;
  samsung_id uuid;
  macbook_id uuid;
  nike_id uuid;
  table_id uuid;
BEGIN
  -- Get customer IDs
  SELECT id INTO alice_id FROM customers WHERE email = 'alice@example.com';
  SELECT id INTO bob_id FROM customers WHERE email = 'bob@example.com';
  SELECT id INTO carol_id FROM customers WHERE email = 'carol@example.com';
  SELECT id INTO david_id FROM customers WHERE email = 'david@example.com';
  SELECT id INTO eva_id FROM customers WHERE email = 'eva@example.com';
  
  -- Get product IDs
  SELECT id INTO iphone_id FROM products WHERE name = 'iPhone 15 Pro';
  SELECT id INTO samsung_id FROM products WHERE name = 'Samsung Galaxy S24';
  SELECT id INTO macbook_id FROM products WHERE name = 'MacBook Air M3';
  SELECT id INTO nike_id FROM products WHERE name = 'Nike Air Max';
  SELECT id INTO table_id FROM products WHERE name = 'Coffee Table Oak';
  
  -- Insert purchases
  INSERT INTO purchases (customer_id, product_id, quantity, price_paid, purchase_date) VALUES
    (alice_id, iphone_id, 1, 999.99, '2024-01-10'),
    (alice_id, nike_id, 2, 129.99, '2024-01-05'),
    (alice_id, macbook_id, 1, 1299.99, '2024-01-15'),
    (bob_id, samsung_id, 1, 849.99, '2024-01-08'),
    (bob_id, nike_id, 1, 129.99, '2024-01-12'),
    (carol_id, macbook_id, 1, 1299.99, '2024-01-12'),
    (carol_id, table_id, 1, 299.99, '2024-01-15'),
    (david_id, iphone_id, 1, 999.99, '2024-01-20'),
    (eva_id, nike_id, 3, 129.99, '2024-01-18');
    
  -- Insert sample campaigns
  INSERT INTO campaigns (name, type, status, condition, discount, product_id, start_date, end_date, description) VALUES
    ('iPhone 15 Pro Holiday Sale', 'Discount', 'Active', 'Product: iPhone 15 Pro', '15%', iphone_id, '2024-01-01', '2024-01-31', 'Holiday season discount campaign for iPhone customers'),
    ('Samsung Galaxy Welcome Offer', 'Welcome', 'Active', 'Product: Samsung Galaxy S24', '10%', samsung_id, '2024-01-01', '2024-12-31', 'Welcome discount for Samsung Galaxy customers'),
    ('MacBook VIP Loyalty', 'Loyalty', 'Active', 'Product: MacBook Air M3', '20%', macbook_id, '2024-01-01', '2024-06-30', 'Loyalty program for MacBook customers'),
    ('Nike Flash Weekend Sale', 'Flash Sale', 'Scheduled', 'Product: Nike Air Max', '25%', nike_id, '2024-02-01', '2024-02-03', 'Weekend flash sale for Nike customers');
END $$;