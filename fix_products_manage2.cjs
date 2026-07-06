const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProductsManage.tsx', 'utf8');

code = code.replace(/const toggleStatus = async \\(id: string, currentStatus: string\\) => \\{/g, "const toggleStatus = async (id: string, currentStatus: boolean) => {");

fs.writeFileSync('src/pages/admin/ProductsManage.tsx', code);
