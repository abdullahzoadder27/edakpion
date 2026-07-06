import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Order, OrderItem } from '../../types';

export default function UserOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useOutletContext<any>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!profile?.id || !id) return;
    
    const fetchOrder = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .eq('user_id', profile.id)
          .single();
          
        if (orderError) throw orderError;
        setOrder(orderData);

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);
          
        if (itemsError) throw itemsError;
        setItems(itemsData);
      } catch (err) {
        // console.warn('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, profile]);

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
        .eq('user_id', profile.id);
        
      if (error) throw error;
      setOrder({ ...order, status: 'cancelled' });
      alert('Order cancelled successfully.');
    } catch (err: any) {
      alert('Error cancelling order: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading order details...</div>;
  if (!order) return <div className="p-12 text-center">Order not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/account/orders" className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-[#0F3D2E]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-[#0F3D2E]">Order Details</h1>
          <p className="text-sm text-gray-500">#{order.id.split('-')[0].toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
            <div className="p-6 border-b border-[#E8E4DE] flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Placed on</p>
                <p className="font-medium text-[#0F3D2E]">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="font-medium text-[#0F3D2E]">৳ {order.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <h3 className="font-serif text-lg text-[#0F3D2E]">Items in your order</h3>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl">
                    <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img loading="lazy" decoding="async" src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-full h-full p-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-[#0F3D2E] text-sm md:text-base line-clamp-2">{item.product_name}</h4>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          {item.selected_color && <span>Color: {item.selected_color}</span>}
                          {item.selected_size && <span>Size: {item.selected_size}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="font-medium text-[#0F3D2E]">
                        ৳ {item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            {order.status === 'pending' && (
              <button 
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-6 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE]">
            <h3 className="font-serif text-lg text-[#0F3D2E] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳ {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>৳ {order.delivery_charge}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between font-medium text-[#0F3D2E] text-base">
                <span>Total</span>
                <span>৳ {order.total}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <p className="font-medium text-[#0F3D2E]">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              
              <p className="text-sm text-gray-500 mb-1 mt-3">Payment Status</p>
              <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE]">
            <h3 className="font-serif text-lg text-[#0F3D2E] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Delivery Address
            </h3>
            <div className="text-sm space-y-1 text-gray-600">
              <p className="font-medium text-[#0F3D2E]">{order.customer_name}</p>
              <p>{order.phone}</p>
              <p>{order.email}</p>
              <p className="mt-2">{order.address}</p>
              <p>{order.district}, {order.division}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
