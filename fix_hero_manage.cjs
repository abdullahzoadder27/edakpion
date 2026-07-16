const fs = require('fs');

const filepath = 'src/pages/admin/HeroSlidesManage.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Fix handleSave
const handleSaveRegex = /const payload = \{\s*\.\.\.formData,\s*start_date: formData\.start_date \? new Date\(formData\.start_date\)\.toISOString\(\) : null,\s*end_date: formData\.end_date \? new Date\(formData\.end_date\)\.toISOString\(\) : null,\s*is_active: \['Published', 'Draft'\]\.includes\(formData\.status\) \? formData\.is_active : false,\s*\};/;

const newHandleSave = `
      // Clean up unsupported columns from formData
      const {
        status,
        background_color,
        panel_color,
        ghost_text,
        animation_type,
        autoplay_duration,
        ...validData
      } = formData;

      const payload = {
        ...validData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: ['Published', 'Draft'].includes(formData.status) ? formData.is_active : false,
      };
`;

content = content.replace(handleSaveRegex, newHandleSave.trim());

// Fix handleUpdateStatus
const handleUpdateStatusRegex = /const \{ error \} = await supabase\.from\('hero_slides'\)\.update\(\{ status: newStatus \}\)\.eq\('id', id\);/;

const newHandleUpdateStatus = `
      // Map status to is_active since we don't have a status column in DB
      const is_active = newStatus === 'Published';
      const { error } = await supabase.from('hero_slides').update({ is_active }).eq('id', id);
`;

content = content.replace(handleUpdateStatusRegex, newHandleUpdateStatus.trim());

// We also need to fix where it renders slide.status in the table, it should probably be derived from is_active.
// slide.status || 'Published' 
// Let's replace:
// slide.status === 'Published' -> slide.is_active
// slide.status === 'Hidden' -> !slide.is_active

const statusBadgeRegex = /\{slide\.status \|\| 'Published'\}/;
content = content.replace(statusBadgeRegex, `{slide.is_active ? 'Published' : 'Hidden'}`);

const statusColorRegex = /className=\{\`inline-flex px-2 py-1 rounded-full text-xs font-medium\s*\$\{slide\.status === 'Published' \? 'bg-green-100 text-green-700' : ''\}\s*\$\{slide\.status === 'Draft' \? 'bg-yellow-100 text-yellow-700' : ''\}\s*\$\{slide\.status === 'Hidden' \? 'bg-gray-100 text-gray-700' : ''\}\s*\$\{slide\.status === 'Archived' \? 'bg-red-100 text-red-700' : ''\}\s*\`\}/;

const newStatusColor = `className={\`inline-flex px-2 py-1 rounded-full text-xs font-medium \${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}\`}`;

content = content.replace(statusColorRegex, newStatusColor);

const hideButtonRegex = /slide\.status === 'Hidden'/;
content = content.replace(hideButtonRegex, `!slide.is_active`);

fs.writeFileSync(filepath, content);
console.log('Fixed HeroSlidesManage');
