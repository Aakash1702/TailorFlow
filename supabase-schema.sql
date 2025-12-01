-- TailorFlow Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- SHOPS TABLE - Each user owns a shop
-- ========================================
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'My Tailoring Shop',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROFILES TABLE - Links users to shops
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'tailor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- CUSTOMERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
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

-- ========================================
-- EMPLOYEES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'tailor' CHECK (role IN ('tailor', 'manager', 'admin')),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ORDERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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

-- ========================================
-- ORDER ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  base_price DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ORDER ITEM EXTRAS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS order_item_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'card', 'upi', 'wallet', 'bank')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ACTIVITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order_created', 'order_updated', 'payment_received', 'order_completed', 'order_delivered')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- EXTRAS PRESETS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS extras_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  category TEXT DEFAULT 'other' CHECK (category IN ('design', 'material', 'finishing', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras_presets ENABLE ROW LEVEL SECURITY;

-- SHOPS policies
CREATE POLICY "Users can view their own shop" ON shops
  FOR SELECT USING (owner_id = auth.uid());
  
CREATE POLICY "Users can update their own shop" ON shops
  FOR UPDATE USING (owner_id = auth.uid());
  
CREATE POLICY "Users can insert their own shop" ON shops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- PROFILES policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
  
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
  
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- CUSTOMERS policies
CREATE POLICY "Users can manage customers in their shop" ON customers
  FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid())
  );

-- EMPLOYEES policies
CREATE POLICY "Users can manage employees in their shop" ON employees
  FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid())
  );

-- ORDERS policies
CREATE POLICY "Users can manage orders in their shop" ON orders
  FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid())
  );

-- ORDER ITEMS policies
CREATE POLICY "Users can manage order items via orders" ON order_items
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders WHERE shop_id IN (
        SELECT shop_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ORDER ITEM EXTRAS policies
CREATE POLICY "Users can manage extras via order items" ON order_item_extras
  FOR ALL USING (
    order_item_id IN (
      SELECT id FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE shop_id IN (
          SELECT shop_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- PAYMENTS policies
CREATE POLICY "Users can manage payments in their shop" ON payments
  FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid())
  );

-- ACTIVITIES policies
CREATE POLICY "Users can manage activities in their shop" ON activities
  FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid())
  );

-- EXTRAS PRESETS policies
CREATE POLICY "Users can manage presets in their shop" ON extras_presets
  FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid())
  );

-- ========================================
-- TRIGGER: Auto-create shop and profile on new user signup
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_shop_id UUID;
  user_name TEXT;
  shop_name TEXT;
BEGIN
  -- Get name from user metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Get shop name from metadata or default
  shop_name := COALESCE(
    NEW.raw_user_meta_data->>'shop_name',
    'My Tailoring Shop'
  );
  
  -- Create a new shop for the user
  INSERT INTO public.shops (name, owner_id)
  VALUES (shop_name, NEW.id)
  RETURNING id INTO new_shop_id;
  
  -- Create profile linking user to shop
  INSERT INTO public.profiles (id, shop_id, email, full_name, role)
  VALUES (NEW.id, new_shop_id, NEW.email, user_name, 'admin');
  
  -- Insert default extras presets for the new shop
  INSERT INTO public.extras_presets (shop_id, label, amount, category) VALUES
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- INDEXES for better performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_employees_shop_id ON employees(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_extras_order_item_id ON order_item_extras(order_item_id);
CREATE INDEX IF NOT EXISTS idx_payments_shop_id ON payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_activities_shop_id ON activities(shop_id);
CREATE INDEX IF NOT EXISTS idx_extras_presets_shop_id ON extras_presets(shop_id);

-- ========================================
-- GRANT permissions
-- ========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
