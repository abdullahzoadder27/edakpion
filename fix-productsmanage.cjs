const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProductsManage.tsx', 'utf8');

code = code.replace(
  /<img loading="lazy" decoding="async" src=\{product\.images\[0\]\} alt=\{product\.name\} className="w-full h-full object-cover" \/>/g,
  `<img loading="lazy" decoding="async" src={product.images[0]} alt={product.name} title={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Error'; }} />`
);

fs.writeFileSync('src/pages/admin/ProductsManage.tsx', code);
console.log('ProductsManage updated');
