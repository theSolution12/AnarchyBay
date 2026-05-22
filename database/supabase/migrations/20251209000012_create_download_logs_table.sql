-- Create download logs table for analytics and security
CREATE TABLE IF NOT EXISTS download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for efficient queries and analytics
CREATE INDEX IF NOT EXISTS idx_download_logs_purchase_id ON download_logs(purchase_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_file_id ON download_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON download_logs(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_download_logs_ip_address ON download_logs(ip_address) WHERE ip_address IS NOT NULL;
