import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../lib/store';
import { formatPrice } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Loader2, Tag, Check, X as XIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Checkout() {
  const navigate = useNavigate();
  const { items: cartItems, getSubtotal, clearCart } = useCartStore();
  const location = useLocation();
  const { user } = useAuth();
  
  const buyNowItem = location.state?.buyNowItem;
  const items = buyNowItem ? [buyNowItem] : cartItems;
  
  const [loading, setLoading] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const { data } = await supabase.from('delivery_zones').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (data) setDeliveryZones(data);
      } catch (err) {
        console.warn('Error fetching delivery zones:', err);
      }
    };
    fetchZones();
  }, []);
  
  const insideZones = deliveryZones.filter(z => z.zone_type === 'inside');
  const outsideZone = deliveryZones.find(z => z.zone_type === 'outside') || { id: 'outside-default', city_name: 'Outside Selected Cities', delivery_charge: 150 };
  
  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId) || (selectedZoneId === outsideZone.id ? outsideZone : null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  
  const subtotal = buyNowItem 
    ? (buyNowItem.product.price * buyNowItem.quantity) 
    : getSubtotal();
    
  let baseDeliveryCharge = selectedZone ? Number(selectedZone.delivery_charge) : (selectedZoneId === outsideZone.id ? Number(outsideZone.delivery_charge) : 0);
  
  let deliveryCharge = baseDeliveryCharge;
  if (appliedCoupon?.free_shipping) {
    deliveryCharge = 0;
  }
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
    if (appliedCoupon.maximum_discount_amount && discountAmount > appliedCoupon.maximum_discount_amount) {
      discountAmount = appliedCoupon.maximum_discount_amount;
    }
  }
  
  const total = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
    delivery_area: '',
    address: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();
        
      if (error || !coupon) {
        throw new Error('Invalid coupon code');
      }
      
      if (!coupon.is_active) throw new Error('This coupon is no longer active');
      if (coupon.start_date && new Date(coupon.start_date) > new Date()) throw new Error('Coupon is not valid yet');
      if (coupon.end_date && new Date(coupon.end_date) < new Date()) throw new Error('Coupon has expired');
      if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) throw new Error(`Minimum order amount is ৳${coupon.minimum_order_amount}`);
      
      setAppliedCoupon(coupon);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedZoneId || !formData.delivery_area) {
      alert("Please select a delivery area.");
      return;
    }
    
    setLoading(true);

    try {
      // Create order
      const orderId = crypto.randomUUID();
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          user_id: user?.id || null,
          customer_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          division: formData.delivery_area,
          district: formData.delivery_area,
          address: formData.address,
          notes: formData.notes,
          subtotal,
          delivery_charge: deliveryCharge,
          discount: discountAmount,
          total: total,
          coupon_code: appliedCoupon?.code || null,
          status: 'pending',
          payment_method: 'cod',
          payment_status: 'pending'
        }]).select('*').single();

      if (orderError) throw orderError;
      
      // Store coupon usage if applied
      if (appliedCoupon) {
        await supabase.from('coupon_usages').insert([{
          coupon_id: appliedCoupon.id,
          order_id: orderId,
          discount_amount: discountAmount,
          user_id: user?.id || null
        }]);
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        selected_size: item.selected_size,
        selected_color: item.selected_color
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart only if this wasn't a buy now action
      if (!buyNowItem) {
        clearCart();
      }

      navigate(`/order-success/${orderData?.order_number || orderId}`);
    } catch (error: any) {
      alert(error.message || 'Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#F8F7F5]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-[#0F3D2E] text-white rounded-xl">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E4DE] h-fit">
            <h2 className="text-xl font-bold text-[#0F3D2E] mb-6 border-b pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 border-b border-[#E8E4DE] pb-4 last:border-0 last:pb-0">
                  <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.product.images?.[0] && (
                      <img loading="lazy" decoding="async" src={item.product.images[0] || 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=No+Image'} alt={item.product.name} title={item.product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Error'; }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0F3D2E] text-sm md:text-base line-clamp-2">{item.product.name}</h3>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {item.selected_size && <p>Size: {item.selected_size}</p>}
                      {item.selected_color && <p>Color: {item.selected_color}</p>}
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-bold text-[#0F3D2E]">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Coupon Code Section */}
            <div className="border-t border-[#E8E4DE] pt-4 mb-4">
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-green-800">
                    <Tag className="w-4 h-4" />
                    <span className="font-bold">{appliedCoupon.code}</span> applied!
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center">
                    <XIcon className="w-4 h-4" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Discount code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 uppercase"
                  />
                  <button 
                    type="button" 
                    onClick={applyCoupon}
                    disabled={checkingCoupon || !couponCode.trim()}
                    className="bg-[#0F3D2E] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#154636] disabled:opacity-50 flex items-center"
                  >
                    {checkingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
            </div>

            <div className="space-y-3 text-sm border-t border-[#E8E4DE] pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>{deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount {appliedCoupon?.type === 'percentage' && `(${appliedCoupon.value}%)`}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-[#0F3D2E] border-t border-[#E8E4DE] pt-3">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E4DE]">
            <h2 className="text-xl font-bold text-[#0F3D2E] mb-6 border-b pb-4">Delivery Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Full Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" placeholder="01XXXXXXXXX" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20" placeholder="john@example.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Delivery Area *</label>
                <select 
                  required 
                  value={selectedZoneId} 
                  onChange={(e) => {
                    setSelectedZoneId(e.target.value);
                    const zone = deliveryZones.find(z => z.id === e.target.value);
                    if (zone) {
                      setFormData({ ...formData, delivery_area: zone.city_name });
                    } else if (e.target.value === outsideZone.id) {
                      setFormData({ ...formData, delivery_area: outsideZone.city_name });
                    }
                  }} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                >
                  <option value="">Select Delivery Area</option>
                  {insideZones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.city_name}</option>
                  ))}
                  <option value={outsideZone.id}>{outsideZone.city_name}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Full Address *</label>
                <textarea required name="address" rows={3} value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 resize-none" placeholder="House, Road, Area..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Order Notes (Optional)</label>
                <textarea name="notes" rows={2} value={formData.notes} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 resize-none" placeholder="Any special instructions..." />
              </div>

              <div className="bg-[#F8F7F5] p-4 rounded-xl border border-[#E8E4DE] mt-6">
                <h3 className="font-bold text-[#0F3D2E] mb-2">Payment Method</h3>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E8E4DE]">
                  <input type="radio" id="cod" name="payment" defaultChecked className="w-4 h-4 text-[#0F3D2E]" />
                  <label htmlFor="cod" className="font-bold text-sm">Cash on Delivery (COD)</label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-6 bg-[#0F3D2E] text-white rounded-xl font-bold text-lg hover:bg-[#154636] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : `Confirm Order - ${formatPrice(total)}`}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
