const fs = require('fs');

const fixFile = (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Replace CREATE POLICY "name" ON table with DROP POLICY IF EXISTS "name" ON table; \n CREATE POLICY ...
  content = content.replace(/CREATE POLICY "([^"]+)" ON (\w+)/g, (match, policyName, tableName) => {
    return `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};\n${match}`;
  });
  
  fs.writeFileSync(filepath, content);
};

fixFile('supabase/migrations/008_delivery_zones.sql');
try {
  fixFile('supabase-schema.sql');
} catch (e) {
  console.log(e);
}
console.log('Fixed policies');
