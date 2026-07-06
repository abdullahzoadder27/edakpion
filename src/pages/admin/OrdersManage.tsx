import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';
import { Search, Filter, Eye, Trash2 } from 'lucide-react';

export default function OrdersManage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.warn('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.warn('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string, status: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    setDeletingId(id);
    try {
      // Restore stock manually first just in case trigger doesn't exist
      if (status !== 'cancelled') {
        const { data: items } = await supabase.from('order_items').select('product_id, quantity').eq('order_id', id);
        for (const item of items || []) {
          if (item.product_id) {
            const { data: p } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
            if (p) {
              await supabase.from('products').update({ stock: p.stock + item.quantity }).eq('id', item.product_id);
            }
          }
        }
      }

      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      
      setOrders(orders.filter(o => o.id !== id));
      
      // Log Activity
      if (user) {
        await supabase.from('admin_activity_logs').insert({
          admin_id: user.id,
          action: 'deleted',
          entity_type: 'order',
          entity_id: id,
          metadata: { notes: 'Deleted order from manage page' }
        });
      }
      alert('Order deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.order_number?.toLowerCase().includes(search.toLowerCase()) || 
                          o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Orders</h1>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E8E4DE] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-96 bg-gray-50 px-4 py-2 rounded-lg border border-[#E8E4DE]">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 px-4 py-2 rounded-lg border border-[#E8E4DE] text-sm focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F2ED] text-[#0F3D2E]">
              <tr>
                <th className="px-6 py-4 font-bold">Order #</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DE]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="font-bold text-base text-[#0F3D2E]">{order.order_number || order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F3D2E]">{order.customer_name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{order.email || '-'}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0F3D2E]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full outline-none border-none ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 p-2 bg-gray-50 hover:bg-gray-100 text-[#0F3D2E] rounded transition-colors"
                          title="View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(order.id, order.status)}
                          disabled={deletingId === order.id}
                          className="inline-flex items-center gap-1 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors disabled:opacity-50"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
