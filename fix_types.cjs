const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(/\\s*status\\?: string;/, '');
code = code.replace(/\\s*sku\\?: string;/, '');
code = code.replace(/\\s*features\\?: string\\[\\];/, '');

fs.writeFileSync('src/types/index.ts', code);
