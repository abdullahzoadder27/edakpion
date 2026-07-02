import React, { useEffect, useState } from 'react';
import { UserDashboardLayout } from '../components/dashboard/UserDashboardLayout';
import { Package, Download, Search, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion } from 'motion/react';

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchOrders() {
      if (!user || !isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*, product:products(*))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        // Silent catch for expected fallback
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Orders</h1>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search order ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No orders found</p>
              <p className="text-sm mt-1">Try adjusting your filters or place a new order.</p>
              <Link to="/shop" className="inline-block mt-6 px-6 py-2 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order, idx) => {
                const isDelivered = order.status === 'delivered';
                const isCancelled = order.status === 'cancelled';
                const progressWidth = isDelivered ? '100%' : isCancelled ? '100%' : order.status === 'shipped' ? '75%' : order.status === 'processing' ? '50%' : '25%';

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={order.id} 
                    className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-gray-50 p-4 border-b border-gray-100 grid grid-cols-2 md:flex md:flex-wrap gap-4 md:items-center md:justify-between">
                      <div className="col-span-1">
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order Placed</p>
                        <p className="text-xs md:text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total</p>
                        <p className="text-xs md:text-sm font-medium text-gray-900">৳ {order.total_amount?.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order #</p>
                        <p className="text-xs md:text-sm font-medium text-gray-900 break-all">{order.id}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1 flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-[10px] md:text-xs font-bold tracking-widest uppercase text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-center">
                          Details
                        </button>
                        <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-[10px] md:text-xs font-bold tracking-widest uppercase text-gray-900 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <Download className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Invoice</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                      <div className="w-full md:w-1/2 space-y-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {item.product?.images?.[0] ? (
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-8 h-8 m-auto mt-4 md:mt-6 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xs md:text-sm text-gray-900 line-clamp-2">{item.product?.name || 'Unknown Product'}</h3>
                              <p className="text-[10px] md:text-xs text-gray-500 mt-1">Price: ৳ {item.price?.toLocaleString()} | Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Status Timeline */}
                      <div className="flex-1 w-full md:w-auto max-w-md mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Status</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${isDelivered ? 'bg-green-100 text-green-700' : isCancelled ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-gray-100">
                            <div style={{ width: progressWidth }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${isCancelled ? 'bg-red-500' : 'bg-gray-900'}`}></div>
                          </div>
                          {!isCancelled && (
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              <span className={order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'text-gray-900' : ''}>Placed</span>
                              <span className={order.status === 'shipped' || order.status === 'delivered' ? 'text-gray-900' : ''}>Shipped</span>
                              <span className={isDelivered ? 'text-gray-900' : ''}>Delivered</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
}

