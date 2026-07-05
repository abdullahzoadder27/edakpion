const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir);

files.forEach(file => {
  if (file.endsWith('.sql')) {
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We need to match CREATE TRIGGER trigger_name ... ON table_name
    // A regex might be complex, let's look for CREATE TRIGGER
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
    
    toReplace.forEach(({ fullMatch, dropStmt }) => {
      newContent = newContent.replace(fullMatch, `${dropStmt}\n${fullMatch}`);
    });

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated triggers in ${file}`);
    }
  }
});
