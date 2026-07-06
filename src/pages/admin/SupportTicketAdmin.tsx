import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Send, Loader2, User, Shield } from 'lucide-react';

export default function SupportTicketAdmin() {
  const { id } = useParams<{ id: string }>();
  const { profile: adminProfile } = useAuth();
  
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*, profiles!support_tickets_user_id_fkey(full_name)')
        .eq('id', id)
        .single();
        
      if (ticketError) throw ticketError;
      setTicket(ticketData);
      setStatus(ticketData.status);
      setPriority(ticketData.priority);
      setInternalNotes(ticketData.internal_notes || '');

      const { data: msgData, error: msgError } = await supabase
        .from('support_messages')
        .select('*, profiles!support_messages_sender_id_fkey(full_name, role)')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
        
      if (msgError) throw msgError;
      setMessages(msgData || []);
    } catch (err: any) {
      alert(`Error fetching ticket: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase.from('support_tickets').update({ 
        status, 
        priority, 
        internal_notes: internalNotes 
      }).eq('id', id);
      if (error) throw error;
      alert('Ticket updated');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from('support_messages').insert([{
        ticket_id: id,
        sender_id: adminProfile?.id,
        message: reply,
        sender_role: "admin"
      }]);
      if (error) throw error;
      setReply('');
      fetchTicket();
    } catch (err: any) {
      alert(`Failed to send reply: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" /></div>;
  if (!ticket) return <div className="p-8 text-center text-gray-500">Ticket not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/admin/support" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 font-bold text-sm w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h1 className="text-xl font-bold text-[#0F3D2E] mb-2">{ticket.subject}</h1>
            <p className="text-sm text-gray-500 border-b border-[#E8E4DE] pb-4 mb-4">
              Ticket ID: {ticket.id} • Created: {new Date(ticket.created_at).toLocaleString()}
            </p>
            
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender_role === 'admin' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender_role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {msg.sender_role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`flex flex-col ${msg.sender_role === 'admin' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <span className="text-xs text-gray-500 mb-1">{msg.profiles?.full_name || 'System'} • {new Date(msg.created_at).toLocaleString()}</span>
                    <div className={`p-3 rounded-2xl text-sm ${msg.sender_role === 'admin' ? 'bg-[#0F3D2E] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-gray-500 italic">No messages yet.</p>}
            </div>

            <form onSubmit={sendReply} className="flex gap-2">
              <input 
                type="text" 
                value={reply} 
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply here..." 
                className="flex-1 px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
              />
              <button 
                type="submit" 
                disabled={sending || !reply.trim()}
                className="bg-[#0F3D2E] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#154636] disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] border-b pb-2">Ticket Info</h2>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Customer</label>
              <div className="font-bold text-gray-900">{ticket.profiles?.full_name || 'Anonymous'}</div>
              <div className="text-sm text-gray-500">{ticket.profiles?.email}</div>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-[#E8E4DE]">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Internal Notes</label>
                <textarea 
                  value={internalNotes} 
                  onChange={e => setInternalNotes(e.target.value)} 
                  className="w-full p-2 border rounded-lg text-sm resize-none" 
                  rows={4}
                  placeholder="Only visible to staff..."
                />
              </div>
              <button onClick={handleUpdate} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-lg text-sm transition-colors">
                Update Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
