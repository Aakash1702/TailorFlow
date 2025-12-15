-- TailorFlow Pattern Engine Schema
-- Run this SQL in your Supabase SQL Editor after the main schema

-- ========================================
-- PATTERN TEMPLATES TABLE
-- Stores reusable garment pattern templates
-- ========================================
CREATE TABLE IF NOT EXISTS pattern_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  garment_type TEXT NOT NULL CHECK (garment_type IN ('blouse', 'kurti', 'salwar', 'frock', 'shirt', 'pants', 'lehenga', 'other')),
  description TEXT,
  measurement_fields JSONB NOT NULL DEFAULT '[]',
  options_schema JSONB DEFAULT '{}',
  formula_version TEXT DEFAULT '1.0',
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PATTERN INSTANCES TABLE
-- Stores generated patterns for specific orders/customers
-- ========================================
CREATE TABLE IF NOT EXISTS pattern_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES pattern_templates(id) ON DELETE CASCADE,
  measurements JSONB NOT NULL DEFAULT '{}',
  options JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'printed', 'archived')),
  generated_svg TEXT,
  generated_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- RLS POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE pattern_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_instances ENABLE ROW LEVEL SECURITY;

-- Pattern templates are globally readable (shared across all shops)
CREATE POLICY "Pattern templates are readable by all authenticated users"
  ON pattern_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Pattern instances are shop-scoped
CREATE POLICY "Users can view their shop's pattern instances"
  ON pattern_instances FOR SELECT
  TO authenticated
  USING (shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert pattern instances for their shop"
  ON pattern_instances FOR INSERT
  TO authenticated
  WITH CHECK (shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their shop's pattern instances"
  ON pattern_instances FOR UPDATE
  TO authenticated
  USING (shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their shop's pattern instances"
  ON pattern_instances FOR DELETE
  TO authenticated
  USING (shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));

-- ========================================
-- SEED DEFAULT PATTERN TEMPLATES
-- ========================================
INSERT INTO pattern_templates (name, garment_type, description, measurement_fields, options_schema, formula_version) VALUES
(
  'Basic Saree Blouse',
  'blouse',
  'Traditional saree blouse pattern with front and back pieces, sleeves, and neckline options.',
  '[
    {"key": "bust", "label": "Bust (inches)", "required": true},
    {"key": "waist", "label": "Waist (inches)", "required": true},
    {"key": "shoulderWidth", "label": "Shoulder Width (inches)", "required": true},
    {"key": "frontLength", "label": "Front Length (inches)", "required": true},
    {"key": "backLength", "label": "Back Length (inches)", "required": true},
    {"key": "sleeveLength", "label": "Sleeve Length (inches)", "required": true},
    {"key": "armhole", "label": "Armhole (inches)", "required": true},
    {"key": "neckDepthFront", "label": "Front Neck Depth (inches)", "required": false},
    {"key": "neckDepthBack", "label": "Back Neck Depth (inches)", "required": false}
  ]',
  '{
    "sleeveType": {"label": "Sleeve Type", "options": ["short", "elbow", "full", "sleeveless"], "default": "short"},
    "neckType": {"label": "Neck Type", "options": ["round", "boat", "sweetheart", "square"], "default": "round"},
    "ease": {"label": "Ease (inches)", "type": "number", "default": 2}
  }',
  '1.0'
),
(
  'Kids Frock',
  'frock',
  'Simple A-line kids frock pattern with bodice and gathered skirt.',
  '[
    {"key": "chest", "label": "Chest (inches)", "required": true},
    {"key": "waist", "label": "Waist (inches)", "required": true},
    {"key": "shoulderWidth", "label": "Shoulder Width (inches)", "required": true},
    {"key": "totalLength", "label": "Total Length (inches)", "required": true},
    {"key": "bodiceLength", "label": "Bodice Length (inches)", "required": true},
    {"key": "armhole", "label": "Armhole (inches)", "required": true}
  ]',
  '{
    "sleeveType": {"label": "Sleeve Type", "options": ["puff", "short", "sleeveless"], "default": "puff"},
    "skirtStyle": {"label": "Skirt Style", "options": ["gathered", "aline", "flared"], "default": "gathered"},
    "ease": {"label": "Ease (inches)", "type": "number", "default": 2}
  }',
  '1.0'
),
(
  'Simple Kurti',
  'kurti',
  'Straight-cut kurti pattern with side slits and sleeve options.',
  '[
    {"key": "bust", "label": "Bust (inches)", "required": true},
    {"key": "waist", "label": "Waist (inches)", "required": true},
    {"key": "hips", "label": "Hips (inches)", "required": true},
    {"key": "shoulderWidth", "label": "Shoulder Width (inches)", "required": true},
    {"key": "totalLength", "label": "Total Length (inches)", "required": true},
    {"key": "sleeveLength", "label": "Sleeve Length (inches)", "required": true},
    {"key": "armhole", "label": "Armhole (inches)", "required": true}
  ]',
  '{
    "sleeveType": {"label": "Sleeve Type", "options": ["short", "threequarter", "full"], "default": "threequarter"},
    "neckType": {"label": "Neck Type", "options": ["round", "vneck", "collar", "chinese"], "default": "round"},
    "slitLength": {"label": "Slit Length (inches)", "type": "number", "default": 8}
  }',
  '1.0'
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_pattern_instances_shop ON pattern_instances(shop_id);
CREATE INDEX IF NOT EXISTS idx_pattern_instances_customer ON pattern_instances(customer_id);
CREATE INDEX IF NOT EXISTS idx_pattern_instances_order ON pattern_instances(order_id);
CREATE INDEX IF NOT EXISTS idx_pattern_templates_type ON pattern_templates(garment_type);
