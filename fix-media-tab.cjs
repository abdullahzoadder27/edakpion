const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

const mediaTabRegex = /\{\/\* TAB: MEDIA \*\/\}[\s\S]*?\{\/\* TAB: PRICING & INVENTORY \*\/\}/;
const newMediaTab = `{/* TAB: MEDIA */}
            {activeTab === 'media' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8E4DE] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Product Images (URLs)</h2>
                  <span className="text-sm text-gray-500">{images.length} images added</span>
                </div>
                
                <div className="space-y-6">
                  <p className="text-sm text-gray-500 mb-4">Paste direct image URLs (JPG, PNG, WEBP). The first image is the primary featured image.</p>
                  
                  <div className="space-y-4">
                    {images.map((img, index) => (
                      <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-[#E8E4DE]">
                        <div className="w-24 h-32 shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                          {img ? (
                            <img 
                              src={img} 
                              alt={\`Preview \${index + 1}\`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Invalid+URL';
                              }}
                            />
                          ) : (
                            <div className="text-xs text-gray-400 text-center p-2">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 uppercase">
                              {index === 0 ? 'Primary Image URL' : \`Gallery Image \${index} URL\`}
                            </label>
                            <div className="flex items-center gap-1">
                              <button 
                                type="button" 
                                onClick={() => moveImage(index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 text-gray-400 hover:text-[#0F3D2E] hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button 
                                type="button" 
                                onClick={() => moveImage(index, 'down')}
                                disabled={index === images.length - 1}
                                className="p-1.5 text-gray-400 hover:text-[#0F3D2E] hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <button 
                                type="button" 
                                onClick={() => removeImage(index)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <input 
                            type="url" 
                            value={img}
                            onChange={(e) => {
                              const newImages = [...images];
                              newImages[index] = e.target.value;
                              setImages(newImages);
                            }}
                            placeholder="https://example.com/image.webp"
                            className="w-full px-3 py-2 bg-white border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setImages([...images, ''])}
                    className="w-full py-4 border-2 border-dashed border-[#E8E4DE] rounded-xl text-gray-500 font-medium hover:border-[#0F3D2E] hover:text-[#0F3D2E] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Image URL
                  </button>

                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      <strong>Pro tip:</strong> Use high-quality WebP images with a 3:4 aspect ratio (e.g. 1200x1600px) from a fast CDN. Make sure the URLs are publicly accessible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRICING & INVENTORY */}`;

code = code.replace(mediaTabRegex, newMediaTab);
fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', code);
console.log('Media tab updated');
