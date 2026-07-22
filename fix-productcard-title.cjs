const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ProductCard.tsx', 'utf8');

code = code.replace(
  /alt=\{product\.name\}/g,
  'alt={product.name} title={product.name}'
);

fs.writeFileSync('src/components/ui/ProductCard.tsx', code);
console.log('ProductCard titles updated');
