import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save, Loader2 } from 'lucide-react';
import { HeroSettings } from '../../../types';

const DEFAULT_SETTINGS: HeroSettings = {
  id: 'default',
  is_enabled: true,
  desktop_layout: 'split',
  tablet_layout: 'split',
  mobile_layout: 'stacked',
  desktop_height: '70vh',
  tablet_height: '60vh',
  mobile_height: 'auto',
  container_width: 'max-w-[1180px]',
  content_alignment: 'left',
  character_position: 'right',
  character_size: '80%',
  section_padding: 'px-4 sm:px-6 md:px-8',
  gap_text_character: 'gap-0',

  bg_color: '#0F0F10',
  overlay_color: '#0F0F10',
  overlay_opacity: 80,
  gradient_style: 'bg-gradient-to-br from-[#0F0F10] via-[#0F0F10] to-[#1B1B1D]',
  enable_spotlight: true,
  enable_jamdani: true,

  color_primary: '#E7B74C',
  color_secondary: '#C89A2B',
  color_accent: '#F0C75A',
  color_button_bg: '#E7B74C',
  color_button_text: '#0F0F10',
  color_button_hover: '#F0C75A',
  color_text_primary: '#F8F5EF',
  color_text_secondary: '#D9D2C7',

  font_family: 'font-sans',
  heading_size_desktop: 'text-[3.75rem] xl:text-[4.25rem]',
  heading_size_tablet: 'text-4xl md:text-5xl',
  heading_size_mobile: 'text-[2.25rem]',
  desc_size_desktop: 'text-sm',
  desc_size_mobile: 'text-[13px]',
  font_weight_heading: 'font-bold',
  letter_spacing: 'tracking-tight',
  line_height: 'leading-[1.05]',

  anim_floating: true,
  anim_mouse_parallax: true,
  anim_fade: true,
  anim_slide: true,
  anim_character_scale: true,
  anim_speed: '800ms',
  anim_duration: '0.5s',

  desktop_char_width: 'lg:w-[85%] xl:w-[80%]',
  tablet_char_width: 'md:w-[55%]',
  mobile_char_width: 'w-[75%] sm:w-[65%]',
  desktop_text_width: 'max-w-none',
  mobile_text_align: 'text-center',
  mobile_char_align: 'justify-center',
  mobile_gap_headline_char: 'mb-2 mt-[-5px]',
  mobile_gap_char_desc: 'mb-3',
  mobile_btn_width: 'w-full',

  seo_h1: 'Premium Streetwear Made to Stand Out',
  updated_at: new Date().toISOString()
};

export default function HeroSettingsAdmin() {
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'hero_settings')
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.value });
      }
    } catch (err) {
      console.error('Error fetching hero settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ key: 'hero_settings', value: settings });
      if (error) throw error;
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = parseFloat(value);
    }

    setSettings(prev => ({ ...prev, [name]: finalValue }));
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111111] sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white">Hero Settings & Styling</h2>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-green-400">{message}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded hover:bg-[#F0C75A] transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm max-h-[75vh] overflow-y-auto">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-white/10 pb-2">General Settings</h3>
          
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" name="is_enabled" checked={settings.is_enabled} onChange={handleChange} className="rounded border-gray-600 bg-gray-800" />
            Enable Hero Section
          </label>
          
          <div>
            <label className="block text-gray-400 mb-1">Desktop Layout</label>
            <select name="desktop_layout" value={settings.desktop_layout} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white">
              <option value="split">Split (Left Text, Right Image)</option>
              <option value="split-reverse">Split Reverse (Left Image, Right Text)</option>
              <option value="center">Centered Stacked</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 mb-1">Container Width</label>
            <input type="text" name="container_width" value={settings.container_width} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-1">Desktop Height</label>
            <input type="text" name="desktop_height" value={settings.desktop_height} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Mobile Height</label>
            <input type="text" name="mobile_height" value={settings.mobile_height} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
          </div>
        </div>
        
        {/* Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-white/10 pb-2">Colors & Branding</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Primary Color</label>
              <input type="color" name="color_primary" value={settings.color_primary} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Secondary Color</label>
              <input type="color" name="color_secondary" value={settings.color_secondary} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Accent Glow</label>
              <input type="color" name="color_accent" value={settings.color_accent} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Background Base</label>
              <input type="color" name="bg_color" value={settings.bg_color} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Text Primary</label>
              <input type="color" name="color_text_primary" value={settings.color_text_primary} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Text Secondary</label>
              <input type="color" name="color_text_secondary" value={settings.color_text_secondary} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Button Bg</label>
              <input type="color" name="color_button_bg" value={settings.color_button_bg} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Button Text</label>
              <input type="color" name="color_button_text" value={settings.color_button_text} onChange={handleChange} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer p-1" />
            </div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-white/10 pb-2">Background & Effects</h3>
          
          <div>
            <label className="block text-gray-400 mb-1">Background Gradient Tailwind</label>
            <input type="text" name="gradient_style" value={settings.gradient_style} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
          </div>

          <label className="flex items-center gap-2 text-white mt-4">
            <input type="checkbox" name="enable_spotlight" checked={settings.enable_spotlight} onChange={handleChange} className="rounded border-gray-600 bg-gray-800" />
            Enable Cinematic Spotlight (Warm)
          </label>
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" name="enable_jamdani" checked={settings.enable_jamdani} onChange={handleChange} className="rounded border-gray-600 bg-gray-800" />
            Enable Jamdani Pattern Overlay
          </label>
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" name="anim_floating" checked={settings.anim_floating} onChange={handleChange} className="rounded border-gray-600 bg-gray-800" />
            Enable Parallax/Floating Anim
          </label>
        </div>
        
        {/* Typography */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-white/10 pb-2">Typography & SEO</h3>
          
          <div>
            <label className="block text-gray-400 mb-1">Font Family</label>
            <select name="font_family" value={settings.font_family} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white">
              <option value="font-sans">Sans Serif (Inter/Modern)</option>
              <option value="font-serif">Serif (Playfair/Premium)</option>
              <option value="font-mono">Monospace</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Heading (Desktop)</label>
              <input type="text" name="heading_size_desktop" value={settings.heading_size_desktop} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Heading (Mobile)</label>
              <input type="text" name="heading_size_mobile" value={settings.heading_size_mobile} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">SEO H1 Heading</label>
            <input type="text" name="seo_h1" value={settings.seo_h1} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
          </div>
        </div>

        {/* Responsive Gap & Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-white/10 pb-2">Responsive Tweaks</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Char Width (Desktop)</label>
              <input type="text" name="desktop_char_width" value={settings.desktop_char_width} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Char Width (Mobile)</label>
              <input type="text" name="mobile_char_width" value={settings.mobile_char_width} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Mobile Gap (Title - Char)</label>
              <input type="text" name="mobile_gap_headline_char" value={settings.mobile_gap_headline_char} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Mobile Gap (Char - Desc)</label>
              <input type="text" name="mobile_gap_char_desc" value={settings.mobile_gap_char_desc} onChange={handleChange} className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
