import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ExternalLink, MessageCircle, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupportManage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let query = supabase.from('support_tickets').select('*, profiles!support_tickets_user_id_fkey(full_name)').order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.warn('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
      if (error) throw error;
      setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
    } catch (err: any) {
      alert(`Error updating ticket: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('support_tickets').delete().eq('id', id);
      if (error) throw error;
      setTickets(tickets.filter(t => t.id !== id));
    } catch (err: any) {
      alert(`Error deleting ticket: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || 
                        t.id.toLowerCase().includes(search.toLowerCase()) ||
                        t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Support Tickets</h1>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E8E4DE] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-96 bg-gray-50 px-4 py-2 rounded-lg border border-[#E8E4DE]">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-50 border border-[#E8E4DE] rounded-lg px-4 py-2 text-sm outline-none">
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-[#E8E4DE]">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Ticket & Subject</th>
                <th className="px-6 py-4 font-bold text-gray-700">Customer</th>
                <th className="px-6 py-4 font-bold text-gray-700">Priority & Status</th>
                <th className="px-6 py-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DE]">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{ticket.subject}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {ticket.id.slice(0,8)}... | {new Date(ticket.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ticket.profiles?.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-gray-500">{ticket.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                        ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          ticket.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        {ticket.priority || 'medium'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                        ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <select 
                        value={ticket.status} 
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        className="text-xs border border-gray-200 bg-white rounded p-1.5 outline-none"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <Link to={`/admin/support/${ticket.id}`} className="p-1.5 bg-gray-100 text-[#0F3D2E] hover:bg-gray-200 rounded text-sm font-bold">View</Link>
                      <button 
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deletingId === ticket.id}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-bold disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No support tickets found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
