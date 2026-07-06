const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProductsManage.tsx', 'utf8');

code = code.replace(/const newStatus = !\(currentStatus === 'true' \|\| currentStatus === true\);/g, "const newStatus = !currentStatus;");

fs.writeFileSync('src/pages/admin/ProductsManage.tsx', code);
