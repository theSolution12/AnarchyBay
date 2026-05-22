-- Create discount code products junction table for product-specific discounts
CREATE TABLE IF NOT EXISTS discount_code_products (
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (discount_code_id, product_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_discount_code_products_discount_code_id ON discount_code_products(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_code_products_product_id ON discount_code_products(product_id);
