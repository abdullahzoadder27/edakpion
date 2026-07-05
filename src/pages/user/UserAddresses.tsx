import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MapPin, Plus, Edit2, Trash2, Check, Star } from 'lucide-react';
import { Address } from '../../types';

export default function UserAddresses() {
  const { profile } = useOutletContext<any>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const initialForm = {
    label: 'Home',
    receiver_name: profile?.full_name || '',
    phone: profile?.phone || '',
    division: profile?.division || '',
    district: profile?.district || '',
    area: '',
    full_address: profile?.address || '',
    is_default: false
  };
  
  const [formData, setFormData] = useState(initialForm);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', profile.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      // console.warn('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchAddresses();
    }
  }, [profile]);

  const handleOpenForm = (address?: Address) => {
    if (address) {
      setFormData({
        label: address.label || '',
        receiver_name: address.receiver_name || '',
        phone: address.phone || '',
        division: address.division || '',
        district: address.district || '',
        area: address.area || '',
        full_address: address.full_address || '',
        is_default: address.is_default || false
      });
      setEditingId(address.id);
    } else {
      setFormData(initialForm);
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // If setting this as default, unset others first (optional depending on trigger, but doing it in frontend for safety)
      if (formData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', profile.id);
      }

      const payload = {
        ...formData,
        user_id: profile.id
      };

      if (editingId) {
        const { error } = await supabase.from('addresses').update(payload).eq('id', editingId).eq('user_id', profile.id);
        if (error) throw error;
      } else {
        // If it's the first address, make it default automatically
        if (addresses.length === 0) payload.is_default = true;
        const { error } = await supabase.from('addresses').insert([payload]);
        if (error) throw error;
      }
      
      alert(editingId ? 'Address updated' : 'Address added');
      handleCloseForm();
      fetchAddresses();
    } catch (err: any) {
      alert('Error saving address: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', profile.id);
      if (error) throw error;
      fetchAddresses();
    } catch (err: any) {
      alert('Error deleting address: ' + err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Unset all others
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', profile.id);
      // Set new default
      await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', profile.id);
      fetchAddresses();
    } catch (err: any) {
      alert('Error setting default: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0F3D2E]">Address Book</h1>
          <p className="text-gray-500 text-sm">Manage your delivery addresses.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-6 py-2 bg-[#0F3D2E] text-white rounded-lg text-sm font-medium hover:bg-[#154636] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE]">
          <h2 className="text-lg font-serif text-[#0F3D2E] mb-6">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g., Home, Office)</label>
                <input type="text" name="label" value={formData.label} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name</label>
                <input type="text" name="receiver_name" value={formData.receiver_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <input type="text" name="division" value={formData.division} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area/Thana</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address (Street, House, etc.)</label>
              <textarea name="full_address" value={formData.full_address} onChange={handleChange} required rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#0F3D2E]"></textarea>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_default" name="is_default" checked={formData.is_default} onChange={handleChange} className="w-4 h-4 rounded text-[#0F3D2E] focus:ring-[#0F3D2E]" />
              <label htmlFor="is_default" className="text-sm text-gray-700">Set as default delivery address</label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={handleCloseForm} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#0F3D2E] text-white rounded-lg text-sm font-medium hover:bg-[#154636] transition-colors disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-[#0F3D2E] mb-2">No saved addresses found</p>
              <p>Add an address for a faster checkout experience.</p>
            </div>
          ) : (
            addresses.map(address => (
              <div key={address.id} className={`bg-white p-6 rounded-2xl border ${address.is_default ? 'border-[#0F3D2E] shadow-sm' : 'border-[#E8E4DE]'} relative`}>
                {address.is_default && (
                  <span className="absolute top-0 right-0 bg-[#0F3D2E] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                    Default
                  </span>
                )}
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[#0F3D2E]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-[#0F3D2E]">{address.label || 'Address'}</h3>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-6">
                  <p className="font-medium text-gray-900">{address.receiver_name}</p>
                  <p>{address.phone}</p>
                  <p className="mt-2">{address.full_address}</p>
                  <p>{address.area && `${address.area}, `}{address.district}, {address.division}</p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button onClick={() => handleOpenForm(address)} className="flex items-center gap-1 text-sm font-medium text-[#0F3D2E] hover:underline">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(address.id)} className="flex items-center gap-1 text-sm font-medium text-red-500 hover:underline">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  
                  {!address.is_default && (
                    <button onClick={() => handleSetDefault(address.id)} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#0F3D2E] ml-auto">
                      <Star className="w-4 h-4" /> Set Default
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
