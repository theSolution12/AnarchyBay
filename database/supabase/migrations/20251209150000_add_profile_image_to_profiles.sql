-- Add profile image URL field to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create index for profile image lookups
CREATE INDEX IF NOT EXISTS idx_profiles_profile_image_url ON profiles(profile_image_url) WHERE profile_image_url IS NOT NULL;
