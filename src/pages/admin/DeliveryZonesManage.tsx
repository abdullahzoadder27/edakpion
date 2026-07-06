import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Truck, Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';

export default function DeliveryZonesManage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    city_name: '',
    delivery_charge: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
        
      if (error) {
        // If table doesn't exist, we just show empty
        if (error.code === '42P01') {
          console.warn('Table delivery_zones does not exist yet.');
          setZones([]);
        } else {
          throw error;
        }
      } else {
        setZones(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching zones:', err);
    } finally {
      setLoading(false);
    }
  };

  const outsideZone = zones.find(z => z.zone_type === 'outside') || { 
    id: 'new-outside', city_name: 'Outside Selected Cities', delivery_charge: 150, is_active: true, zone_type: 'outside' 
  };
  const insideZones = zones.filter(z => z.zone_type === 'inside');

  const filteredInsideZones = insideZones.filter(z => 
    z.city_name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    active: insideZones.filter(z => z.is_active).length,
    disabled: insideZones.filter(z => !z.is_active).length,
    outsideCharge: outsideZone.delivery_charge
  };

  const handleOpenModal = (zone: any = null) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        city_name: zone.city_name,
        delivery_charge: zone.delivery_charge,
        is_active: zone.is_active,
      });
    } else {
      setEditingZone(null);
      setFormData({
        city_name: '',
        delivery_charge: 0,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone && editingZone.id !== 'new-outside') {
        const { error } = await supabase
          .from('delivery_zones')
          .update(formData)
          .eq('id', editingZone.id);
        if (error) throw error;
      } else if (editingZone && editingZone.id === 'new-outside') {
        const { error } = await supabase
          .from('delivery_zones')
          .insert([{ ...formData, zone_type: 'outside', sort_order: 9999 }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('delivery_zones')
          .insert([{ ...formData, zone_type: 'inside' }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchZones();
    } catch (err: any) {
      alert(`Error saving zone: ${err.message}`);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchZones();
    } catch (err: any) {
      alert(`Error toggling status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return;
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchZones();
    } catch (err: any) {
      alert(`Error deleting city: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Delivery Zones & Charges</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Active Cities</p>
            <p className="text-2xl font-black text-[#0F3D2E]">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Disabled Cities</p>
            <p className="text-2xl font-black text-[#0F3D2E]">{stats.disabled}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Outside Charge</p>
            <p className="text-2xl font-black text-[#0F3D2E]">৳{stats.outsideCharge}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Outside City Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h2 className="text-lg font-bold text-[#0F3D2E] mb-4 border-b pb-2">Outside City (Default)</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="font-bold text-gray-900">{outsideZone.city_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery Charge</p>
                <p className="text-xl font-black text-[#0F3D2E]">৳{outsideZone.delivery_charge}</p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => handleOpenModal(outsideZone)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Outside Charge
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Applied automatically if a customer's city is not listed in the Inside City table.
              </p>
            </div>
          </div>
        </div>

        {/* Inside Cities Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E8E4DE] flex flex-wrap gap-4 justify-between items-center">
              <h2 className="text-lg font-bold text-[#0F3D2E]">Inside Cities</h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search cities..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                  />
                </div>
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-[#0F3D2E] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#154636]"
                >
                  <Plus className="w-4 h-4" /> Add City
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-[#E8E4DE]">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-700">City Name</th>
                      <th className="px-6 py-4 font-bold text-gray-700">Delivery Charge</th>
                      <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DE]">
                    {filteredInsideZones.map(zone => (
                      <tr key={zone.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{zone.city_name}</td>
                        <td className="px-6 py-4 font-bold text-[#0F3D2E]">৳{zone.delivery_charge}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleStatus(zone.id, zone.is_active)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                              zone.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {zone.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {zone.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal(zone)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(zone.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInsideZones.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No cities found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-[#0F3D2E] mb-4">
              {editingZone ? (editingZone.zone_type === 'outside' ? 'Edit Outside Zone' : 'Edit City') : 'Add New City'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {editingZone?.zone_type === 'outside' ? 'Title' : 'City Name'}
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.city_name}
                  onChange={e => setFormData({...formData, city_name: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Charge (৳)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.delivery_charge}
                  onChange={e => setFormData({...formData, delivery_charge: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#0F3D2E] rounded focus:ring-[#0F3D2E]"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#0F3D2E] text-white rounded-xl font-bold hover:bg-[#154636] transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
