const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

const findTryBlock = `    setPlacingOrder(true);
    try {
      const orderPayload = {`;

// Replace from this line downwards to the end of the try block
// I'll just rewrite the handlePlaceOrder again to ensure it's perfectly correct.

const targetFunctionRegex = /const handlePlaceOrder = async \(\) => \{[\s\S]*?finally \{\s*setPlacingOrder\(false\);\s*\}\s*\};/;

const replacement = `const handlePlaceOrder = async () => {
    if (!user || !supabase || cartItems.length === 0) return;
    
    let finalAddressId = selectedAddressId;
    let finalAddress = addresses.find(a => a.id === selectedAddressId);

    if (!finalAddressId) {
      if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city) {
        alert("Please fill in all required shipping address fields.");
        return;
      }
      
      setPlacingOrder(true);
      try {
        const addressToInsert = {
            user_id: user.id,
            full_name: newAddress.full_name,
            phone_number: newAddress.phone,
            street_address: newAddress.address_line1 + (newAddress.notes ? \`, Notes: \${newAddress.notes}\` : ''),
            area: newAddress.area || newAddress.city,
            district: newAddress.district || newAddress.city,
            is_default: addresses.length === 0
        };

        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .insert(addressToInsert)
          .select('*')
          .single();
          
        if (addressError) throw addressError;
        
        finalAddress = addressData;
        finalAddressId = addressData?.id;
        
        if (!finalAddressId) {
          throw new Error("Could not retrieve the saved address ID");
        }
        setSelectedAddressId(finalAddressId);
      } catch (err) {
        console.error("Error creating address:", err);
        alert(\`Failed to save address: \${err.message || JSON.stringify(err)}\`);
        setPlacingOrder(false);
        return;
      }
    }
    
    setPlacingOrder(true);
    
    console.log("Before request:", {
        customerData: user,
        cartItems: cartItems,
        totalPrice: total,
        deliveryCharge: delivery,
        paymentMethod: paymentMethod
    });

    try {
      const orderPayload = {
          user_id: user.id,
          order_number: \`ORD-\${Date.now().toString().slice(-6)}-\${Math.floor(Math.random() * 1000)}\`,
          total_amount: total,
          subtotal: subtotal,
          tax_amount: tax,
          status: 'pending',
          shipping_address: finalAddress || { id: finalAddressId },
          billing_address: finalAddress || { id: finalAddressId },
          delivery_charge: delivery,
          payment_method: paymentMethod
      };
      
      console.log("Payload sent:", orderPayload);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .single();
        
      console.log("Supabase response (order):", { data: order, error: orderError });
      
      if (orderError) throw orderError;
      
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products.id || item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: item.products.price,
        total_price: item.products.price * item.quantity,
        product_name: item.products.name
      }));
      
      console.log("Payload sent (items):", orderItemsToInsert);
      
      const { data: itemsData, error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert).select();
      
      console.log("Supabase response (items):", { data: itemsData, error: itemsError });
      
      if (itemsError) throw itemsError;
      
      await clearCart();
      
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (err: any) {
      console.error("Error placing order:", err);
      console.error("Order Insert Error Object:", err);
      alert("Failed to place order: " + (err.message || JSON.stringify(err))); 
    } finally {
      setPlacingOrder(false);
    }
  };`;

content = content.replace(targetFunctionRegex, replacement);
fs.writeFileSync('src/pages/Checkout.tsx', content);
