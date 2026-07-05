import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, Search, ChevronRight } from 'lucide-react';
import { Order } from '../../types';

export default function UserOrders() {
  const { profile } = useOutletContext<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchOrders = async () => {
      try {
        let query = supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
        
        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        if (data) {
          if (search) {
            setOrders(data.filter(o => o.id.toLowerCase().includes(search.toLowerCase())));
          } else {
            setOrders(data as Order[]);
          }
        }
      } catch (err) {
        // console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [profile, filter, search]);

  const tabs = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0F3D2E]">My Orders</h1>
          <p className="text-gray-500 text-sm">View and track your recent orders.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white rounded-lg border border-[#E8E4DE] outline-none text-sm focus:border-[#0F3D2E]"
          />
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              filter === tab ? 'bg-[#0F3D2E] text-white' : 'bg-white text-gray-600 border border-[#E8E4DE] hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E4DE]">
            {orders.map(order => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-medium text-[#0F3D2E]">Order #{order.id.split('-')[0].toUpperCase()}</h3>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.payment_status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <p>Total Amount: <span className="font-medium text-[#0F3D2E]">৳ {order.total}</span></p>
                    <p>Payment Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  </div>
                  <Link 
                    to={`/account/orders/${order.id}`}
                    className="inline-flex items-center text-sm font-medium text-[#0F3D2E] hover:underline"
                  >
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
