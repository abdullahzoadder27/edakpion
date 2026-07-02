import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const email = 'test_user_' + Date.now() + '@gmail.com'; // Use gmail so it passes validation if possible
  const { data: userAuth, error: authError } = await supabase.auth.signUp({
    email: email,
    password: 'password123'
  });
  
  if (authError) {
    console.log("Auth error:", authError);
    return;
  }
  
  const userId = userAuth.user.id;
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
    .select('*')
    .single();
    
  if (addressError) {
    console.error("Address Error:", addressError);
    return;
  }
  
  const addressId = addressData.id;
  console.log("Address ID:", addressId);

  const orderPayload = {
      user_id: userId,
      order_number: `ORD-${Date.now().toString().slice(-6)}-123`,
      total_amount: 100,
      subtotal: 90,
      tax_amount: 10,
      status: 'pending',
      shipping_address: addressData,
      billing_address: addressData,
      delivery_charge: 0,
      payment_method: 'cod'
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select('id')
    .single();

  if (orderError) {
    console.error("Order Insert Error:", orderError);
    return;
  }
  console.log("Order Insert Success:", order);
}
run();
