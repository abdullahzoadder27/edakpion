import { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Send, User, MessageSquare } from 'lucide-react';
import { SupportTicket, SupportMessage } from '../../types';

export default function UserSupportTicket() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useOutletContext<any>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketAndMessages = async () => {
    if (!profile?.id || !id) return;
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .eq('user_id', profile.id)
        .single();
        
      if (ticketError) throw ticketError;
      setTicket(ticketData);

      const { data: messagesData, error: messagesError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (err) {
      // console.warn('Error fetching ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketAndMessages();
  }, [id, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticket.id,
          sender_id: profile.id,
          sender_role: 'user',
          message: newMessage.trim()
        }]);

      if (error) throw error;
      setNewMessage('');
      fetchTicketAndMessages();
    } catch (err: any) {
      alert('Error sending message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading ticket details...</div>;
  if (!ticket) return <div className="p-12 text-center">Ticket not found.</div>;

  const isClosed = ticket.status === 'closed';

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/account/support" className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-[#0F3D2E]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-serif text-[#0F3D2E] truncate max-w-sm md:max-w-xl">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Ticket #{ticket.id.split('-')[0].toUpperCase()}</span>
              {ticket.order_id && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 rounded-full">Order #{ticket.order_id.split('-')[0].toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      <div className="flex-1 bg-white rounded-2xl border border-[#E8E4DE] flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.sender_role === 'user';
            
            return (
              <div key={msg.id || index} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-[#0F3D2E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {isUser ? <User className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-[#0F3D2E] text-white rounded-tr-none' : 'bg-[#F5F2ED] text-gray-800 rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Area */}
        <div className="p-4 border-t border-[#E8E4DE] bg-gray-50">
          {isClosed ? (
            <div className="text-center text-sm text-gray-500 py-2">
              This ticket is closed. If you need further assistance, please open a new ticket.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-[#0F3D2E] text-sm"
              />
              <button 
                type="submit" 
                disabled={sending || !newMessage.trim()}
                className="w-10 h-10 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center shrink-0 hover:bg-[#154636] disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
