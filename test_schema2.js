import fetch from 'node-fetch';
async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const data = await res.json();
  console.log("Keys:", Object.keys(data));
  if (data.definitions) console.log("Definitions keys:", Object.keys(data.definitions));
}
run();
