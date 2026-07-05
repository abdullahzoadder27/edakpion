const fs = require('fs');
let content = fs.readFileSync('src/lib/store.ts', 'utf8');

content = content.replace(
  "const dbMatch = dbCartItems?.find(dbItem =>",
  "const dbMatch = (dbCartItems as any[])?.find((dbItem: any) =>"
);

content = content.replace(
  "dbItem.product.id ===",
  "(Array.isArray(dbItem.product) ? dbItem.product[0].id : dbItem.product?.id) ==="
);

fs.writeFileSync('src/lib/store.ts', content);
