-- Create payouts table for creator earnings
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'dodo')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payout_id TEXT,
  dodo_payout_id TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_payouts_creator_id ON payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_payment_provider ON payouts(payment_provider);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at);
CREATE INDEX IF NOT EXISTS idx_payouts_stripe_payout_id ON payouts(stripe_payout_id) WHERE stripe_payout_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payouts_dodo_payout_id ON payouts(dodo_payout_id) WHERE dodo_payout_id IS NOT NULL;
