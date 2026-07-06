const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
code = code.replace(/fetchpriority="high"/, 'fetchPriority="high"');
fs.writeFileSync('src/pages/Home.tsx', code);
