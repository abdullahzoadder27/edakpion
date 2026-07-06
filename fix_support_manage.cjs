const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/SupportManage.tsx', 'utf8');

content = content.replace(
  "select('*, profiles(full_name)')",
  "select('*, profiles!support_tickets_user_id_fkey(full_name)')"
);

fs.writeFileSync('src/pages/admin/SupportManage.tsx', content);
