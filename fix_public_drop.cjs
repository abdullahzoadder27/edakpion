const fs = require('fs');

const fixFile = (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/DROP POLICY IF EXISTS "([^"]+)" ON public;\n/g, 'DROP POLICY IF EXISTS "$1" ON public.product_reviews;\n');
  fs.writeFileSync(filepath, content);
};

fixFile('supabase-schema.sql');
try {
  fixFile('supabase/migrations/005_product_reviews.sql');
} catch(e) {}
console.log('Fixed public drops');
