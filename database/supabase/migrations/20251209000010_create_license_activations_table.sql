-- Create license activations table for tracking license key usage
CREATE TABLE IF NOT EXISTS license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_license_activations_purchase_id ON license_activations(purchase_id);
CREATE INDEX IF NOT EXISTS idx_license_activations_activated_at ON license_activations(activated_at);
CREATE INDEX IF NOT EXISTS idx_license_activations_ip_address ON license_activations(ip_address) WHERE ip_address IS NOT NULL;
