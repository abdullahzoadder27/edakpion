require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seed() {
  const { data: { user }, error: authError } = await supabase.auth.signUp({
    email: 'testuser9999@gmail.com',
    password: 'password123'
  });
  console.log('Auth error:', authError);
  
  if (user) {
    const { data, error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: 'Test ticket',
      priority: 'high',
      status: 'open'
    }).select();
    console.log('Inserted:', data, error);
  }
}
seed();
