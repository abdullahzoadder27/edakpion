import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function OrderDetailAdmin() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone
          ),
          order_items (
            id,
            product_id,
            quantity,
            price,
            product_name,
            selected_size,
            selected_color,
            products (
              images
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err) {
      // console.warn('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.warn('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 text-gray-500 hover:bg-white rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-bold text-[#0F3D2E]">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-bold text-[#0F3D2E]">{formatDate(order.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4 border-y border-[#E8E4DE]">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Order Status</label>
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="font-bold text-[#0F3D2E]">Order Items</h3>
              <div className="divide-y divide-[#E8E4DE]">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="py-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.products?.images?.[0] ? (
                        <img src={item.products.images[0]} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0F3D2E]">{item.product_name}</p>
                      <div className="text-xs text-gray-500 mt-1 flex gap-3">
                        {item.selected_color && <span>Color: {item.selected_color}</span>}
                        {item.selected_size && <span>Size: {item.selected_size}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right font-bold text-[#0F3D2E]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h3 className="font-bold text-[#0F3D2E] mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="pt-3 border-t border-[#E8E4DE] flex justify-between font-bold text-lg text-[#0F3D2E]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h3 className="font-bold text-[#0F3D2E] mb-4">Customer Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Name</p>
                <p className="font-bold text-[#0F3D2E]">{order.profiles?.full_name || 'Guest User'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium text-[#0F3D2E]">{order.profiles?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-[#0F3D2E]">{order.profiles?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h3 className="font-bold text-[#0F3D2E] mb-4">Shipping Address</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-bold text-[#0F3D2E]">{order.shipping_address?.full_name || order.profiles?.full_name}</p>
              <p>{order.shipping_address?.address_line1}</p>
              {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}</p>
              <p>{order.shipping_address?.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
