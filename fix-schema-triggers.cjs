const fs = require('fs');

let content = fs.readFileSync('supabase-schema.sql', 'utf8');

const regex = /CREATE\s+TRIGGER\s+([a-zA-Z0-9_]+)[\s\S]*?ON\s+([a-zA-Z0-9_\.]+)/g;

let newContent = content;
let match;
const toReplace = [];
while ((match = regex.exec(content)) !== null) {
  const fullMatch = match[0];
  const triggerName = match[1];
  const tableName = match[2];
  
  const dropStmt = `DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};`;
  if (!content.includes(dropStmt)) {
     toReplace.push({ fullMatch, dropStmt });
  }
}

for (let i = toReplace.length - 1; i >= 0; i--) {
  const { fullMatch, dropStmt } = toReplace[i];
  newContent = newContent.replace(fullMatch, `${dropStmt}\n${fullMatch}`);
}

if (newContent !== content) {
  fs.writeFileSync('supabase-schema.sql', newContent);
  console.log(`Updated triggers in supabase-schema.sql`);
} else {
  console.log(`No triggers needed update in supabase-schema.sql`);
}
