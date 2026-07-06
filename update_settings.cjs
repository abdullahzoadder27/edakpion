const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/SettingsManage.tsx', 'utf8');

code = code.replace(/import \{ Save, Loader2 \} from 'lucide-react';/, `import { Save, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';`);

const logoUpload = `
<div>
  <label className="text-sm font-bold">Logo URL</label>
  <div className="flex gap-2 items-center">
    <input value={settings.general?.logo_url || ''} onChange={(e) => handleNestedChange('general', 'logo_url', e.target.value)} className="flex-1 border p-2 rounded-lg" />
    <label className="bg-gray-100 p-2 rounded-lg cursor-pointer hover:bg-gray-200" title="Upload Logo">
      <Upload className="w-5 h-5" />
      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];
        try {
          const ext = file.name.split('.').pop();
          const fileName = \`logo-\${Date.now()}.\${ext}\`;
          const { error } = await supabase.storage.from('site-content').upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage.from('site-content').getPublicUrl(fileName);
          handleNestedChange('general', 'logo_url', data.publicUrl);
        } catch (err: any) {
          alert('Upload failed: ' + err.message);
        }
      }} />
    </label>
  </div>
</div>
`;

const faviconUpload = `
<div>
  <label className="text-sm font-bold">Favicon URL</label>
  <div className="flex gap-2 items-center">
    <input value={settings.general?.favicon_url || ''} onChange={(e) => handleNestedChange('general', 'favicon_url', e.target.value)} className="flex-1 border p-2 rounded-lg" />
    <label className="bg-gray-100 p-2 rounded-lg cursor-pointer hover:bg-gray-200" title="Upload Favicon">
      <Upload className="w-5 h-5" />
      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];
        try {
          const ext = file.name.split('.').pop();
          const fileName = \`favicon-\${Date.now()}.\${ext}\`;
          const { error } = await supabase.storage.from('site-content').upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage.from('site-content').getPublicUrl(fileName);
          handleNestedChange('general', 'favicon_url', data.publicUrl);
        } catch (err: any) {
          alert('Upload failed: ' + err.message);
        }
      }} />
    </label>
  </div>
</div>
`;

code = code.replace(/<div><label className="text-sm font-bold">Logo URL<\/label><input value=\{settings\.general\?\.logo_url \|\| ''\} onChange=\{\(e\) => handleNestedChange\('general', 'logo_url', e\.target\.value\)\} className="w-full border p-2 rounded-lg" \/><\/div>/, logoUpload);
code = code.replace(/<div><label className="text-sm font-bold">Favicon URL<\/label><input value=\{settings\.general\?\.favicon_url \|\| ''\} onChange=\{\(e\) => handleNestedChange\('general', 'favicon_url', e\.target\.value\)\} className="w-full border p-2 rounded-lg" \/><\/div>/, faviconUpload);
// There is an issue where we are importing supabase again if it's already imported. Let's fix that.
code = code.replace(/import \{ supabase \} from '\.\.\/\.\.\/lib\/supabase';\nimport \{ supabase \} from '\.\.\/\.\.\/lib\/supabase';/, `import { supabase } from '../../lib/supabase';`);

fs.writeFileSync('src/pages/admin/SettingsManage.tsx', code);
