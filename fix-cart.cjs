const fs = require('fs');
let code = fs.readFileSync('src/pages/Cart.tsx', 'utf8');

code = code.replace(
  /<img loading="lazy" decoding="async" src=\{item\.product\.images\[0\]\} alt=\{item\.product\.name\} className="w-full h-full object-cover" \/>/g,
  `<img loading="lazy" decoding="async" src={item.product.images[0] || 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=No+Image'} alt={item.product.name} title={item.product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Error'; }} />`
);

fs.writeFileSync('src/pages/Cart.tsx', code);
console.log('Cart updated');
