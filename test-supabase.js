import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxkpxsofkcucpjfbeofo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3B4c29ma2N1Y3BqZmJlb2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDQyODgsImV4cCI6MjA5ODc4MDI4OH0.NH0puarkd89SN9fmiVww5GMpvPcRfQ_RCSIB_GlT_x4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: pData, error: pErr } = await supabase.from('products').select('*');
  console.log('Products:', pData?.length, pErr);
  const { data: bData, error: bErr } = await supabase.from('blogs').select('*');
  console.log('Blogs:', bData?.length, bErr);
}
test();
