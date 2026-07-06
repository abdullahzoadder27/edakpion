const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/OrdersManage.tsx', 'utf8');
code = code.replace(/\/\/ console\.warn\('Error fetching orders:', err\);/, "console.warn('Error fetching orders:', err);");
fs.writeFileSync('src/pages/admin/OrdersManage.tsx', code);
