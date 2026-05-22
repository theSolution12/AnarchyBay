import { supabase } from './src/lib/supabase.js';

async function checkBuckets() {
  console.log('Checking Supabase Storage buckets...\n');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }

  if (buckets && buckets.length > 0) {
    console.log('Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public}, created: ${bucket.created_at})`);
    });
  } else {
    console.log('No buckets found.');
    console.log('\nPlease create a bucket in Supabase Dashboard:');
    console.log('1. Go to Storage in your Supabase dashboard');
    console.log('2. Create a new bucket named "profile-images"');
    console.log('3. Make it public');
    console.log('4. Set file size limit to 5MB');
  }
}

checkBuckets().catch(console.error);
