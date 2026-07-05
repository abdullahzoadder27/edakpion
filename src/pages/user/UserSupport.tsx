import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { HelpCircle, Plus, Search, MessageSquare, Clock } from 'lucide-react';
import { SupportTicket } from '../../types';

export default function UserSupport() {
  const { profile } = useOutletContext<any>();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    message: '',
    order_id: ''
  });
  
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchData = async () => {
      try {
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (ticketsError) throw ticketsError;
        setTickets(ticketsData || []);
        
        // Fetch recent orders for the dropdown
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (ordersData) setOrders(ordersData);
      } catch (err) {
        // console.warn('Error fetching support tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // 1. Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: profile.id,
          subject: formData.subject,
          priority: formData.priority,
          order_id: formData.order_id || null,
          status: 'open'
        }])
        .select()
        .single();
        
      if (ticketError) throw ticketError;
      
      // 2. Create initial message
      const { error: msgError } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticket.id,
          sender_id: profile.id,
          sender_role: 'user',
          message: formData.message
        }]);
        
      if (msgError) throw msgError;
      
      setTickets([ticket, ...tickets]);
      setIsFormOpen(false);
      setFormData({ subject: '', priority: 'medium', message: '', order_id: '' });
      alert('Ticket created successfully.');
    } catch (err: any) {
      alert('Error creating ticket: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0F3D2E]">Support Center</h1>
          <p className="text-gray-500 text-sm">Need help? Open a ticket to contact our support team.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#0F3D2E] text-white rounded-lg text-sm font-medium hover:bg-[#154636] transition-colors"
          >
            <Plus className="w-4 h-4" /> Open New Ticket
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE]">
          <h2 className="text-lg font-serif text-[#0F3D2E] mb-6">Open a Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Briefly describe your issue" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Order (Optional)</label>
                <select name="order_id" value={formData.order_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]">
                  <option value="">None</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id.split('-')[0].toUpperCase()} - {new Date(order.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Describe your issue in detail..." className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#0F3D2E]"></textarea>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#0F3D2E] text-white rounded-lg text-sm font-medium hover:bg-[#154636] transition-colors disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tickets by subject or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-96 pl-10 pr-4 py-2 bg-white rounded-lg border border-[#E8E4DE] outline-none text-sm focus:border-[#0F3D2E]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No support tickets found.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E4DE]">
                {filteredTickets.map(ticket => (
                  <Link key={ticket.id} to={`/account/support/${ticket.id}`} className="block p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <MessageSquare className={`w-5 h-5 ${ticket.status === 'closed' ? 'text-gray-400' : 'text-[#0F3D2E]'}`} />
                        <h3 className="font-medium text-[#0F3D2E] truncate max-w-md">{ticket.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          ticket.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.priority} Priority
                        </span>
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' : 
                          ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          ticket.status === 'resolved' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 ml-8">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span>Ticket #{ticket.id.split('-')[0].toUpperCase()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
