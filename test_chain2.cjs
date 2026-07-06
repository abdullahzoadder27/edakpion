const t = { profiles: { full_name: null } };
try {
  const res = t.profiles?.full_name?.toLowerCase().includes('a');
  console.log('Result:', res);
} catch (err) {
  console.log('Error:', err.message);
}
