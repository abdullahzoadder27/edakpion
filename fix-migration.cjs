const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/005_admin_roles.sql', 'utf8');

content = content.replace(
  'CREATE POLICY "Public read access for roles"',
  'DROP POLICY IF EXISTS "Public read access for roles" ON public.roles;\nCREATE POLICY "Public read access for roles"'
);

content = content.replace(
  'CREATE POLICY "Admin full access roles"',
  'DROP POLICY IF EXISTS "Admin full access roles" ON public.roles;\nCREATE POLICY "Admin full access roles"'
);

content = content.replace(
  'CREATE POLICY "Admin read own record"',
  'DROP POLICY IF EXISTS "Admin read own record" ON public.admins;\nCREATE POLICY "Admin read own record"'
);

content = content.replace(
  'CREATE POLICY "Admin full access admins"',
  'DROP POLICY IF EXISTS "Admin full access admins" ON public.admins;\nCREATE POLICY "Admin full access admins"'
);

fs.writeFileSync('supabase/migrations/005_admin_roles.sql', content);
