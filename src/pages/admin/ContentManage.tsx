import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2 } from 'lucide-react';

export default function ContentManage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    hero: {
      heading: 'Discover the Art of Minimalist Fashion',
      subheading: 'Premium apparel crafted for the modern individual.',
      button_text: 'Shop Collection',
      button_link: '/shop',
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    },
    about: {
      heading: 'Why Choose Us?',
      description: 'We source the finest materials to bring you unparalleled comfort and style.',
      image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    seo: {
      title: 'EDAKPION | Premium Minimalist Fashion',
      description: 'Shop the latest collection of premium minimalist fashion.',
      keywords: 'fashion, clothing, minimal, premium, edakpion'
    }
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'homepage_cms').single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
      if (data && data.value) {
        setSettings(data.value);
      }
    } catch (err) {
      console.warn('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNestedChange = (section: string, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('store_settings').upsert({
        key: 'homepage_cms',
        value: settings
      }, { onConflict: 'key' });
      
      if (error) throw error;
      alert('Homepage content updated successfully!');
    } catch (err: any) {
      alert(`Error saving content: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Homepage Content</h1>
        <button 
          onClick={saveContent}
          disabled={saving}
          className="bg-[#0F3D2E] text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-[#154636] font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Section */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">Hero Section</h2>
          <div><label className="text-sm font-bold">Heading</label><input value={settings.hero?.heading || ''} onChange={(e) => handleNestedChange('hero', 'heading', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Subheading</label><textarea value={settings.hero?.subheading || ''} onChange={(e) => handleNestedChange('hero', 'subheading', e.target.value)} className="w-full border p-2 rounded-lg" rows={2} /></div>
          <div><label className="text-sm font-bold">Button Text</label><input value={settings.hero?.button_text || ''} onChange={(e) => handleNestedChange('hero', 'button_text', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Button Link</label><input value={settings.hero?.button_link || ''} onChange={(e) => handleNestedChange('hero', 'button_link', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Background Image URL</label><input value={settings.hero?.image_url || ''} onChange={(e) => handleNestedChange('hero', 'image_url', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
        </div>

        {/* About Section */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">About Section</h2>
          <div><label className="text-sm font-bold">Heading</label><input value={settings.about?.heading || ''} onChange={(e) => handleNestedChange('about', 'heading', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Description</label><textarea value={settings.about?.description || ''} onChange={(e) => handleNestedChange('about', 'description', e.target.value)} className="w-full border p-2 rounded-lg" rows={4} /></div>
          <div><label className="text-sm font-bold">Image URL</label><input value={settings.about?.image_url || ''} onChange={(e) => handleNestedChange('about', 'image_url', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">SEO (Homepage)</h2>
          <div><label className="text-sm font-bold">Meta Title</label><input value={settings.seo?.title || ''} onChange={(e) => handleNestedChange('seo', 'title', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Meta Description</label><textarea value={settings.seo?.description || ''} onChange={(e) => handleNestedChange('seo', 'description', e.target.value)} className="w-full border p-2 rounded-lg" rows={3} /></div>
          <div><label className="text-sm font-bold">Keywords</label><input value={settings.seo?.keywords || ''} onChange={(e) => handleNestedChange('seo', 'keywords', e.target.value)} className="w-full border p-2 rounded-lg" placeholder="Comma separated" /></div>
        </div>
      </div>
    </div>
  );
}
