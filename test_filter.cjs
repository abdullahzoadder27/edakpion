const tickets = [{ id: '1', subject: null, profiles: { full_name: null } }];
const search = '';
const filtered = tickets.filter(t => {
  const matchSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || 
                      t.id.toLowerCase().includes(search.toLowerCase()) ||
                      t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
  return matchSearch;
});
console.log('Filtered length:', filtered.length);
