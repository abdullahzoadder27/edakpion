const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(/  status\?: string;\n/g, '');
code = code.replace(/  sku\?: string;\n/g, '');
code = code.replace(/  features\?: string\[\];\n/g, '');
fs.writeFileSync('src/types/index.ts', code);

code = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');
// There was a SKU input labeled "SKU (Optional)"
const skuRegex = /<div className="space-y-2">\s*<label className="text-sm font-bold text-gray-700">SKU \(Optional\)<\/label>\s*<input\s*type="text" name="sku"\s*value=\{formData\.sku\} onChange=\{handleChange\}\s*className="w-full px-4 py-2 bg-gray-50 border border-\[\#E8E4DE\] rounded-xl focus:outline-none focus:ring-2 focus:ring-\[\#0F3D2E\]\/20"\s*\/>\s*<\/div>/g;
code = code.replace(skuRegex, '');

// Also remove from formData if still there
code = code.replace(/sku:\s*'',/g, '');
code = code.replace(/sku:\s*data\.sku \|\| '',/g, '');
code = code.replace(/sku:\s*formData\.sku,/g, '');

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', code);
