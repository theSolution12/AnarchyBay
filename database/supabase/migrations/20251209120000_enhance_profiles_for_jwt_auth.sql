-- Add password_hash column for JWT authentication
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add password reset fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;

-- Update role check to include 'creator' role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('customer', 'seller', 'creator'));

-- Create index for password reset token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_password_reset_token ON profiles(password_reset_token);
