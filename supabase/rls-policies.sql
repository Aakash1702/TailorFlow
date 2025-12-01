-- TailorFlow Row-Level Security (RLS) Policies
-- Run this AFTER running schema.sql in Supabase SQL Editor

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

-- Helper function to get user's shop_id
CREATE OR REPLACE FUNCTION get_user_shop_id()
RETURNS UUID AS $$
  SELECT shop_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is admin/manager
CREATE OR REPLACE FUNCTION is_shop_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- SHOPS POLICIES
CREATE POLICY "Users can view their own shop"
  ON shops FOR SELECT
  USING (id = get_user_shop_id() OR owner_id = auth.uid());

CREATE POLICY "Shop owners can update their shop"
  ON shops FOR UPDATE
  USING (owner_id = auth.uid());

-- PROFILES POLICIES
CREATE POLICY "Users can view profiles in their shop"
  ON profiles FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- CUSTOMERS POLICIES
CREATE POLICY "Users can view customers in their shop"
  ON customers FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Admins/Managers can insert customers"
  ON customers FOR INSERT
  WITH CHECK (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

CREATE POLICY "Admins/Managers can update customers"
  ON customers FOR UPDATE
  USING (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE
  USING (shop_id = get_user_shop_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- EMPLOYEES POLICIES
CREATE POLICY "Users can view employees in their shop"
  ON employees FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Admins/Managers can insert employees"
  ON employees FOR INSERT
  WITH CHECK (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

CREATE POLICY "Admins/Managers can update employees"
  ON employees FOR UPDATE
  USING (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  USING (shop_id = get_user_shop_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ORDERS POLICIES
CREATE POLICY "Users can view orders in their shop"
  ON orders FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Users can insert orders in their shop"
  ON orders FOR INSERT
  WITH CHECK (shop_id = get_user_shop_id());

CREATE POLICY "Users can update orders in their shop"
  ON orders FOR UPDATE
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Admins/Managers can delete orders"
  ON orders FOR DELETE
  USING (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

-- ORDER ITEMS POLICIES (via order's shop_id)
CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id()
  ));

CREATE POLICY "Users can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id()
  ));

CREATE POLICY "Users can update order items"
  ON order_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id()
  ));

CREATE POLICY "Users can delete order items"
  ON order_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.shop_id = get_user_shop_id()
  ));

-- ORDER ITEM EXTRAS POLICIES
CREATE POLICY "Users can view order item extras"
  ON order_item_extras FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM order_items 
    JOIN orders ON orders.id = order_items.order_id 
    WHERE order_items.id = order_item_extras.order_item_id 
    AND orders.shop_id = get_user_shop_id()
  ));

CREATE POLICY "Users can insert order item extras"
  ON order_item_extras FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM order_items 
    JOIN orders ON orders.id = order_items.order_id 
    WHERE order_items.id = order_item_extras.order_item_id 
    AND orders.shop_id = get_user_shop_id()
  ));

CREATE POLICY "Users can update order item extras"
  ON order_item_extras FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM order_items 
    JOIN orders ON orders.id = order_items.order_id 
    WHERE order_items.id = order_item_extras.order_item_id 
    AND orders.shop_id = get_user_shop_id()
  ));

CREATE POLICY "Users can delete order item extras"
  ON order_item_extras FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM order_items 
    JOIN orders ON orders.id = order_items.order_id 
    WHERE order_items.id = order_item_extras.order_item_id 
    AND orders.shop_id = get_user_shop_id()
  ));

-- EXTRAS PRESETS POLICIES
CREATE POLICY "Users can view extras presets in their shop"
  ON extras_presets FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Admins/Managers can insert extras presets"
  ON extras_presets FOR INSERT
  WITH CHECK (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

CREATE POLICY "Admins/Managers can update extras presets"
  ON extras_presets FOR UPDATE
  USING (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

CREATE POLICY "Admins/Managers can delete extras presets"
  ON extras_presets FOR DELETE
  USING (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

-- PAYMENTS POLICIES
CREATE POLICY "Users can view payments in their shop"
  ON payments FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Users can insert payments in their shop"
  ON payments FOR INSERT
  WITH CHECK (shop_id = get_user_shop_id());

CREATE POLICY "Admins/Managers can update payments"
  ON payments FOR UPDATE
  USING (shop_id = get_user_shop_id() AND is_shop_admin_or_manager());

CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  USING (shop_id = get_user_shop_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ACTIVITIES POLICIES
CREATE POLICY "Users can view activities in their shop"
  ON activities FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Users can insert activities in their shop"
  ON activities FOR INSERT
  WITH CHECK (shop_id = get_user_shop_id());
