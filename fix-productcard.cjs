const fs = require('fs');
const file = 'src/components/ui/ProductCard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/product\.images\[0\]/g, '(product.images && product.images[0])');
content = content.replace(/product\.images\[1\]/g, '(product.images && product.images[1])');

fs.writeFileSync(file, content);
