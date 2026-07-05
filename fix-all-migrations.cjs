const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir);

files.forEach(file => {
  if (file.endsWith('.sql')) {
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace 'CREATE POLICY "..." ON table_name FOR ...'
    // with 'DROP POLICY IF EXISTS "..." ON table_name;\nCREATE POLICY "..." ON table_name FOR ...'
    
    // We need to match CREATE POLICY "..." ON schema.table
    const regex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_\.]+)/g;
    
    // To avoid replacing things repeatedly if we run this script multiple times,
    // let's do a more careful replace.
    let newContent = content;
    let match;
    const toReplace = [];
    while ((match = regex.exec(content)) !== null) {
      const fullMatch = match[0];
      const policyName = match[1];
      const tableName = match[2];
      
      const dropStmt = `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`;
      if (!content.includes(dropStmt)) {
         toReplace.push({ fullMatch, dropStmt });
      }
    }
    
    // Go backwards to not mess up indices, actually we can just replace all occurrences
    toReplace.forEach(({ fullMatch, dropStmt }) => {
      newContent = newContent.replace(fullMatch, `${dropStmt}\n${fullMatch}`);
    });

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${file}`);
    }
  }
});
