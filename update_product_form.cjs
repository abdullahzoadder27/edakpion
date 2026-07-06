const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

// Add upload state
code = code.replace(/const \[images, setImages\] = useState<string\[\]>\(\[\]\);/, `const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);`);

const imageUploadBlock = `
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#0F3D2E]">Product Images</h2>
              
              <div className="flex flex-wrap gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative w-24 h-24 border border-[#E8E4DE] rounded-xl overflow-hidden group">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImageUrl(index)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <label className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      setUploading(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = \`\${Math.random()}.\${fileExt}\`;
                        const { error: uploadError } = await supabase.storage
                          .from('product-images')
                          .upload(fileName, file);
                        
                        if (uploadError) throw uploadError;
                        
                        const { data } = supabase.storage
                          .from('product-images')
                          .getPublicUrl(fileName);
                          
                        if (data?.publicUrl) {
                          setImages([...images, data.publicUrl]);
                        }
                      } catch (err: any) {
                        alert(err.message || 'Error uploading image');
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading}
                  />
                </label>
                
                <button type="button" onClick={addImageUrl} className="text-sm font-bold text-[#0F3D2E] hover:underline">
                  + Add URL Instead
                </button>
              </div>

              {/* URL Inputs */}
              {images.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="url" placeholder="https://example.com/image.jpg"
                    value={img} onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                  <button type="button" onClick={() => removeImageUrl(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {images.length === 0 && <p className="text-sm text-gray-500">No images added yet.</p>}
            </div>
`;

// Replace the existing Images (URLs) section
code = code.replace(/<h2 className="text-lg font-bold text-\[#0F3D2E\]">Images \(URLs\)<\/h2>[\s\S]*?\{images\.length === 0 && <p className="text-sm text-gray-500">No images added yet\.<\/p>\}/, imageUploadBlock.trim());

// Import Upload from lucide-react
code = code.replace(/import \{ ArrowLeft, Save, Plus, Trash2 \} from 'lucide-react';/, `import { ArrowLeft, Save, Plus, Trash2, Upload, Loader2 } from 'lucide-react';`);

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', code);
