import React, { useState } from 'react';
import { UserDashboardLayout } from '../../components/dashboard/UserDashboardLayout';
import { Shield, Smartphone, Key, MonitorSmartphone, Trash2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoMessages, setPromoMessages] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setPasswordError('Supabase is not configured.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setPasswordLoading(false);
  };

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Settings & Security</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account security and preferences.</p>
        </div>
        
        <div className="p-6 space-y-10">
          
          {/* Security Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Account Security</h2>
            
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-xl">
                Password changed successfully!
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-start">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Key className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Password</h3>
                <p className="text-sm text-gray-500 mb-4">Update your password securely</p>
                
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="w-full space-y-3 mt-2">
                    {passwordError && <div className="text-xs text-red-600">{passwordError}</div>}
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <input 
                      type="password" 
                      placeholder="Confirm Password" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        disabled={passwordLoading}
                        className="flex-1 px-4 py-2 bg-gray-900 text-xs font-bold tracking-widest uppercase text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                      >
                        {passwordLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordError(null);
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="flex-1 px-4 py-2 bg-white border border-gray-200 text-xs font-bold tracking-widest uppercase text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="mt-auto px-4 py-2 bg-white border border-gray-200 text-xs font-bold tracking-widest uppercase text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Change Password
                  </button>
                )}
              </div>
              
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-start">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Smartphone className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Two-Factor Auth</h3>
                <p className="text-sm text-gray-500 mb-4">Add an extra layer of security</p>
                <button className="mt-auto px-4 py-2 bg-gray-900 border border-gray-900 text-xs font-bold tracking-widest uppercase text-white rounded-lg hover:bg-black transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </section>

          {/* Sessions Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MonitorSmartphone className="w-5 h-5" /> Active Sessions</h2>
            <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">Mac OS • Safari</p>
                  <p className="text-xs text-gray-500 mt-1">Dhaka, Bangladesh • Active now</p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-widest">Current</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">iOS • EDAKPION App</p>
                  <p className="text-xs text-gray-500 mt-1">Dhaka, Bangladesh • Last active 2h ago</p>
                </div>
                <button className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest">Revoke</button>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h2>
            <div className="space-y-4 max-w-md">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-sm text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500 mt-1">Receive account and security alerts.</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${emailNotifications ? 'bg-gray-900' : 'bg-gray-300'}`} onClick={() => setEmailNotifications(!emailNotifications)}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-sm text-gray-900">Order Updates</p>
                  <p className="text-xs text-gray-500 mt-1">Get updates on your order status.</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${orderUpdates ? 'bg-gray-900' : 'bg-gray-300'}`} onClick={() => setOrderUpdates(!orderUpdates)}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${orderUpdates ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-sm text-gray-900">Promotional Messages</p>
                  <p className="text-xs text-gray-500 mt-1">Receive coupons and promotional offers.</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${promoMessages ? 'bg-gray-900' : 'bg-gray-300'}`} onClick={() => setPromoMessages(!promoMessages)}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${promoMessages ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Danger Zone</h2>
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-red-900 mb-1">Delete Account</h3>
                <p className="text-sm text-red-700">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap shadow-sm">
                Delete Account
              </button>
            </div>
          </section>

        </div>
      </div>
    </UserDashboardLayout>
  );
}
