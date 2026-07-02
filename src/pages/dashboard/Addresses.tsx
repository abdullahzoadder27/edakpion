import React, { useState, useEffect } from 'react';
import { UserDashboardLayout } from '../../components/dashboard/UserDashboardLayout';
import { Plus, Edit2, Trash2, MapPin, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [isDefault, setIsDefault] = useState(false);
  
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const resetForm = () => {
    setTitle('');
    setFullName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('Bangladesh');
    setIsDefault(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr: any) => {
    setTitle(addr.area || '');
    setFullName(addr.full_name || '');
    setPhone(addr.phone_number || '');
    setAddressLine1(addr.street_address || '');
    setAddressLine2('');
    setCity(addr.district || '');
    setState('');
    setPostalCode('');
    setCountry(addr.country || 'Bangladesh');
    setIsDefault(addr.is_default || false);
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    if (!supabase) return;
    
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address.');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user || !supabase) return;
    try {
      // Unset all first
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
      // Set new default
      await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      fetchAddresses();
    } catch (err) {
      console.error('Error setting default:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;
    
    setSaving(true);
    try {
      if (isDefault) {
        // Unset existing defaults first if we are making this one default
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
      }

      const addressData = {
        user_id: user.id,
        full_name: fullName,
        phone_number: phone,
        street_address: addressLine1 + (addressLine2 ? `, ${addressLine2}` : '') + (postalCode ? ` (${postalCode})` : '') + (country !== 'Bangladesh' ? ` - ${country}` : ''),
        area: title || city,
        district: state || city,
        is_default: addresses.length === 0 ? true : isDefault,
      };

      if (editingId) {
        const { error } = await supabase.from('addresses').update(addressData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('addresses').insert([addressData]);
        if (error) throw error;
      }
      
      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden relative">
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Saved Addresses</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Manage your delivery addresses for faster checkout.</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="hidden md:flex px-6 py-2.5 bg-gray-900 text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-colors shadow-md items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>
        
        <div className="p-4 md:p-6">
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="md:hidden w-full mb-6 flex justify-center px-6 py-3 bg-gray-900 text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-colors shadow-md items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          )}

          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSave} 
                className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Address Title (e.g. Home, Office)</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">City</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Address Line 1</label>
                    <input type="text" required value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Address Line 2 (Optional)</label>
                    <input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">State / Division</label>
                    <input type="text" required value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Postal Code</label>
                    <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-3">
                  <input type="checkbox" id="isDefault" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900" />
                  <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">Set as default address</label>
                </div>

                <div className="flex gap-4">
                  <button type="submit" disabled={saving} className="flex-1 sm:flex-none px-8 py-3 bg-gray-900 text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-colors shadow-md disabled:opacity-70 flex justify-center items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Address
                  </button>
                  <button type="button" onClick={resetForm} className="flex-1 sm:flex-none px-8 py-3 bg-white text-gray-900 border border-gray-200 text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-gray-50 transition-colors text-center">
                    Cancel
                  </button>
                </div>
              </motion.form>
            ) : loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900">No saved addresses</p>
                <p className="text-sm mt-1">Add an address to checkout faster.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              >
                {addresses.map(addr => (
                  <div key={addr.id} className={`rounded-2xl p-4 md:p-6 relative transition-colors ${addr.is_default ? 'border-2 border-gray-900 bg-gray-50' : 'border border-gray-200 hover:border-gray-300'}`}>
                    {addr.is_default && (
                      <div className="absolute top-4 right-4 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">Default</div>
                    )}
                    <div className="flex items-center gap-3 mb-4 text-gray-900">
                      <MapPin className="w-5 h-5 shrink-0" />
                      <h3 className="font-bold text-lg line-clamp-1">{addr.title}</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{addr.full_name}</p>
                    <p className="text-sm text-gray-500 mb-1">{addr.phone}</p>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 h-16 overflow-hidden">
                      {addr.street_address} <br />
                      {addr.area ? addr.area + ', ' : ''}{addr.district}<br />
                      Bangladesh
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 mt-auto">
                      <button onClick={() => handleEdit(addr)} className="text-xs md:text-sm font-bold text-gray-900 hover:text-blue-600 flex items-center gap-1"><Edit2 className="w-4 h-4" /> Edit</button>
                      <button onClick={() => handleDelete(addr.id)} className="text-xs md:text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete</button>
                      {!addr.is_default && (
                        <button onClick={() => handleSetDefault(addr.id)} className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 ml-auto">Set as Default</button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </UserDashboardLayout>
  );
}
