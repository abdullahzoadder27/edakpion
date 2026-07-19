import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://alpougdeizdmuwxdevgw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscG91Z2RlaXpkbXV3eGRldmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjMxMDMsImV4cCI6MjA5ODgzOTEwM30.4TGlaLUAnCVFkp89V5X-SWeZ5bEksywLXnE5BnVNn_E';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  let res = await supabase.storage.from('site-content').upload('test.txt', 'hello');
  console.log('site-content error:', res.error?.message);
  res = await supabase.storage.from('blog-images').upload('test.txt', 'hello');
  console.log('blog-images error:', res.error?.message);
}
check();
