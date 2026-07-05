import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, Key, AlertCircle } from 'lucide-react';

export default function UserSecurity() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setFormData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error updating password: ' + err.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif text-[#0F3D2E]">Security Settings</h1>
        <p className="text-gray-500 text-sm">Update your password and secure your account.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-[#0F3D2E]">Change Password</h2>
              <p className="text-xs text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                {message.text}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]" 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={updating} 
                className="px-6 py-2 bg-[#0F3D2E] text-white rounded-lg text-sm font-medium hover:bg-[#154636] transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-red-800">Delete Account</h3>
          <p className="text-sm text-red-600 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
        </div>
        <button className="px-6 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors whitespace-nowrap">
          Request Deletion
        </button>
      </div>
    </div>
  );
}
