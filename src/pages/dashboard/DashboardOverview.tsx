import React, { useEffect, useState } from 'react';
import { Package, Heart, ShoppingBag, Ticket, ChevronRight, Clock, MapPin, DollarSign, Award, CheckCircle, XCircle, Clock4 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
          safeQuery(supabase.from('orders').select('id, status, total_amount, created_at', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false })),
          safeQuery(getWishlistCount()),
          safeQuery(getCartCount()),
          safeQuery(supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id)),
          safeQuery(supabase.from('profiles').select('avatar_url, reward_points, store_credit').eq('id', user.id).single()),
          safeQuery(supabase.from('recently_viewed').select('*, product:products(*)').eq('user_id', user.id).order('viewed_at', { ascending: false }).limit(3))
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
          coupons: 0, // Placeholder if no coupons table exists yet
          rewardPoints: profileRes.data?.reward_points || 0,
          storeCredit: profileRes.data?.store_credit || 0
        });

        if (profileRes.data?.avatar_url) {
          setProfileImg(profileRes.data.avatar_url);
        }

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
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
             {profileImg ? (
               <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <span className="text-xl md:text-2xl font-bold text-gray-400">{user?.email?.charAt(0).toUpperCase()}</span>
             )}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 line-clamp-1">Welcome back, {user?.email?.split('@')[0]}</h1>
            <p className="text-gray-500 text-xs md:text-sm">Manage your account and track orders</p>
          </div>
        </div>
        <Link to="/shop" className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-colors shadow-md text-center">
          Continue Shopping
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'bg-blue-50 text-blue-600', link: '/orders' },
          { label: 'Pending', value: stats.pendingOrders, icon: Clock4, color: 'bg-orange-50 text-orange-600', link: '/orders' },
          { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: 'bg-green-50 text-green-600', link: '/orders' },
          { label: 'Wishlist', value: stats.wishlistCount, icon: Heart, color: 'bg-pink-50 text-pink-600', link: '/wishlist' },
          { label: 'Cart Items', value: stats.cartItems, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600', link: '/cart' },
          { label: 'Addresses', value: stats.savedAddresses, icon: MapPin, color: 'bg-teal-50 text-teal-600', link: '/profile/addresses' },
          { label: 'Coupons', value: stats.coupons, icon: Ticket, color: 'bg-indigo-50 text-indigo-600', link: '/profile/coupons' },
          { label: 'Reward Pts', value: stats.rewardPoints, icon: Award, color: 'bg-yellow-50 text-yellow-600', link: '/profile' },
          { label: 'Store Credit', value: `৳${stats.storeCredit}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', link: '/profile' },
        ].map((stat, i) => (
          <Link to={stat.link} key={i}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform h-full cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs md:text-sm font-medium text-gray-500">{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm font-medium text-[var(--color-brand-dark)] hover:text-black flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No recent orders found.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-900 break-all">Order #{order.id}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="sm:text-right flex items-center sm:block justify-between mt-2 sm:mt-0">
                    <p className="font-bold text-sm text-gray-900">৳ {order.total_amount?.toLocaleString()}</p>
                    <span className={`inline-block sm:mt-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recently Viewed */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recently Viewed</h2>
            <Link to="/profile/recently-viewed" className="text-sm font-medium text-gray-400 hover:text-gray-900">
              <Clock className="w-5 h-5" />
            </Link>
          </div>
          <div className="space-y-4 flex-1">
             {recentlyViewed.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No recently viewed items.</p>
                </div>
             ) : (
                recentlyViewed.map(item => (
                  <Link to={`/product/${item.product_id}`} key={item.id} className="flex items-center gap-4 group">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <Package className="w-6 h-6 m-auto mt-5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[var(--color-brand-dark)]">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-500 mt-1">৳ {item.product?.price?.toLocaleString() || 0}</p>
                    </div>
                  </Link>
                ))
             )}
          </div>
          <Link to="/profile/recently-viewed" className="w-full block text-center mt-6 py-3 text-xs font-bold tracking-widest uppercase text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            View History
          </Link>
        </div>
      </div>
    </div>
  );
}
