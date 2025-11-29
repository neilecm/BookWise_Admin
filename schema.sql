-- BookWise Admin Panel - Database Schema

-- Affiliate Products Table
CREATE TABLE IF NOT EXISTS affiliate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  display_price VARCHAR(50),
  
  -- Affiliate info
  platform VARCHAR(50) NOT NULL, -- 'amazon', 'shopee', 'impact', etc.
  affiliate_url TEXT NOT NULL,
  external_id VARCHAR(255),
  
  -- Targeting
  countries TEXT[] DEFAULT '{}',
  service_tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_affiliate_products_platform ON affiliate_products(platform);
CREATE INDEX idx_affiliate_products_active ON affiliate_products(active);
CREATE INDEX idx_affiliate_products_countries ON affiliate_products USING GIN(countries);
CREATE INDEX idx_affiliate_products_service_tags ON affiliate_products USING GIN(service_tags);

-- Translations Table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(key, language)
);

CREATE INDEX idx_translations_key ON translations(key);
CREATE INDEX idx_translations_language ON translations(language);

-- Languages Table
CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default languages
INSERT INTO languages (code, name, native_name, active) VALUES
('en', 'English', 'English', true),
('id', 'Indonesian', 'Bahasa Indonesia', true),
('es', 'Spanish', 'Español', false),
('fr', 'French', 'Français', false),
('de', 'German', 'Deutsch', false)
ON CONFLICT (code) DO NOTHING;

-- Affiliate Clicks Table (already exists, but adding index for admin)
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON affiliate_clicks(created_at DESC);
