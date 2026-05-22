import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupStorage() {
  console.log('Setting up Supabase Storage buckets...');

  // Create profile-images bucket
  const { data: profileBucket, error: profileError } = await supabase.storage.createBucket('profile-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });

  if (profileError) {
    if (profileError.message.includes('already exists')) {
      console.log('✓ profile-images bucket already exists');
    } else {
      console.error('Error creating profile-images bucket:', profileError);
    }
  } else {
    console.log('✓ Created profile-images bucket');
  }

  // Create digital-products bucket for future use
  const { data: productsBucket, error: productsError } = await supabase.storage.createBucket('digital-products', {
    public: false,
    fileSizeLimit: 104857600, // 100MB
  });

  if (productsError) {
    if (productsError.message.includes('already exists')) {
      console.log('✓ digital-products bucket already exists');
    } else {
      console.error('Error creating digital-products bucket:', productsError);
    }
  } else {
    console.log('✓ Created digital-products bucket');
  }

  console.log('\nStorage setup complete!');
}

setupStorage().catch(console.error);
