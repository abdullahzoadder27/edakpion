const fs = require('fs');
const file = 'src/pages/ProductDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const imgs = Array\.from\(new Set\(\(productData\.images \|\| \[\]\)\.filter\(\(img: any\) => typeof img === 'string' && img\.trim\(\) !== ''\)\)\);/,
  `const imgs = Array.from(new Set((productData.images || []).filter((img: any) => typeof img === 'string' && img.trim() !== ''))) as string[];`
);

fs.writeFileSync(file, content);
console.log('File updated');
