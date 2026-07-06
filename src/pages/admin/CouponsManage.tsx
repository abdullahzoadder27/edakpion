import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Tag, Check, X as XIcon, Loader2 } from 'lucide-react';

export default function CouponsManage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '', name: '', description: '', type: 'percentage', value: '',
    minimum_order_amount: '', maximum_discount_amount: '', usage_limit: '',
    per_user_usage_limit: '', first_order_only: false, new_customer_only: false,
    free_shipping: false, auto_apply: false, priority: '0', start_date: '', end_date: '', is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.warn('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        minimum_order_amount: parseFloat(formData.minimum_order_amount) || 0,
        maximum_discount_amount: formData.maximum_discount_amount ? parseFloat(formData.maximum_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        per_user_usage_limit: formData.per_user_usage_limit ? parseInt(formData.per_user_usage_limit) : null,
        priority: parseInt(formData.priority) || 0,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', isEditing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert([payload]);
        if (error) throw error;
      }
      fetchCoupons();
      setShowForm(false);
      setIsEditing(null);
      setFormData({
        code: '', name: '', description: '', type: 'percentage', value: '',
        minimum_order_amount: '', maximum_discount_amount: '', usage_limit: '',
        per_user_usage_limit: '', first_order_only: false, new_customer_only: false,
        free_shipping: false, auto_apply: false, priority: '0', start_date: '', end_date: '', is_active: true
      });
    } catch (err: any) {
      alert(`Error saving coupon: ${err.message}`);
    }
  };

  const editCoupon = (coupon: any) => {
    setFormData({
      ...coupon,
      value: coupon.value?.toString() || '',
      minimum_order_amount: coupon.minimum_order_amount?.toString() || '',
      maximum_discount_amount: coupon.maximum_discount_amount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      per_user_usage_limit: coupon.per_user_usage_limit?.toString() || '',
      priority: coupon.priority?.toString() || '0',
      start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().slice(0, 16) : '',
      end_date: coupon.end_date ? new Date(coupon.end_date).toISOString().slice(0, 16) : '',
    });
    setIsEditing(coupon.id);
    setShowForm(true);
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      fetchCoupons();
    } catch (err: any) {
      alert(`Error deleting coupon: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Coupons</h1>
        <button 
          onClick={() => { setShowForm(!showForm); setIsEditing(null); }}
          className="bg-[#0F3D2E] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#154636]"
        >
          {showForm ? <XIcon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-bold">Code *</label><input required name="code" value={formData.code} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Name</label><input name="name" value={formData.name} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div className="md:col-span-2"><label className="text-sm font-bold">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Type</label><select name="type" value={formData.type} onChange={handleInputChange} className="w-full border p-2 rounded-lg"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
            <div><label className="text-sm font-bold">Value *</label><input required type="number" step="0.01" name="value" value={formData.value} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Min Order Amount</label><input type="number" step="0.01" name="minimum_order_amount" value={formData.minimum_order_amount} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Max Discount</label><input type="number" step="0.01" name="maximum_discount_amount" value={formData.maximum_discount_amount} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Total Usage Limit</label><input type="number" name="usage_limit" value={formData.usage_limit} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Per User Limit</label><input type="number" name="per_user_usage_limit" value={formData.per_user_usage_limit} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Start Date</label><input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">End Date</label><input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Priority</label><input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              <label className="flex items-center gap-2"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} /> Active</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="first_order_only" checked={formData.first_order_only} onChange={handleInputChange} /> First Order Only</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="new_customer_only" checked={formData.new_customer_only} onChange={handleInputChange} /> New Customer Only</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="free_shipping" checked={formData.free_shipping} onChange={handleInputChange} /> Free Shipping</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="auto_apply" checked={formData.auto_apply} onChange={handleInputChange} /> Auto Apply</label>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="submit" className="bg-[#0F3D2E] text-white px-6 py-2 rounded-xl font-bold">Save Coupon</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-[#E8E4DE]">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-700">Code</th>
              <th className="px-6 py-4 font-bold text-gray-700">Type/Value</th>
              <th className="px-6 py-4 font-bold text-gray-700">Status</th>
              <th className="px-6 py-4 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E4DE]">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => editCoupon(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No coupons found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
