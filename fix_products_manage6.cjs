const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProductsManage.tsx', 'utf8');

code = code.replace(/toggleStatus\(product\.id, product\.is_active \? 'active' : 'draft'\)/g, "toggleStatus(product.id, product.is_active)");

fs.writeFileSync('src/pages/admin/ProductsManage.tsx', code);
