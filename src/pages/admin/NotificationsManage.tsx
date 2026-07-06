import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Search, Loader2, CheckCircle, Trash2, Mail, Settings } from 'lucide-react';

export default function NotificationsManage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        if (error.code === '42P01') {
          console.warn('Notifications table does not exist');
          setNotifications([]);
        } else {
          throw error;
        }
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'all' ? true : !n.is_read
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3D2E] tracking-tight">Notifications</h1>
        <div className="flex gap-2">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
          >
            <CheckCircle className="w-4 h-4" /> Mark all read
          </button>
          <button 
            className="px-4 py-2 bg-[#0F3D2E] text-white font-bold rounded-xl hover:bg-[#154636] transition-colors flex items-center gap-2 text-sm"
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-sm overflow-hidden">
        <div className="border-b border-[#E8E4DE] px-6 py-4 flex gap-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`font-bold pb-4 -mb-4 border-b-2 transition-colors ${
              activeTab === 'all' ? 'border-[#0F3D2E] text-[#0F3D2E]' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            All Notifications
          </button>
          <button 
            onClick={() => setActiveTab('unread')}
            className={`font-bold pb-4 -mb-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'unread' ? 'border-[#0F3D2E] text-[#0F3D2E]' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Unread
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F3D2E]" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-900 mb-1">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E4DE]">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 flex gap-4 transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-[#F8F7F5]' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === 'order' ? 'bg-blue-100 text-blue-600' :
                  notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                  notif.type === 'system' ? 'bg-gray-100 text-gray-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold ${!notif.is_read ? 'text-[#0F3D2E]' : 'text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{notif.message}</p>
                  
                  <div className="flex items-center gap-3">
                    {!notif.is_read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-bold text-[#0F3D2E] hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-[#0F3D2E] rounded-full shrink-0 mt-1.5"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
