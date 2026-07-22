const fs = require('fs');
let code = fs.readFileSync('src/pages/user/UserOrderDetails.tsx', 'utf8');

code = code.replace(
  /<img loading="lazy" decoding="async" src=\{item\.image_url\} alt=\{item\.product_name\} className="w-full h-full object-cover" \/>/g,
  `<img loading="lazy" decoding="async" src={item.image_url} alt={item.product_name} title={item.product_name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Error'; }} />`
);

fs.writeFileSync('src/pages/user/UserOrderDetails.tsx', code);
console.log('UserOrderDetails updated');
