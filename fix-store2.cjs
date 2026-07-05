const fs = require('fs');
let content = fs.readFileSync('src/lib/store.ts', 'utf8');

content = content.replace(
  "id: `${dbItem.product.id}-${dbItem.selected_size}-${dbItem.selected_color}-${Date.now()}`,",
  "id: `${(Array.isArray(dbItem.product) ? dbItem.product[0] : dbItem.product).id}-${dbItem.selected_size}-${dbItem.selected_color}-${Date.now()}`,"
);

content = content.replace(
  "product: dbItem.product,",
  "product: Array.isArray(dbItem.product) ? dbItem.product[0] : dbItem.product,"
);

fs.writeFileSync('src/lib/store.ts', content);
