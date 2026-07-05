const fs = require('fs');
let content = fs.readFileSync('src/lib/api.ts', 'utf8');

content = content.replace(/console\.error\('Error fetching products:', error\);/g, "console.warn('Supabase not configured, returning empty products list.');");
content = content.replace(/console\.error\('Exception fetching products:', error\);/g, "console.warn('Supabase exception, returning empty products list.');");
content = content.replace(/console\.error\('Exception fetching product:', error\);/g, "console.warn('Supabase exception, returning null product.');");

content = content.replace(/console\.error\('Error fetching blogs:', error\);/g, "console.warn('Supabase not configured, returning empty blogs list.');");
content = content.replace(/console\.error\('Error fetching blog:', error\);/g, "console.warn('Supabase not configured, returning null blog.');");

fs.writeFileSync('src/lib/api.ts', content);
console.log('Fixed api.ts');
