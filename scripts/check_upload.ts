import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://alpougdeizdmuwxdevgw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscG91Z2RlaXpkbXV3eGRldmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjMxMDMsImV4cCI6MjA5ODgzOTEwM30.4TGlaLUAnCVFkp89V5X-SWeZ5bEksywLXnE5BnVNn_E';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data } = supabase.storage.from('product-images').getPublicUrl('test');
  console.log(data);
  // Let's try inserting a fake file
  const { error } = await supabase.storage.from('product-images').upload('test.txt', 'hello');
  console.log('Upload error:', error?.message);
}
check();
