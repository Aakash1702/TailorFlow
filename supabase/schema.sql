-- TailorFlow Database Schema for Supabase
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shops table (for multi-tenant support)
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'tailor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  measurements JSONB DEFAULT '{}',
  notes TEXT,
  outstanding_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'tailor' CHECK (role IN ('tailor', 'manager', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'inProgress', 'completed', 'delivered')),
  amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_date TIMESTAMPTZ NOT NULL,
  assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  base_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order item extras table
CREATE TABLE IF NOT EXISTS order_item_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extras presets table (shop-specific templates)
CREATE TABLE IF NOT EXISTS extras_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('design', 'material', 'finishing', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'card', 'upi', 'wallet', 'bank')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table (for activity feed)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order_created', 'order_updated', 'payment_received', 'order_completed', 'order_delivered')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_employees_shop_id ON employees(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_shop_id ON payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_activities_shop_id ON activities(shop_id);
CREATE INDEX IF NOT EXISTS idx_profiles_shop_id ON profiles(shop_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Shops policies: Users can only access their own shop
DROP POLICY IF EXISTS "Users can view own shop" ON shops;
CREATE POLICY "Users can view own shop" ON shops FOR SELECT USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own shop" ON shops;
CREATE POLICY "Users can update own shop" ON shops FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own shop" ON shops;
CREATE POLICY "Users can insert own shop" ON shops FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Profiles policies: Users can access their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Helper function to get user's shop_id
CREATE OR REPLACE FUNCTION get_user_shop_id()
RETURNS UUID AS $$
  SELECT shop_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Customers policies: Users can only access customers in their shop
DROP POLICY IF EXISTS "Users can view shop customers" ON customers;
CREATE POLICY "Users can view shop customers" ON customers FOR SELECT USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can insert shop customers" ON customers;
CREATE POLICY "Users can insert shop customers" ON customers FOR INSERT WITH CHECK (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can update shop customers" ON customers;
CREATE POLICY "Users can update shop customers" ON customers FOR UPDATE USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can delete shop customers" ON customers;
CREATE POLICY "Users can delete shop customers" ON customers FOR DELETE USING (shop_id = get_user_shop_id());

-- Employees policies
DROP POLICY IF EXISTS "Users can view shop employees" ON employees;
CREATE POLICY "Users can view shop employees" ON employees FOR SELECT USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can insert shop employees" ON employees;
CREATE POLICY "Users can insert shop employees" ON employees FOR INSERT WITH CHECK (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can update shop employees" ON employees;
CREATE POLICY "Users can update shop employees" ON employees FOR UPDATE USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can delete shop employees" ON employees;
CREATE POLICY "Users can delete shop employees" ON employees FOR DELETE USING (shop_id = get_user_shop_id());

-- Orders policies
DROP POLICY IF EXISTS "Users can view shop orders" ON orders;
CREATE POLICY "Users can view shop orders" ON orders FOR SELECT USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can insert shop orders" ON orders;
CREATE POLICY "Users can insert shop orders" ON orders FOR INSERT WITH CHECK (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can update shop orders" ON orders;
CREATE POLICY "Users can update shop orders" ON orders FOR UPDATE USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can delete shop orders" ON orders;
CREATE POLICY "Users can delete shop orders" ON orders FOR DELETE USING (shop_id = get_user_shop_id());

-- Order items policies (via order's shop_id)
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
CREATE POLICY "Users can view order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id())
);
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id())
);
DROP POLICY IF EXISTS "Users can update order items" ON order_items;
CREATE POLICY "Users can update order items" ON order_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id())
);
DROP POLICY IF EXISTS "Users can delete order items" ON order_items;
CREATE POLICY "Users can delete order items" ON order_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id())
);

-- Order item extras policies (via order item's order's shop_id)
DROP POLICY IF EXISTS "Users can view order item extras" ON order_item_extras;
CREATE POLICY "Users can view order item extras" ON order_item_extras FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM order_items oi 
    JOIN orders o ON o.id = oi.order_id 
    WHERE oi.id = order_item_extras.order_item_id AND o.shop_id = get_user_shop_id()
  )
);
DROP POLICY IF EXISTS "Users can insert order item extras" ON order_item_extras;
CREATE POLICY "Users can insert order item extras" ON order_item_extras FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_items oi 
    JOIN orders o ON o.id = oi.order_id 
    WHERE oi.id = order_item_extras.order_item_id AND o.shop_id = get_user_shop_id()
  )
);
DROP POLICY IF EXISTS "Users can delete order item extras" ON order_item_extras;
CREATE POLICY "Users can delete order item extras" ON order_item_extras FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM order_items oi 
    JOIN orders o ON o.id = oi.order_id 
    WHERE oi.id = order_item_extras.order_item_id AND o.shop_id = get_user_shop_id()
  )
);

-- Extras presets policies
DROP POLICY IF EXISTS "Users can view shop extras presets" ON extras_presets;
CREATE POLICY "Users can view shop extras presets" ON extras_presets FOR SELECT USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can insert shop extras presets" ON extras_presets;
CREATE POLICY "Users can insert shop extras presets" ON extras_presets FOR INSERT WITH CHECK (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can update shop extras presets" ON extras_presets;
CREATE POLICY "Users can update shop extras presets" ON extras_presets FOR UPDATE USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can delete shop extras presets" ON extras_presets;
CREATE POLICY "Users can delete shop extras presets" ON extras_presets FOR DELETE USING (shop_id = get_user_shop_id());

-- Payments policies
DROP POLICY IF EXISTS "Users can view shop payments" ON payments;
CREATE POLICY "Users can view shop payments" ON payments FOR SELECT USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can insert shop payments" ON payments;
CREATE POLICY "Users can insert shop payments" ON payments FOR INSERT WITH CHECK (shop_id = get_user_shop_id());

-- Activities policies
DROP POLICY IF EXISTS "Users can view shop activities" ON activities;
CREATE POLICY "Users can view shop activities" ON activities FOR SELECT USING (shop_id = get_user_shop_id());
DROP POLICY IF EXISTS "Users can insert shop activities" ON activities;
CREATE POLICY "Users can insert shop activities" ON activities FOR INSERT WITH CHECK (shop_id = get_user_shop_id());

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_extras_presets_updated_at BEFORE UPDATE ON extras_presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a shop and profile for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_shop_id UUID;
BEGIN
  -- Create a default shop for the new user
  INSERT INTO shops (name, owner_id)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'shop_name', 'My Tailoring Shop'), NEW.id)
  RETURNING id INTO new_shop_id;
  
  -- Create profile linked to the shop
  INSERT INTO profiles (id, shop_id, email, full_name, role)
  VALUES (
    NEW.id,
    new_shop_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'admin'
  );
  
  -- Insert default extras presets for the new shop
  INSERT INTO extras_presets (shop_id, label, amount, category) VALUES
    (new_shop_id, 'Designer Work', 200, 'design'),
    (new_shop_id, 'Embroidery', 300, 'design'),
    (new_shop_id, 'Neck Zip', 50, 'finishing'),
    (new_shop_id, 'Side Zip', 50, 'finishing'),
    (new_shop_id, 'Lining', 100, 'material'),
    (new_shop_id, 'Pico/Fall', 80, 'finishing'),
    (new_shop_id, 'Padding', 60, 'material'),
    (new_shop_id, 'Piping', 40, 'finishing'),
    (new_shop_id, 'Hooks', 30, 'finishing'),
    (new_shop_id, 'Steam Press', 50, 'finishing');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create shop and profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
