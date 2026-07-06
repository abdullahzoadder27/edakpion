import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, XIcon, Star, Loader2 } from 'lucide-react';

export default function TestimonialsManage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', message: '', rating: '5', avatar_url: '', 
    occupation: '', location: '', display_order: '0', 
    featured: false, is_active: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.warn('Error fetching testimonials:', err);
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
        rating: parseInt(formData.rating) || 5,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (isEditing) {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', isEditing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert([payload]);
        if (error) throw error;
      }
      fetchTestimonials();
      setShowForm(false);
      setIsEditing(null);
      setFormData({
        name: '', message: '', rating: '5', avatar_url: '', 
        occupation: '', location: '', display_order: '0', 
        featured: false, is_active: true
      });
    } catch (err: any) {
      alert(`Error saving testimonial: ${err.message}`);
    }
  };

  const editTestimonial = (item: any) => {
    setFormData({
      ...item,
      rating: item.rating?.toString() || '5',
      display_order: item.display_order?.toString() || '0',
    });
    setIsEditing(item.id);
    setShowForm(true);
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      fetchTestimonials();
    } catch (err: any) {
      alert(`Error deleting testimonial: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Testimonials</h1>
        <button 
          onClick={() => { setShowForm(!showForm); setIsEditing(null); }}
          className="bg-[#0F3D2E] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#154636]"
        >
          {showForm ? <XIcon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Testimonial'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-bold">Customer Name *</label><input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Photo URL</label><input type="url" name="avatar_url" value={formData.avatar_url} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Occupation</label><input name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Location</label><input name="location" value={formData.location} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            <div><label className="text-sm font-bold">Rating</label><select name="rating" value={formData.rating} onChange={handleInputChange} className="w-full border p-2 rounded-lg"><option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option></select></div>
            <div><label className="text-sm font-bold">Display Order</label><input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="w-full border p-2 rounded-lg" /></div>
            
            <div className="md:col-span-2"><label className="text-sm font-bold">Message *</label><textarea required name="message" value={formData.message} onChange={handleInputChange} className="w-full border p-2 rounded-lg" rows={3} /></div>
            
            <div className="md:col-span-2 flex gap-4 mt-2">
              <label className="flex items-center gap-2"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} /> Active</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} /> Featured (Show on Homepage)</label>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="submit" className="bg-[#0F3D2E] text-white px-6 py-2 rounded-xl font-bold">Save Testimonial</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-[#E8E4DE]">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Customer</th>
                <th className="px-6 py-4 font-bold text-gray-700">Message</th>
                <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DE]">
              {testimonials.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.avatar_url ? <img src={item.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">{item.name?.charAt(0)}</div>}
                      <div>
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.occupation} {item.location && `• ${item.location}`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                    </div>
                    <div className="text-gray-600 italic mt-1 line-clamp-2">"{item.message}"</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {item.is_active ? <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 w-fit">Active</span> : <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 w-fit">Disabled</span>}
                      {item.featured && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 w-fit">Featured</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => editTestimonial(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteTestimonial(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No testimonials found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
