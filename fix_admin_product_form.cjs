const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

// Update formData initial state
code = code.replace(/sku:\s*'',\s*status:\s*'active',/, 'is_active: true,');

// Remove features from state
code = code.replace(/const \[features, setFeatures\] = useState<string\[\]>\(\[''\]\);/, '');

// Update setFormData in fetchProduct
code = code.replace(/sku:\s*data\.sku \|\| '',\s*status:\s*data\.status \|\| 'active',/, 'is_active: data.is_active !== false,');

// Remove setFeatures
code = code.replace(/setFeatures\(data\.features\?\.length \? data\.features : \[''\]\);/, '');

// Remove feature change handlers
code = code.replace(/const handleFeatureChange = [\s\S]*?const removeFeature = .*?;/, '');

// Update payload
code = code.replace(/sku:\s*formData\.sku,\s*status:\s*formData\.status,/, 'is_active: formData.is_active,');
code = code.replace(/features:\s*features\.filter\(f => f\.trim\(\) !== ''\),/, '');

const skuBlock = `
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">SKU</label>
              <input 
                type="text" name="sku"
                value={formData.sku} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
            </div>
`;
code = code.replace(skuBlock.trim(), '');

const statusBlock = `
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Status</label>
              <select 
                name="status"
                value={formData.status} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
`;
const newStatusBlock = `
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Status</label>
              <select 
                name="is_active"
                value={formData.is_active ? 'true' : 'false'} 
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
`;
code = code.replace(statusBlock.trim(), newStatusBlock.trim());

// Features block
const fIdx = code.indexOf('<h2 className="text-lg font-bold text-[#0F3D2E]">Features</h2>');
if (fIdx !== -1) {
    const pIdx = code.lastIndexOf('<div className="bg-white', fIdx);
    if (pIdx !== -1) {
        const afterF = code.indexOf('<div className="flex justify-end gap-4">', fIdx);
        if (afterF !== -1) {
            code = code.substring(0, pIdx) + code.substring(afterF);
        }
    }
}

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', code);
