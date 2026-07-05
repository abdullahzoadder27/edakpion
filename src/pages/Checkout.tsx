import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../lib/store';
import { formatPrice } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const navigate = useNavigate();
  const { items: cartItems, getSubtotal, clearCart } = useCartStore();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  
  const items = buyNowItem ? [buyNowItem] : cartItems;
  const [loading, setLoading] = useState(false);
  
  const subtotal = buyNowItem 
    ? (buyNowItem.product.price * buyNowItem.quantity) 
    : getSubtotal();
  const deliveryCharge = 100;
  const total = subtotal + deliveryCharge;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    division: '',
    district: '',
    address: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get current user if any
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // 2. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          division: formData.division,
          district: formData.district,
          address: formData.address,
          notes: formData.notes,
          subtotal,
          delivery_charge: deliveryCharge,
          total,
          payment_method: 'Cash on Delivery',
          payment_status: 'unpaid',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        selected_size: item.selected_size,
        selected_color: item.selected_color,
        image_url: item.product.images[0]
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Clear cart if not buy now
      if (!buyNowItem) {
        clearCart();
      }
      navigate(`/order-success/${order.id}`);

    } catch (error) {
      console.warn('Checkout error:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-[#F5F2ED] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-serif mb-8 text-center md:text-left text-[#0F3D2E]">CHECKOUT</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6">Delivery Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Division *</label>
                  <select name="division" required value={formData.division} onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E] bg-white">
                    <option value="">Select Division</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">District *</label>
                  <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Address *</label>
                  <textarea name="address" required rows={3} value={formData.address} onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" placeholder="House number, street name, area..."></textarea>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Order Notes (Optional)</label>
                  <textarea name="notes" rows={2} value={formData.notes} onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-[#0F3D2E] rounded-lg bg-[#F5F2ED] cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-[#0F3D2E]" />
                  <span className="font-bold text-[#0F3D2E]">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-not-allowed opacity-60">
                  <input type="radio" name="payment" disabled className="w-4 h-4" />
                  <span className="font-bold text-gray-600">Online Payment (Coming Soon)</span>
                </label>
              </div>
            </div>

          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">ORDER SUMMARY</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4 text-sm">
                    <div className="flex gap-3">
                      <div className="relative">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.quantity}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.selected_size} / {item.selected_color}</p>
                      </div>
                    </div>
                    <span className="font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm mb-6 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Charge</span>
                  <span className="font-bold">{formatPrice(deliveryCharge)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-8 border-[#E8E4DE]">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-serif text-[#0F3D2E]">{formatPrice(total)}</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0F3D2E] text-white py-4 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESSING...' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

