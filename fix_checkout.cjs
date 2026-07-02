const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

const targetOrder = `        .insert({
          user_id: user.id,
          order_number: \`ORD-\${Date.now().toString().slice(-6)}-\${Math.floor(Math.random() * 1000)}\`,
          total_amount: total,
          status: 'pending',
          shipping_address_id: finalAddressId,
          delivery_charge_id: selectedDeliveryChargeId || null,
          payment_method: paymentMethod
        })`;

const replaceOrder = `        .insert({
          user_id: user.id,
          order_number: \`ORD-\${Date.now().toString().slice(-6)}-\${Math.floor(Math.random() * 1000)}\`,
          total_amount: total,
          status: 'pending',
          shipping_address: finalAddressId,
          delivery_charge: selectedDeliveryChargeId || null,
          payment_method: paymentMethod
        })`;

content = content.replace(targetOrder, replaceOrder);

const targetItems = `      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products.id || item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        price: item.products.price
      }));`;

const replaceItems = `      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products.id || item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: item.products.price,
        total_price: item.products.price * item.quantity,
        product_name: item.products.name
      }));`;

content = content.replace(targetItems, replaceItems);

fs.writeFileSync('src/pages/Checkout.tsx', content);
