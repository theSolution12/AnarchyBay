-- Enhance products table with additional fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Rename category from TEXT[] to TEXT for single category
-- First check if category is TEXT[] and convert if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'category' 
    AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE products ALTER COLUMN category TYPE TEXT USING category[1];
  END IF;
END $$;

-- Rename image_url to match design (keeping as array for multiple images)
-- The existing image_url column will be used as-is

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_creator_id ON products(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
