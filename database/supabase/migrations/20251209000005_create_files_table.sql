-- Create files table for digital product file storage
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'digital-products',
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_files_creator_id ON files(creator_id);
CREATE INDEX IF NOT EXISTS idx_files_storage_path ON files(storage_path);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
