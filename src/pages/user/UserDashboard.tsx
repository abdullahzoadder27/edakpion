import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, Heart, Bell, HelpCircle, Clock, ShoppingBag } from 'lucide-react';

export default function UserDashboard() {
  const { profile } = useOutletContext<any>();
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    unreadNotifications: 0,
    activeTickets: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const [
          { count: ordersCount },
          { count: wishlistCount },
          { count: notifCount },
          { count: ticketsCount },
          { data: orders }
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
          supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
          supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('is_read', false),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).neq('status', 'closed'),
          supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5)
        ]);

        setStats({
          totalOrders: ordersCount || 0,
          wishlistItems: wishlistCount || 0,
          unreadNotifications: notifCount || 0,
          activeTickets: ticketsCount || 0
        });
        
        setRecentOrders(orders || []);
      } catch (error) {
        // console.warn('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (loading) return <div className="py-12 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[#0F3D2E] mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!</h1>
        <p className="text-gray-500">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-[#0F3D2E]/10 rounded-full flex items-center justify-center text-[#0F3D2E] mb-3">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-3xl font-serif text-[#0F3D2E] mb-1">{stats.totalOrders}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-3xl font-serif text-[#0F3D2E] mb-1">{stats.wishlistItems}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Wishlist</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-3xl font-serif text-[#0F3D2E] mb-1">{stats.unreadNotifications}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Unread</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <p className="text-3xl font-serif text-[#0F3D2E] mb-1">{stats.activeTickets}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Support</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
        <div className="p-6 border-b border-[#E8E4DE] flex items-center justify-between">
          <h2 className="text-xl font-serif text-[#0F3D2E]">Recent Orders</h2>
          <Link to="/account/orders" className="text-sm font-bold uppercase tracking-wider text-[#0F3D2E] hover:underline">
            View All
          </Link>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>You haven't placed any orders yet.</p>
              <Link to="/" className="inline-block mt-4 px-6 py-2 bg-[#0F3D2E] text-white rounded-full text-sm font-medium hover:bg-green-800 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#E8E4DE] rounded-xl gap-4">
                  <div>
                    <p className="font-medium text-[#0F3D2E] mb-1">Order #{order.order_number || order.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium text-[#0F3D2E]">৳ {order.total}</p>
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <Link to={`/account/orders/${order.id}`} className="px-4 py-2 border border-[#E8E4DE] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

