import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '.env'});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: userAuth, error: authError } = await supabase.auth.signUp({
    email: 'test_order@example.com',
    password: 'password123'
  });
  
  if (authError) {
    console.log("Auth error:", authError);
    // Maybe we can just login
    const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test_order@example.com',
        password: 'password123'
    });
    if (signInError) {
       console.log("SignIn error:", signInError);
       return;
    }
  }

  const { data: user } = await supabase.auth.getUser();
  const userId = user.user.id;
  console.log("User ID:", userId);

  const { data: addressData, error: addressError } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      full_name: 'Test User',
      phone_number: '1234567890',
      street_address: '123 Main St',
      area: 'Area 51',
      district: 'Nevada',
      is_default: true
    })
    .select('id')
    .single();
    
  if (addressError) {
    console.error("Address Error:", addressError);
    return;
  }
  
  const addressId = addressData.id;
  console.log("Address ID:", addressId);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: `ORD-${Date.now().toString().slice(-6)}-123`,
      total_amount: 100,
      status: 'pending',
      shipping_address: addressId,
      delivery_charge: null,
      payment_method: 'cod'
    })
    .select('id')
    .single();

  if (orderError) {
    console.error("Order Insert Error:", orderError);
    return;
  }
  console.log("Order Insert Success:", order);
}
run();
