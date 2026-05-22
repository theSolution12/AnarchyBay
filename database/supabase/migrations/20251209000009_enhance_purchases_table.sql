-- Drop the old profile_products table as we're replacing it with a proper purchases table
DROP TABLE IF EXISTS profile_products CASCADE;

-- Create comprehensive purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'dodo')),
  stripe_payment_intent_id TEXT,
  dodo_transaction_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_fee NUMERIC(10, 2) DEFAULT 0,
  creator_earnings NUMERIC(10, 2) NOT NULL,
  license_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  refunded_at TIMESTAMPTZ,
  CONSTRAINT payment_id_check CHECK (
    (payment_provider = 'stripe' AND stripe_payment_intent_id IS NOT NULL) OR
    (payment_provider = 'dodo' AND dodo_transaction_id IS NOT NULL)
  )
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_variant_id ON purchases(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_license_key ON purchases(license_key);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_provider ON purchases(payment_provider);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_payment_intent_id ON purchases(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_dodo_transaction_id ON purchases(dodo_transaction_id) WHERE dodo_transaction_id IS NOT NULL;
