const fs = require('fs');

const filepath = 'src/types/index.ts';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('admin_reply?: string;')) {
  content = content.replace(
    'admin_note?: string;',
    'admin_note?: string;\n  admin_reply?: string;'
  );
}

fs.writeFileSync(filepath, content);
console.log('Fixed types');
