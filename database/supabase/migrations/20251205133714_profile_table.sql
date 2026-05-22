CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
