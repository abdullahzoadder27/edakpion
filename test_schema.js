import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const data = await res.json();
  const orders = data.definitions.orders.properties;
  const order_items = data.definitions.order_items.properties;
  console.log("Orders schema:", Object.keys(orders));
  console.log("Order Items schema:", Object.keys(order_items));
}
run();
