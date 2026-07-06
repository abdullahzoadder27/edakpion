import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Download, Search, Loader2 } from 'lucide-react';

export default function SubscribersManage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats
  const [total, setTotal] = useState(0);
  const [today, setToday] = useState(0);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase.from('subscribers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSubscribers(data || []);
      setTotal(count || 0);
      
      const todayDate = new Date().toISOString().split('T')[0];
      const todayCount = data?.filter(s => s.created_at.startsWith(todayDate)).length || 0;
      setToday(todayCount);
      
    } catch (err) {
      console.warn('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Delete this subscriber?')) return;
    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', id);
      if (error) throw error;
      fetchSubscribers();
    } catch (err: any) {
      alert(`Error deleting subscriber: ${err.message}`);
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Subscribed At', 'Source Page', 'Status'];
    const rows = filteredSubscribers.map(s => [
      s.email,
      new Date(s.created_at).toLocaleString(),
      s.source_page || 'Website',
      s.status || 'Active'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Subscribers</h1>
        <button onClick={exportCSV} className="bg-white border border-[#E8E4DE] text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Subscribers</div>
          <div className="text-3xl font-bold text-[#0F3D2E]">{total}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Today's Subscribers</div>
          <div className="text-3xl font-bold text-[#0F3D2E]">{today}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E8E4DE] flex items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
            />
          </div>
        </div>
      
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-[#E8E4DE]">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Email</th>
                <th className="px-6 py-4 font-bold text-gray-700">Date</th>
                <th className="px-6 py-4 font-bold text-gray-700">Source</th>
                <th className="px-6 py-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DE]">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium">{sub.email}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-500">{sub.source_page || 'Footer'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteSubscriber(sub.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No subscribers found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
