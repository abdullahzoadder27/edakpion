import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Search, Filter, Phone, Mail, Clock, CheckCircle, 
  Paperclip, Smile, Send, Image as ImageIcon, FileText, Package, 
  MoreVertical, X, Check, Archive, Trash2, Eye, MapPin, Box
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface Conversation {
  id: string;
  customer_id: string;
  category: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  last_message_at: string;
  unread_admin_count: number;
  linked_order_id: string | null;
  customer?: {
    email: string;
    full_name: string;
    avatar_url: string;
  };
  last_message?: string;
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

export function AdminSupport() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to new messages
    const channel = supabase?.channel('support_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
        if (activeConversation) {
          fetchMessages(activeConversation.id);
        }
        fetchConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel!);
    };
  }, [activeConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!supabase) return;
    
    // Mock data if no real data yet
    const mockConversations: Conversation[] = [
      {
        id: '1',
        customer_id: 'cust_1',
        category: 'Order Support',
        status: 'open',
        last_message_at: new Date().toISOString(),
        unread_admin_count: 2,
        linked_order_id: 'ORD-2026-0412',
        customer: { email: 'john@example.com', full_name: 'John Doe', avatar_url: '' },
        last_message: 'Where is my order?'
      },
      {
        id: '2',
        customer_id: 'cust_2',
        category: 'Product Inquiry',
        status: 'pending',
        last_message_at: new Date(Date.now() - 3600000).toISOString(),
        unread_admin_count: 0,
        linked_order_id: null,
        customer: { email: 'sarah@example.com', full_name: 'Sarah Smith', avatar_url: '' },
        last_message: 'Does this shirt run large?'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('support_conversations')
        .select('*, customer:customer_id(email, full_name, avatar_url)')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data.length > 0 ? data : mockConversations);
    } catch (err) {
      console.error(err);
      setConversations(mockConversations);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!supabase) return;
    
    const mockMessages: Message[] = [
      {
        id: '1', conversation_id: conversationId, sender_id: 'cust_1', 
        message: 'Hello, I need help with my order.', attachment_url: null, attachment_type: null, 
        is_internal_note: false, seen: true, created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '2', conversation_id: conversationId, sender_id: user?.id || 'admin_1', 
        message: 'Hi John, I can help with that. What seems to be the issue?', attachment_url: null, attachment_type: null, 
        is_internal_note: false, seen: true, created_at: new Date(Date.now() - 7000000).toISOString()
      },
      {
        id: '3', conversation_id: conversationId, sender_id: 'cust_1', 
        message: 'Where is my order?', attachment_url: null, attachment_type: null, 
        is_internal_note: false, seen: false, created_at: new Date().toISOString()
      }
    ];

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data.length > 0 ? data : mockMessages);
      
      // Mark as read
      if (data.length > 0) {
        await supabase
          .from('support_conversations')
          .update({ unread_admin_count: 0 })
          .eq('id', conversationId);
      }
    } catch (err) {
      console.error(err);
      setMessages(mockMessages);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user || !supabase) return;

    const msg = {
      conversation_id: activeConversation.id,
      sender_id: user.id,
      message: newMessage,
      is_internal_note: isInternalNote
    };

    try {
      const { error } = await supabase.from('support_messages').insert([msg]);
      if (error) throw error;
      
      // Update conversation timestamp
      await supabase.from('support_conversations').update({
        last_message_at: new Date().toISOString(),
        unread_customer_count: isInternalNote ? 0 : 1
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
        is_internal_note: isInternalNote,
        seen: false,
        created_at: new Date().toISOString()
      }]);
      setNewMessage('');
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (searchQuery && !c.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !c.linked_order_id?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-80px)] flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Middle Panel - Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
            Conversations
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{conversations.length}</span>
          </h2>
          <div className="relative mb-3">
            <input 
              type="text" 
              placeholder="Search customers, orders..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-900 transition-all outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {['all', 'open', 'pending', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConversation(conv);
                fetchMessages(conv.id);
              }}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${
                activeConversation?.id === conv.id ? 'bg-blue-50/50 hover:bg-blue-50/50' : ''
              }`}
            >
              {conv.unread_admin_count > 0 && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></div>
              )}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                  {conv.customer?.full_name?.charAt(0) || conv.customer?.email?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 truncate text-sm">
                      {conv.customer?.full_name || conv.customer?.email || 'Unknown User'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-1">
                    {conv.category} {conv.linked_order_id && `• ${conv.linked_order_id}`}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-1 pl-13">
                {conv.last_message}
              </p>
              <div className="flex items-center justify-between mt-2 pl-13">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  conv.status === 'open' ? 'bg-green-100 text-green-700' :
                  conv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {conv.status}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </button>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No conversations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area & Details */}
      {activeConversation ? (
        <div className="flex-1 flex">
          {/* Chat Window */}
          <div className="flex-1 flex flex-col min-w-0 bg-white relative border-r border-gray-200">
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {activeConversation.customer?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeConversation.customer?.full_name || 'Customer'}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  className="text-xs font-bold uppercase tracking-wider border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none"
                  value={activeConversation.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    setActiveConversation({...activeConversation, status: newStatus as any});
                    if (supabase) {
                      await supabase.from('support_conversations').update({ status: newStatus }).eq('id', activeConversation.id);
                    }
                  }}
                >
                  <option value="open">Mark Open</option>
                  <option value="pending">Mark Pending</option>
                  <option value="resolved">Mark Resolved</option>
                  <option value="closed">Close Ticket</option>
                </select>
                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Support Timeline / Alert */}
            {activeConversation.linked_order_id && (
              <div className="bg-blue-50 px-6 py-2 border-b border-blue-100 flex items-center justify-between shrink-0 text-sm">
                <div className="flex items-center gap-2 text-blue-800">
                  <Package className="w-4 h-4" />
                  <span>Linked Order: <strong>{activeConversation.linked_order_id}</strong></span>
                </div>
                <button className="text-blue-600 font-medium hover:underline text-xs">View Details</button>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              <div className="text-center text-xs text-gray-400 mb-6 uppercase tracking-wider font-medium">
                Ticket Created • {new Date(activeConversation.created_at).toLocaleDateString()}
              </div>
              
              {messages.map((msg, idx) => {
                const isAdmin = msg.sender_id === user?.id || msg.sender_id.startsWith('admin');
                
                if (msg.is_internal_note) {
                  return (
                    <div key={msg.id} className="flex justify-center my-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 max-w-lg text-center shadow-sm">
                        <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" /> Internal Note
                        </p>
                        <p className="text-sm text-yellow-900">{msg.message}</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                      isAdmin 
                        ? 'bg-gray-900 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      
                      <div className={`flex items-center justify-end gap-1 mt-2 text-[10px] ${isAdmin ? 'text-gray-400' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isAdmin && (
                          msg.seen ? <CheckCircle className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <form onSubmit={handleSendMessage}>
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isInternalNote} 
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className={isInternalNote ? 'text-yellow-600 font-bold' : ''}>Internal Note (Hidden from customer)</span>
                  </label>
                </div>
                <div className={`flex items-end gap-2 bg-gray-50 rounded-2xl border ${isInternalNote ? 'border-yellow-300 bg-yellow-50/50' : 'border-gray-200'} p-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent`}>
                  <label className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0 cursor-pointer">
                    <input type="file" className="hidden" accept="image/*,application/pdf" />
                    <Paperclip className="w-5 h-5" />
                  </label>
                  
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isInternalNote ? "Type an internal note..." : "Type your reply..."}
                    className="flex-1 max-h-32 bg-transparent text-sm py-2 px-2 outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  
                  <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0 hidden sm:block">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      newMessage.trim() 
                        ? (isInternalNote ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-900 hover:bg-black text-white') 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Customer Details Panel */}
          <div className="w-72 bg-white flex flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-2xl mx-auto mb-4 border-4 border-white shadow-sm">
                {activeConversation.customer?.full_name?.charAt(0) || 'U'}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{activeConversation.customer?.full_name || 'Customer Name'}</h3>
              <p className="text-sm text-gray-500 mb-4">{activeConversation.customer?.email}</p>
              
              <div className="flex items-center justify-center gap-2">
                <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Since</span>
                  <span className="font-medium text-gray-900">Jan 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Orders</span>
                  <span className="font-medium text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-medium text-gray-900">৳ 45,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1"><MapPin className="w-3 h-3"/> Dhaka</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                  <Package className="w-4 h-4 text-gray-400" /> View Recent Orders
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                  <Box className="w-4 h-4 text-gray-400" /> Send Product Card
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                  <Trash2 className="w-4 h-4" /> Delete Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-gray-300">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
            <p className="text-gray-500 text-sm">Choose a conversation from the list to view details and reply to the customer.</p>
          </div>
        </div>
      )}
    </div>
  );
}
