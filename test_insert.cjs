require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: { user }, error: authError } = await supabase.auth.signUp({
    email: 'newuser11@gmail.com',
    password: 'password123'
  });
  console.log('Auth:', user?.id, authError?.message);
  
  if (user) {
    // wait a moment for the trigger to insert the profile
    await new Promise(r => setTimeout(r, 1000));
    const { data: ticket, error: ticketError } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: 'Test ticket',
      priority: 'high',
      status: 'open'
    }).select().single();
    
    console.log('Ticket:', ticket?.id, ticketError?.message);
    
    if (ticket) {
      const { data, error } = await supabase.from('support_tickets').select('*, profiles!support_tickets_user_id_fkey(full_name)').eq('id', ticket.id).single();
      console.log('Keys:', data ? Object.keys(data) : 'none');
      console.log('Data:', data);
      console.log('Error:', error);
    }
  }
}
check();
