import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Search, Filter, Eye, Printer, XCircle, CheckCircle, Clock, Truck, FileText } from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    
    // Realtime subscription
    const subscription = supabase.channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          addresses (*),
          order_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
        
      if (error) throw error;
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      order.addresses?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.addresses?.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500">View and manage all customer orders</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name, Phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-dark)] focus:border-transparent"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-brand-dark)]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-dark)]" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-gray-900">{order.order_number}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{order.addresses?.full_name}</p>
                        <p className="text-xs text-gray-500">{order.addresses?.phone}</p>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        ৳ {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-[var(--color-brand-dark)] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold">Order Details #{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-900"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Items */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Ordered Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex gap-4 items-center border border-gray-100 rounded-xl p-4">
                        <img src={item.products?.image_url || item.products?.images?.[0]} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-50" />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{item.products?.name}</h4>
                          <div className="text-xs text-gray-500 mt-1">Qty: {item.quantity} | Unit Price: ৳ {item.price}</div>
                        </div>
                        <div className="font-bold text-gray-900">
                          ৳ {(item.quantity * item.price).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${selectedOrder.status === s ? getStatusColor(s) : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Customer Info</h3>
                  <p className="font-bold text-gray-900">{selectedOrder.addresses?.full_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrder.addresses?.phone}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Shipping Address</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedOrder.addresses?.address_line1}</p>
                    <p className="text-sm text-gray-900">{selectedOrder.addresses?.city}, {selectedOrder.addresses?.state}</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-bold uppercase">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-bold text-[var(--color-brand-dark)] text-lg">৳ {selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="w-full mt-6 bg-white border border-gray-200 text-gray-900 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
