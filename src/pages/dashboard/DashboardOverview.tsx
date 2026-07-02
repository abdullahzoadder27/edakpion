import React, { useEffect, useState } from 'react';
import { Package, Heart, ShoppingBag, Ticket, ChevronRight, Clock, MapPin, DollarSign, Award, CheckCircle, ChevronUp, Clock4 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserDashboardLayout } from '../../components/dashboard/UserDashboardLayout';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { motion } from 'motion/react';

export function DashboardOverview() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    wishlistCount: 0,
    cartItems: 0,
    savedAddresses: 0,
    coupons: 0,
    rewardPoints: 0,
    storeCredit: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user || !isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      
      try {
        const safeQuery = async (query: any) => {
          try {
            return await query;
          } catch (e) {
            console.error("Query failed", e);
            return { data: null, count: null, error: e };
          }
        };

        const getCartCount = async () => {
          const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
          if (!cart) return { count: 0 };
          return await supabase.from('cart_items').select('id', { count: 'exact', head: true }).eq('cart_id', cart.id);
        };

        const getWishlistCount = async () => {
          const { data: wishlist } = await supabase.from('wishlists').select('id').eq('user_id', user.id).single();
          if (!wishlist) return { count: 0 };
          return await supabase.from('wishlist_items').select('id', { count: 'exact', head: true }).eq('wishlist_id', wishlist.id);
        };

        const [
          ordersRes,
          wishlistRes,
          cartRes,
          addressesRes,
          profileRes,
          recentViewedRes
        ] = await Promise.all([
          safeQuery(supabase.from('orders').select('id, order_number, status, total_amount, created_at', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false })),
          safeQuery(getWishlistCount()),
          safeQuery(getCartCount()),
          safeQuery(supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id)),
          safeQuery(supabase.from('profiles').select('full_name, avatar_url, reward_points, store_credit').eq('id', user.id).single()),
          safeQuery(supabase.from('recently_viewed').select('*, product:products(*)').eq('user_id', user.id).order('viewed_at', { ascending: false }).limit(4))
        ]);

        const orders = ordersRes.data || [];
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length,
          deliveredOrders: orders.filter((o: any) => o.status === 'delivered').length,
          cancelledOrders: orders.filter((o: any) => o.status === 'cancelled').length,
          wishlistCount: wishlistRes.count || 0,
          cartItems: cartRes.count || 0,
          savedAddresses: addressesRes.count || 0,
          coupons: 0, 
          rewardPoints: profileRes.data?.reward_points || 0,
          storeCredit: profileRes.data?.store_credit || 0
        });

        if (profileRes.data?.avatar_url) setProfileImg(profileRes.data.avatar_url);
        if (profileRes.data?.full_name) setProfileName(profileRes.data.full_name);

        setRecentOrders(orders.slice(0, 3));
        setRecentlyViewed(recentViewedRes.data || []);

      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="space-y-6 lg:space-y-8 animate-pulse w-full max-w-full overflow-hidden">
          <div className="h-40 bg-white rounded-[16px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-[16px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-gray-100"></div>)}
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  const displayName = profileName || user?.email?.split('@')[0] || 'User';

  return (
    <UserDashboardLayout>
      <div className="space-y-8 w-full max-w-full">
        
        {/* Welcome Hero Card */}
        <div className="bg-white rounded-[16px] p-6 sm:p-8 xl:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand-dark)] to-black opacity-[0.02] rounded-bl-full -z-0"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10 w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
               {profileImg ? (
                 <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-2xl sm:text-3xl font-bold text-gray-300">{displayName.charAt(0).toUpperCase()}</span>
               )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back, {displayName}</h1>
              <p className="text-gray-500 text-sm sm:text-base font-medium">Manage your account, track orders, and discover new arrivals.</p>
            </div>
          </div>
          <Link to="/shop" className="w-full md:w-auto px-8 py-4 bg-[var(--color-brand-dark)] text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-all duration-300 shadow-md shadow-brand-dark/20 text-center whitespace-nowrap z-10 shrink-0">
            Shop New Arrivals
          </Link>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: Package, link: '/orders' },
            { label: 'Pending', value: stats.pendingOrders, icon: Clock4, link: '/orders' },
            { label: 'Wishlist', value: stats.wishlistCount, icon: Heart, link: '/wishlist' },
            { label: 'Cart', value: stats.cartItems, icon: ShoppingBag, link: '/cart' },
          ].map((stat, i) => (
            <Link to={stat.link} key={i}>
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: "easeOut", duration: 0.4 }}
                className="bg-white rounded-[16px] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col hover:border-[var(--color-brand-dark)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[var(--color-brand-dark)] transition-colors duration-300">
                    <stat.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-brand-dark)] transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Secondary Grid (Orders & Viewed) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recent Orders - Modern Mobile-Friendly Table/Cards */}
          <div className="xl:col-span-2 bg-white rounded-[16px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 lg:p-8 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Orders</h2>
              <Link to="/orders" className="text-sm font-bold text-[var(--color-brand-dark)] hover:text-black flex items-center gap-1 uppercase tracking-wider">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="p-6 lg:p-8 flex-1">
              {recentOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-bold mb-2">No orders yet</p>
                  <p className="text-gray-500 text-sm">When you place an order, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-widest">{order.order_number || `Order #${order.id.split('-')[0]}`}</h3>
                          <p className="text-xs text-gray-500 font-medium mt-1">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Total</p>
                          <p className="font-bold text-sm text-gray-900">৳ {order.total_amount?.toLocaleString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' :
                            'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20'
                          }`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Recently Viewed */}
          <div className="bg-white rounded-[16px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 lg:p-8 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recently Viewed</h2>
              <Clock className="w-5 h-5 text-gray-300" />
            </div>
            
            <div className="p-6 lg:p-8 flex-1 flex flex-col">
               {recentlyViewed.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold mb-2">No history</p>
                    <p className="text-gray-500 text-sm">Products you view will appear here.</p>
                  </div>
               ) : (
                  <div className="space-y-5 flex-1">
                    {recentlyViewed.map(item => (
                      <Link to={`/product/${item.product_id}`} key={item.id} className="flex items-center gap-4 group">
                        <div className="w-[72px] h-[72px] bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <Package className="w-6 h-6 m-auto mt-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--color-brand-dark)] transition-colors">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-[13px] font-bold text-gray-500 mt-1.5">৳ {item.product?.price?.toLocaleString() || 0}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
               )}
               
               {recentlyViewed.length > 0 && (
                 <Link to="/profile/recently-viewed" className="w-full block text-center mt-8 py-3.5 text-xs font-bold tracking-widest uppercase text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                   View Full History
                 </Link>
               )}
            </div>
          </div>
          
        </div>
      </div>
    </UserDashboardLayout>
  );
}
