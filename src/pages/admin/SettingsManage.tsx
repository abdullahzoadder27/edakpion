import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsManage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    general: { store_name: 'EDAKPION', logo_url: '', favicon_url: '', email: '', phone: '', address: '' },
    social: { facebook: '', instagram: '', tiktok: '', youtube: '', linkedin: '', whatsapp: '' },
    seo: { meta_title: '', meta_description: '', keywords: '' },
    analytics: { google_analytics: '', meta_pixel: '', search_console: '' },
    email: { smtp_host: '', smtp_port: '', sender_email: '', sender_name: '' },
    system: { maintenance_mode: false }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'platform_settings').single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setSettings({ ...settings, ...data.value });
      }
    } catch (err) {
      console.warn('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('store_settings').upsert({
        key: 'platform_settings',
        value: settings
      }, { onConflict: 'key' });
      
      if (error) throw error;
      alert('Settings updated successfully!');
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Platform Settings</h1>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-[#0F3D2E] text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-[#154636] font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">General</h2>
          <div><label className="text-sm font-bold">Store Name</label><input value={settings.general?.store_name || ''} onChange={(e) => handleNestedChange('general', 'store_name', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Logo URL</label><input value={settings.general?.logo_url || ''} onChange={(e) => handleNestedChange('general', 'logo_url', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Favicon URL</label><input value={settings.general?.favicon_url || ''} onChange={(e) => handleNestedChange('general', 'favicon_url', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Contact Email</label><input value={settings.general?.email || ''} onChange={(e) => handleNestedChange('general', 'email', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Phone Number</label><input value={settings.general?.phone || ''} onChange={(e) => handleNestedChange('general', 'phone', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Business Address</label><textarea value={settings.general?.address || ''} onChange={(e) => handleNestedChange('general', 'address', e.target.value)} className="w-full border p-2 rounded-lg" rows={2} /></div>
        </div>

        {/* Social Media */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">Social Media Links</h2>
          <div><label className="text-sm font-bold">Facebook</label><input value={settings.social?.facebook || ''} onChange={(e) => handleNestedChange('social', 'facebook', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Instagram</label><input value={settings.social?.instagram || ''} onChange={(e) => handleNestedChange('social', 'instagram', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">TikTok</label><input value={settings.social?.tiktok || ''} onChange={(e) => handleNestedChange('social', 'tiktok', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">YouTube</label><input value={settings.social?.youtube || ''} onChange={(e) => handleNestedChange('social', 'youtube', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">WhatsApp</label><input value={settings.social?.whatsapp || ''} onChange={(e) => handleNestedChange('social', 'whatsapp', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">Global SEO</h2>
          <div><label className="text-sm font-bold">Meta Title</label><input value={settings.seo?.meta_title || ''} onChange={(e) => handleNestedChange('seo', 'meta_title', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Meta Description</label><textarea value={settings.seo?.meta_description || ''} onChange={(e) => handleNestedChange('seo', 'meta_description', e.target.value)} className="w-full border p-2 rounded-lg" rows={3} /></div>
          <div><label className="text-sm font-bold">Keywords</label><input value={settings.seo?.keywords || ''} onChange={(e) => handleNestedChange('seo', 'keywords', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
        </div>

        {/* Analytics & Tracking */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">Analytics</h2>
          <div><label className="text-sm font-bold">Google Analytics ID</label><input value={settings.analytics?.google_analytics || ''} onChange={(e) => handleNestedChange('analytics', 'google_analytics', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
          <div><label className="text-sm font-bold">Meta Pixel ID</label><input value={settings.analytics?.meta_pixel || ''} onChange={(e) => handleNestedChange('analytics', 'meta_pixel', e.target.value)} className="w-full border p-2 rounded-lg" /></div>
        </div>
        
        {/* System */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">System</h2>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="maintenance" checked={settings.system?.maintenance_mode || false} onChange={(e) => handleNestedChange('system', 'maintenance_mode', e.target.checked)} className="w-5 h-5" />
            <label htmlFor="maintenance" className="text-sm font-bold">Enable Maintenance Mode</label>
          </div>
          <p className="text-xs text-gray-500">When enabled, visitors will see a "Under Construction" page.</p>
        </div>
      </div>
    </div>
  );
}
