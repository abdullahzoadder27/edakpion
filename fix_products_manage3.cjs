const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProductsManage.tsx', 'utf8');

code = code.replace("const toggleStatus = async (id: string, currentStatus: string) => {", "const toggleStatus = async (id: string, currentStatus: boolean) => {");

// Also `{ ...p, status: newStatus }` should be `{ ...p, is_active: newStatus }`
code = code.replace("{ ...p, status: newStatus }", "{ ...p, is_active: newStatus }");

// And `{product.status === 'active' ? <CheckCircle` should be `{product.is_active ? <CheckCircle`
// Let's just fix the JSX part
code = code.replace(/\{product\.status === 'active' \? <CheckCircle/g, "{product.is_active ? <CheckCircle");
code = code.replace(/\{product\.status\}/g, "{product.is_active ? 'Active' : 'Inactive'}");

fs.writeFileSync('src/pages/admin/ProductsManage.tsx', code);
