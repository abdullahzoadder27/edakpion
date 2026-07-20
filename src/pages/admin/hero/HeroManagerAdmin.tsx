import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save, Loader2, Layout, Type, Image as ImageIcon, Video, Box, Settings, Smartphone, LayoutTemplate } from 'lucide-react';

export default function HeroManagerAdmin() {
  const [activeTab, setActiveTab] = useState('publishing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    publishing: {
      is_enabled: true,
      status: 'published',
      start_date: '',
      end_date: ''
    },
    content: {
      badge: 'New Collection',
      main_heading: 'Premium Streetwear',
      highlight_text: 'Made to Stand Out',
      description: 'Discover the latest trends in urban fashion.',
      primary_btn_text: 'Shop Now',
      primary_btn_url: '/shop',
      secondary_btn_text: 'Play Video',
      secondary_btn_url: '#video'
    },
    products: {
      selection_mode: 'multiple',
      selected_product_ids: [] as string[]
    },
    media: {
      background_type: 'gradient',
      background_color: '#110E0C',
      background_image_url: '',
      enable_animated_shapes: true
    },
    video_button: {
      enabled: true,
      text: 'Watch Campaign',
      url: 'https://youtube.com',
      display_mode: 'modal'
    },
    layout: {
      desktop_layout: 'left',
      hero_height: '100vh',
      content_alignment: 'left'
    },
    animations: {
      enabled: true,
      speed: 'normal',
      floating_product: true,
      mouse_parallax: true
    },
    design: {
      primary_color: '#0F3D2E',
      accent_color: '#C89A2B',
      text_color: '#FFFFFF'
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, productsRes] = await Promise.all([
        supabase.from('store_settings').select('value').eq('key', 'hero_manager').maybeSingle(),
        supabase.from('products').select('id, name, images').eq('status', 'active')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (settingsRes.data?.value) {
        setFormData(prev => ({ ...prev, ...settingsRes.data.value }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('store_settings').select('id').eq('key', 'hero_manager').maybeSingle();
      if (existing) {
        await supabase.from('store_settings').update({ value: formData }).eq('key', 'hero_manager');
      } else {
        await supabase.from('store_settings').insert([{ key: 'hero_manager', value: formData }]);
      }
      alert('Hero settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof typeof formData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0F3D2E]" /></div>;

  const tabs = [
    { id: 'publishing', label: 'Publishing', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'content', label: 'Content', icon: <Type className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Box className="w-4 h-4" /> },
    { id: 'media', label: 'Media & Video', icon: <Video className="w-4 h-4" /> },
    { id: 'layout', label: 'Layout & Design', icon: <Layout className="w-4 h-4" /> },
    { id: 'animations', label: 'Animations', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Hero Manager CMS</h1>
          <p className="text-gray-600">Fully manage your dynamic Hero section elements without code.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#0F3D2E] text-white font-bold rounded-lg hover:bg-[#154636] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Publish Hero'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#0F3D2E] text-white shadow-lg shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-[#0F3D2E]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-white border border-[#E8E4DE] rounded-2xl p-8 backdrop-blur-sm">
          
          {activeTab === 'publishing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0F3D2E] border-b border-[#E8E4DE] pb-4">Publishing & Status</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enable Hero Section</label>
                  <select 
                    value={formData.publishing.is_enabled ? 'true' : 'false'}
                    onChange={e => handleChange('publishing', 'is_enabled', e.target.value === 'true')}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled (Hidden)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publish Status</label>
                  <select 
                    value={formData.publishing.status}
                    onChange={e => handleChange('publishing', 'status', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0F3D2E] border-b border-[#E8E4DE] pb-4">Content & Messaging</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Badge (Small Label)</label>
                  <input 
                    type="text" 
                    value={formData.content.badge}
                    onChange={e => handleChange('content', 'badge', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                    placeholder="e.g. New Collection"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
                  <textarea 
                    value={formData.content.main_heading}
                    onChange={e => handleChange('content', 'main_heading', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                    placeholder="Premium Streetwear"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    value={formData.content.description}
                    onChange={e => handleChange('content', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.content.description.length} characters (Recommended &lt; 150)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="p-4 border border-[#E8E4DE] rounded-xl bg-gray-50 space-y-4">
                  <h3 className="font-bold text-[#0F3D2E]">Primary Button</h3>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Text</label>
                    <input type="text" value={formData.content.primary_btn_text} onChange={e => handleChange('content', 'primary_btn_text', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E8E4DE] rounded text-sm text-[#0F3D2E]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">URL</label>
                    <input type="text" value={formData.content.primary_btn_url} onChange={e => handleChange('content', 'primary_btn_url', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E8E4DE] rounded text-sm text-[#0F3D2E]" />
                  </div>
                </div>

                <div className="p-4 border border-[#E8E4DE] rounded-xl bg-gray-50 space-y-4">
                  <h3 className="font-bold text-[#0F3D2E]">Secondary Button</h3>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Text</label>
                    <input type="text" value={formData.content.secondary_btn_text} onChange={e => handleChange('content', 'secondary_btn_text', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E8E4DE] rounded text-sm text-[#0F3D2E]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">URL</label>
                    <input type="text" value={formData.content.secondary_btn_url} onChange={e => handleChange('content', 'secondary_btn_url', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E8E4DE] rounded text-sm text-[#0F3D2E]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0F3D2E] border-b border-[#E8E4DE] pb-4">Featured Product Selection</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Selection Mode</label>
                <select 
                  value={formData.products.selection_mode}
                  onChange={e => handleChange('products', 'selection_mode', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                >
                  <option value="multiple">Select Multiple Products (Gallery / Slider)</option>
                  <option value="featured">Auto-fetch Featured Products</option>
                  <option value="new_arrival">Auto-fetch New Arrivals</option>
                </select>
              </div>

              {formData.products.selection_mode === 'multiple' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Hero Products (Click to toggle)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {products.map(p => {
                      const isSelected = formData.products.selected_product_ids.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => {
                            const newIds = isSelected 
                              ? formData.products.selected_product_ids.filter(id => id !== p.id)
                              : [...formData.products.selected_product_ids, p.id];
                            handleChange('products', 'selected_product_ids', newIds);
                          }}
                          className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-[#0F3D2E] ring-4 ring-[#0F3D2E]/20' : 'border-[#E8E4DE] hover:border-gray-400'}`}
                        >
                          <img src={p.images?.[0]} alt={p.name} className="w-full aspect-square object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
                            <span className="text-xs font-bold text-[#0F3D2E] truncate">{p.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#0F3D2E] text-white text-xs font-bold px-2 py-1 rounded">Selected</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0F3D2E] border-b border-[#E8E4DE] pb-4">Media & Video Manager</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
                  <select 
                    value={formData.media.background_type}
                    onChange={e => handleChange('media', 'background_type', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                  >
                    <option value="solid">Solid Color</option>
                    <option value="gradient">Gradient</option>
                    <option value="image">Background Image</option>
                    <option value="video">Background Video</option>
                  </select>
                </div>
                
                {formData.media.background_type === 'solid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={formData.media.background_color} onChange={e => handleChange('media', 'background_color', e.target.value)} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                      <input type="text" value={formData.media.background_color} onChange={e => handleChange('media', 'background_color', e.target.value)} className="flex-1 px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border border-[#E8E4DE] rounded-xl bg-gray-50 space-y-4 mt-6">
                <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-4">
                  <h3 className="font-bold text-[#0F3D2E] flex items-center gap-2"><Video className="w-5 h-5 text-[#0F3D2E]"/> Play Video Button</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm text-gray-700">Enable</span>
                    <input type="checkbox" checked={formData.video_button.enabled} onChange={e => handleChange('video_button', 'enabled', e.target.checked)} className="w-5 h-5 accent-[#0F3D2E]" />
                  </label>
                </div>
                
                {formData.video_button.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                      <input type="text" value={formData.video_button.text} onChange={e => handleChange('video_button', 'text', e.target.value)} className="w-full px-4 py-2 bg-white border border-[#E8E4DE] rounded text-[#0F3D2E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Video URL (YouTube, Vimeo, MP4)</label>
                      <input type="text" value={formData.video_button.url} onChange={e => handleChange('video_button', 'url', e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-2 bg-white border border-[#E8E4DE] rounded text-[#0F3D2E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Display Mode</label>
                      <select value={formData.video_button.display_mode} onChange={e => handleChange('video_button', 'display_mode', e.target.value)} className="w-full px-4 py-2 bg-white border border-[#E8E4DE] rounded text-[#0F3D2E]">
                        <option value="modal">Open Popup Modal</option>
                        <option value="new_tab">Open in New Tab</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0F3D2E] border-b border-[#E8E4DE] pb-4">Layout & Design</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Desktop Layout</label>
                  <select 
                    value={formData.layout.desktop_layout}
                    onChange={e => handleChange('layout', 'desktop_layout', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                  >
                    <option value="left">Text Left, Product Right</option>
                    <option value="right">Product Left, Text Right</option>
                    <option value="center">Center Stacked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Alignment</label>
                  <select 
                    value={formData.layout.content_alignment}
                    onChange={e => handleChange('layout', 'content_alignment', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E]"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Center Aligned</option>
                  </select>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-[#0F3D2E] mt-8 mb-4 border-b border-[#E8E4DE] pb-2">Brand Colors</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Primary Color</label>
                  <input type="color" value={formData.design.primary_color} onChange={e => handleChange('design', 'primary_color', e.target.value)} className="w-full h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Accent Color</label>
                  <input type="color" value={formData.design.accent_color} onChange={e => handleChange('design', 'accent_color', e.target.value)} className="w-full h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Text Color</label>
                  <input type="color" value={formData.design.text_color} onChange={e => handleChange('design', 'text_color', e.target.value)} className="w-full h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'animations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0F3D2E] border-b border-[#E8E4DE] pb-4">Animations & Effects</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-[#E8E4DE] rounded-xl cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" checked={formData.animations.enabled} onChange={e => handleChange('animations', 'enabled', e.target.checked)} className="w-5 h-5 accent-[#0F3D2E]" />
                  <div>
                    <div className="font-bold text-[#0F3D2E]">Enable Animations</div>
                    <div className="text-xs text-gray-500">Master switch for all GSAP/Framer animations</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-[#E8E4DE] rounded-xl cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" checked={formData.animations.floating_product} onChange={e => handleChange('animations', 'floating_product', e.target.checked)} className="w-5 h-5 accent-[#0F3D2E]" />
                  <div>
                    <div className="font-bold text-[#0F3D2E]">Floating Product Effect</div>
                    <div className="text-xs text-gray-500">Product image gently floats up and down</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-[#E8E4DE] rounded-xl cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" checked={formData.animations.mouse_parallax} onChange={e => handleChange('animations', 'mouse_parallax', e.target.checked)} className="w-5 h-5 accent-[#0F3D2E]" />
                  <div>
                    <div className="font-bold text-[#0F3D2E]">Mouse Parallax (3D)</div>
                    <div className="text-xs text-gray-500">Product rotates slightly based on mouse position</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-[#E8E4DE] rounded-xl cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" checked={formData.media.enable_animated_shapes} onChange={e => handleChange('media', 'enable_animated_shapes', e.target.checked)} className="w-5 h-5 accent-[#0F3D2E]" />
                  <div>
                    <div className="font-bold text-[#0F3D2E]">Animated Background Shapes</div>
                    <div className="text-xs text-gray-500">Show slow-moving gradient blur shapes in the background</div>
                  </div>
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
