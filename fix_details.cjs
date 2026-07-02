const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

const oldConsoleLog = `      console.log("Creating order with payload:", orderPayload);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .single();`;

const newConsoleLog = `      console.log("Before request:", {
        customerData: user,
        cartItems: cartItems,
        totalPrice: total,
        deliveryCharge: delivery,
        paymentMethod: paymentMethod
      });
      console.log("Payload sent:", orderPayload);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .single();
        
      console.log("Supabase response (order):", { data: order, error: orderError });`;

content = content.replace(oldConsoleLog, newConsoleLog);

const oldConsoleItemsLog = `      console.log("Creating order items:", orderItemsToInsert);
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);`;

const newConsoleItemsLog = `      console.log("Creating order items:", orderItemsToInsert);
      
      const { data: itemsData, error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert).select();
      console.log("Supabase response (items):", { data: itemsData, error: itemsError });`;

content = content.replace(oldConsoleItemsLog, newConsoleItemsLog);

fs.writeFileSync('src/pages/Checkout.tsx', content);
