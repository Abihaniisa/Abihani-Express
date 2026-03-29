-- ============================================
-- Abihani Express - Full Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name TEXT DEFAULT 'Abihani Express',
    slogan TEXT DEFAULT 'MOM · DAD · UMMIHANI',
    logo_url TEXT,
    brand_image_url TEXT,
    ceo_image_url TEXT,
    contact_whatsapp TEXT DEFAULT '+2347067551684',
    contact_phone TEXT DEFAULT '+2347067551684',
    footer_text TEXT DEFAULT '© 2026 Abihani Express',
    sliders JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (id, site_name, slogan, contact_whatsapp, contact_phone, footer_text, sliders)
VALUES (
    1,
    'Abihani Express',
    'MOM · DAD · UMMIHANI',
    '+2347067551684',
    '+2347067551684',
    '© 2026 Abihani Express',
    '[{"title": "Welcome to Abihani Express", "subtitle": "Your perfect home for leather works"}, {"title": "Quality & Durability", "subtitle": "Premium leather goods from Yobe State"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'fa-tag',
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBCATEGORIES
CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS (with image_url column)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    vendor TEXT DEFAULT 'Abihani Express',
    description TEXT,
    image_url TEXT,
    image_icon TEXT DEFAULT '📦',
    featured BOOLEAN DEFAULT FALSE,
    featured_order INTEGER DEFAULT 0,
    rating NUMERIC,
    review_count INTEGER DEFAULT 0,
    vendor_location TEXT DEFAULT 'Potiskum, Yobe State',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMINS (email whitelist)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- SITE_SETTINGS: anyone can read, authenticated can update
CREATE POLICY "Anyone can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update site_settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- CATEGORIES: anyone can read, authenticated can insert/update/delete
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- SUBCATEGORIES: anyone can read, authenticated can insert/update/delete
CREATE POLICY "Anyone can read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert subcategories" ON subcategories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update subcategories" ON subcategories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete subcategories" ON subcategories FOR DELETE USING (auth.role() = 'authenticated');

-- PRODUCTS: anyone can read, authenticated can insert/update/delete
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- ADMINS: anyone can read (for login check), authenticated can manage
CREATE POLICY "Anyone can read admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert admins" ON admins FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- FEEDBACK: anyone can insert (contact form), authenticated can read
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read feedback" ON feedback FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA: Sample categories and products
-- ============================================

INSERT INTO categories (name, icon, "order") VALUES
    ('Shoes', 'fa-shoe-prints', 1),
    ('Bags', 'fa-briefcase', 2),
    ('Accessories', 'fa-gem', 3),
    ('Belts', 'fa-ring', 4)
ON CONFLICT DO NOTHING;

INSERT INTO products (name, price, category_id, vendor, description, image_icon, featured, featured_order, vendor_location) VALUES
    ('Classic Leather Shoe', 15000, 1, 'Abihani Express', 'Premium handcrafted leather shoe for everyday elegance.', '👞', true, 1, 'Potiskum, Yobe State'),
    ('Executive Briefcase', 25000, 2, 'Abihani Express', 'Stylish leather briefcase for the modern professional.', '💼', true, 2, 'Potiskum, Yobe State'),
    ('Leather Belt', 5000, 4, 'Abihani Express', 'Durable genuine leather belt with classic buckle.', '🔗', true, 3, 'Potiskum, Yobe State'),
    ('Ladies Handbag', 20000, 2, 'Abihani Express', 'Elegant leather handbag with multiple compartments.', '👜', true, 4, 'Potiskum, Yobe State'),
    ('Leather Sandals', 8000, 1, 'Abihani Express', 'Comfortable open-toe leather sandals.', '🩴', false, 0, 'Potiskum, Yobe State'),
    ('Wallet', 3500, 3, 'Abihani Express', 'Slim leather wallet with card slots.', '👛', false, 0, 'Potiskum, Yobe State')
ON CONFLICT DO NOTHING;
