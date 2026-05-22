-- Create product files junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_files (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, file_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_product_files_product_id ON product_files(product_id);
CREATE INDEX IF NOT EXISTS idx_product_files_file_id ON product_files(file_id);
CREATE INDEX IF NOT EXISTS idx_product_files_variant_id ON product_files(variant_id) WHERE variant_id IS NOT NULL;
