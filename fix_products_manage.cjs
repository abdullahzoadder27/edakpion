const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProductsManage.tsx', 'utf8');

code = code.replace(/product\.status === 'active'/g, "product.is_active");
code = code.replace(/product\.status/g, "product.is_active ? 'active' : 'draft'");
code = code.replace(/currentStatus === 'active' \? 'draft' : 'active'/g, "!(currentStatus === 'true' || currentStatus === true)");
code = code.replace(/update\(\{ status: newStatus \}\)/g, "update({ is_active: newStatus })");
code = code.replace(/\{\\s*\\.\\.\\.p, status: newStatus \\}/g, "{ ...p, is_active: newStatus }");
// There is an issue where we are converting the string 'active' to boolean in toggleStatus

// The function is:
// const toggleStatus = async (id: string, currentStatus: string) => { ... }
code = code.replace(/const toggleStatus = async \\(id: string, currentStatus: string\\) => \\{/g, "const toggleStatus = async (id: string, currentStatus: boolean) => {");

fs.writeFileSync('src/pages/admin/ProductsManage.tsx', code);
