-- Add payment provider fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_payment_provider TEXT DEFAULT 'stripe' CHECK (preferred_payment_provider IN ('stripe', 'dodo')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_merchant_id TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for payment provider lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON profiles(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_dodo_customer_id ON profiles(dodo_customer_id) WHERE dodo_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_dodo_merchant_id ON profiles(dodo_merchant_id) WHERE dodo_merchant_id IS NOT NULL;
