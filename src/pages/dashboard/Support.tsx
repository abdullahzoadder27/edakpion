import React, { useState, useEffect, useRef } from 'react';
import { UserDashboardLayout } from '../../components/dashboard/UserDashboardLayout';
import { 
  MessageSquare, Package, RotateCcw, CreditCard, Truck, 
  User, HelpCircle, Paperclip, Smile, Send, CheckCircle,
  X, Check, Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Conversation {
  id: string;
  customer_id: string;
  category: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  last_message_at: string;
  unread_customer_count: number;
  linked_order_id: string | null;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  attachment_type: string | null;
  is_internal_note: boolean;
  seen: boolean;
  created_at: string;
}

const CATEGORIES = [
  { id: 'order', name: 'Order Support', icon: Package },
  { id: 'product', name: 'Product Inquiry', icon: HelpCircle },
  { id: 'return', name: 'Return & Exchange', icon: RotateCcw },
  { id: 'payment', name: 'Payment Issue', icon: CreditCard },
  { id: 'delivery', name: 'Delivery Issue', icon: Truck },
  { id: 'account', name: 'Account Issue', icon: User },
  { id: 'general', name: 'General Question', icon: MessageSquare }
];

export function Support() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    
    // Subscribe to realtime changes
    const channel = supabase?.channel('support_customer')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'support_messages',
        filter: activeConversation ? `conversation_id=eq.${activeConversation.id}` : undefined
      }, () => {
        if (activeConversation) fetchMessages(activeConversation.id);
        fetchConversations();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'support_conversations',
        filter: `customer_id=eq.${user.id}`
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel!);
    };
  }, [user, activeConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!supabase || !user) return;
    
    const mockConversations: Conversation[] = [
      {
        id: '1', customer_id: user.id, category: 'Order Support', status: 'open',
        last_message_at: new Date().toISOString(), unread_customer_count: 1, linked_order_id: 'ORD-2026-0412',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    try {
      const { data, error } = await supabase
        .from('support_conversations')
        .select('*')
        .eq('customer_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data.length > 0 ? data : mockConversations);
      
      // Auto-select if there's an active one and none selected
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
        fetchMessages(data[0].id);
      }
    } catch (err) {
      console.error(err);
      if (mockConversations.length > 0 && !activeConversation) {
        setActiveConversation(mockConversations[0]);
        fetchMessages(mockConversations[0].id);
      }
      setConversations(mockConversations);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!supabase || !user) return;
    
    const mockMessages: Message[] = [
      {
        id: '1', conversation_id: conversationId, sender_id: user.id, 
        message: 'Hello, I need help with my order.', attachment_url: null, attachment_type: null, 
        is_internal_note: false, seen: true, created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '2', conversation_id: conversationId, sender_id: 'admin_1', 
        message: 'Hi! I can help with that. What seems to be the issue?', attachment_url: null, attachment_type: null, 
        is_internal_note: false, seen: true, created_at: new Date(Date.now() - 7000000).toISOString()
      }
    ];

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_internal_note', false) // Hide internal notes from customer
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data.length > 0 ? data : mockMessages);
      
      // Mark as read
      if (data.length > 0) {
        await supabase
          .from('support_conversations')
          .update({ unread_customer_count: 0 })
          .eq('id', conversationId);
      }
    } catch (err) {
      console.error(err);
      setMessages(mockMessages);
    }
  };

  const handleCreateTicket = async (category: string) => {
    if (!supabase || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('support_conversations')
        .insert([{
          customer_id: user.id,
          category,
          status: 'open'
        }])
        .select()
        .single();
        
      if (error) throw error;
      setActiveConversation(data);
      setIsCreating(false);
      fetchConversations();
      fetchMessages(data.id);
    } catch (err) {
      console.error(err);
      // Mock creation
      const newConv: Conversation = {
        id: Date.now().toString(),
        customer_id: user.id,
        category,
        status: 'open',
        last_message_at: new Date().toISOString(),
        unread_customer_count: 0,
        linked_order_id: null,
        created_at: new Date().toISOString()
      };
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv);
      setIsCreating(false);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user || !supabase) return;

    const msg = {
      conversation_id: activeConversation.id,
      sender_id: user.id,
      message: newMessage,
      is_internal_note: false
    };

    try {
      const { error } = await supabase.from('support_messages').insert([msg]);
      if (error) throw error;
      
      await supabase.from('support_conversations').update({
        last_message_at: new Date().toISOString(),
        unread_admin_count: 1
      }).eq('id', activeConversation.id);

      setNewMessage('');
      fetchMessages(activeConversation.id);
    } catch (err) {
      console.error(err);
      // Optimistic update for mock
      setMessages([...messages, {
        id: Date.now().toString(),
        conversation_id: activeConversation.id,
        sender_id: user.id,
        message: newMessage,
        attachment_url: null,
        attachment_type: null,
        is_internal_note: false,
        seen: false,
        created_at: new Date().toISOString()
      }]);
      setNewMessage('');
    }
  };

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden flex h-[600px] flex-col md:flex-row relative">
        
        {/* Mobile View logic - hide list if active conversation */}
        <div className={`md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50 ${activeConversation && !isCreating ? 'hidden md:flex' : 'flex w-full'}`}>
          <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Support Tickets</h2>
            <button 
              onClick={() => {
                setIsCreating(true);
                setActiveConversation(null);
              }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv);
                  setIsCreating(false);
                  fetchMessages(conv.id);
                }}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${
                  activeConversation?.id === conv.id && !isCreating ? 'bg-blue-50/50 hover:bg-blue-50/50' : ''
                }`}
              >
                {conv.unread_customer_count > 0 && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></div>
                )}
                <h3 className="font-bold text-gray-900 text-sm mb-1">{conv.category}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider font-bold text-[10px] ${
                    conv.status === 'open' ? 'bg-green-100 text-green-700' :
                    conv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {conv.status}
                  </span>
                  <span>{new Date(conv.last_message_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
            {conversations.length === 0 && !isCreating && (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No support tickets yet.</p>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                >
                  Start Conversation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat / Create View */}
        <div className={`flex-1 flex flex-col min-w-0 bg-white ${!activeConversation && !isCreating ? 'hidden md:flex' : 'flex'}`}>
          {isCreating ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="mb-6 md:hidden">
                 <button onClick={() => setIsCreating(false)} className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
                   <X className="w-4 h-4" /> Cancel
                 </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help?</h2>
              <p className="text-gray-500 text-sm mb-8">Select a topic below to start a conversation with our support team.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCreateTicket(cat.name)}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[var(--color-brand-dark)] hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-500 group-hover:text-[var(--color-brand-dark)] transition-colors">
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : activeConversation ? (
            <div className="flex-1 flex flex-col h-full relative">
              {/* Chat Header */}
              <div className="h-16 px-4 md:px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveConversation(null)} className="md:hidden p-1 -ml-1 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                    <span className="font-bold text-xs">EDK</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">EDAKPION Support</h3>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Usually replies in 10m
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    activeConversation.status === 'open' ? 'bg-green-100 text-green-700' :
                    activeConversation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                  {activeConversation.status}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
                <div className="text-center text-xs text-gray-400 mb-6 uppercase tracking-wider font-medium">
                  Ticket Created • {new Date(activeConversation.created_at).toLocaleDateString()}
                </div>
                
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        isMe 
                          ? 'bg-gray-900 text-white rounded-tr-sm' 
                          : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            msg.seen ? <CheckCircle className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-1 md:p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
                  <label className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0 cursor-pointer">
                    <input type="file" className="hidden" accept="image/*,application/pdf" />
                    <Paperclip className="w-5 h-5" />
                  </label>
                  
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 max-h-32 bg-transparent text-sm py-2 px-2 outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      newMessage.trim() 
                        ? 'bg-gray-900 hover:bg-black text-white' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-gray-300">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Ticket</h3>
                <p className="text-gray-500 text-sm">Choose a conversation from the sidebar or start a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
}

