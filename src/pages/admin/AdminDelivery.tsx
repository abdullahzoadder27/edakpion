import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Loader2, Truck, Plus, Trash2 } from 'lucide-react';

export function AdminDelivery() {
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState('');
  const [newCharge, setNewCharge] = useState('');

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) return;
      const { data } = await supabase.from('delivery_charges').select('*').order('created_at', { ascending: false });
      setCharges(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity || !newCharge) return;
    try {
      await supabase.from('delivery_charges').insert({ city: newCity, charge: Number(newCharge) });
      setNewCity('');
      setNewCharge('');
      fetchCharges();
    } catch (err) {
      alert('Error adding charge');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('delivery_charges').delete().eq('id', id);
    fetchCharges();
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-8">Delivery Charges</h1>
      
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City / Region</label>
          <input type="text" value={newCity} onChange={e => setNewCity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" required />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Charge (৳)</label>
          <input type="number" value={newCharge} onChange={e => setNewCharge(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" required />
        </div>
        <button type="submit" className="px-6 py-2 bg-[var(--color-brand-dark)] text-white font-bold rounded-lg h-[42px]">Add</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : (
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-bold text-gray-500">Region</th>
                <th className="p-4 font-bold text-gray-500">Charge</th>
                <th className="p-4 font-bold text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {charges.map(c => (
                <tr key={c.id} className="border-t border-gray-50">
                  <td className="p-4 font-medium">{c.city}</td>
                  <td className="p-4">৳ {c.charge}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
