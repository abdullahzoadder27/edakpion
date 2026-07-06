import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User, Camera, Save, AlertCircle } from 'lucide-react';

export default function UserProfile() {
  const { profile } = useOutletContext<any>();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    division: '',
    district: '',
    address: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        division: profile.division || '',
        district: profile.district || '',
        address: profile.address || ''
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  // Calculate profile completion
  const fields = ['full_name', 'phone', 'division', 'district', 'address'];
  const filledFields = fields.filter(f => formData[f as keyof typeof formData]?.trim() !== '').length;
  const completionPercentage = Math.round(((filledFields + (avatarUrl ? 1 : 0)) / 6) * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploading(true);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(data.publicUrl);
      setMessage({ type: 'success', text: 'Avatar updated successfully.' });
      
      // Refresh page to update context
      window.location.reload();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error uploading image: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);
        
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      // Short delay before reload to show success message
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error updating profile: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif text-[#0F3D2E]">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your personal information.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-[#0F3D2E]">Profile Completion</h3>
          <span className="text-sm font-bold text-[#0F3D2E]">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-[#0F3D2E] h-2 rounded-full transition-all duration-500" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        {completionPercentage < 100 && (
          <p className="text-xs text-gray-500 mt-2">Complete your profile to get the best experience.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative group">
                {avatarUrl ? (
                  <img loading="lazy" decoding="async" src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Change</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
              {uploading && <p className="text-xs text-gray-500">Uploading...</p>}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-6">
              {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={profile?.email || ''} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-gray-500 outline-none cursor-not-allowed" />
                  <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="font-medium text-[#0F3D2E] mb-4">Default Address Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                    <input type="text" name="division" value={formData.division} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]"></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-[#0F3D2E] text-white rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-[#154636] transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
