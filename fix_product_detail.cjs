const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf8');

code = code.replace(/<tr className="border-b"><td className="py-3 font-bold w-1\/3">SKU<\/td><td className="py-3">\{product\.sku \|\| 'N\/A'\}<\/td><\/tr>/, '');
code = code.replace(/\{product\.features && product\.features\.length > 0 && \(/, '{product.tags && product.tags.length > 0 && (');
code = code.replace(/\{product\.features\.map\(\(f, i\) =>/g, '{product.tags.map((f, i) =>');
code = code.replace(/\{\/\* Features \*\/\}/g, '{/* Tags */}');

fs.writeFileSync('src/pages/ProductDetail.tsx', code);
