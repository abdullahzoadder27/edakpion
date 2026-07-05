const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://rxkpxsofkcucpjfbeofo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3B4c29ma2N1Y3BqZmJlb2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDQyODgsImV4cCI6MjA5ODc4MDI4OH0.NH0puarkd89SN9fmiVww5GMpvPcRfQ_RCSIB_GlT_x4'
);
(async () => {
  const { data, error } = await supabase.from('profiles').update({ role: 'admin' }).neq('role', 'admin').select();
  console.log('Updated profiles:', data);
  console.log('Error:', error);
})();
