import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Loader2, CheckCircle2, MapPin } from 'lucide-react';

export function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    async function loadCheckoutData() {
      if (!user || !isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      try {
        // Fetch cart
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          setCartId(cart.id);
          const { data: items } = await supabase
            .from('cart_items')
            .select('id, quantity, products(*)')
            .eq('cart_id', cart.id);
          setCartItems(items || []);
        }
        
        // Fetch addresses
        const { data: userAddresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });
          
        setAddresses(userAddresses || []);
        if (userAddresses && userAddresses.length > 0) {
          const defaultAddr = userAddresses.find(a => a.is_default);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : userAddresses[0].id);
        }
      } catch (err) {
        console.error('Error loading checkout data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCheckoutData();
  }, [user]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.products?.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.05;
  const delivery = subtotal > 0 ? 120 : 0;
  const total = subtotal + tax + delivery;

  const handlePlaceOrder = async () => {
    if (!user || !supabase || !cartId || cartItems.length === 0) return;
    
    if (!selectedAddressId) {
      alert("Please select or add a shipping address.");
      return;
    }
    
    setPlacingOrder(true);
    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          shipping_address_id: selectedAddressId
        })
        .select('id')
        .single();
        
      if (orderError) throw orderError;
      
      // 2. Create order items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsError) throw itemsError;
      
      // 3. Clear cart
      await supabase.from('cart_items').delete().eq('cart_id', cartId);
      
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen font-sans antialiased flex flex-col bg-[var(--color-brand-cream)]">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-8">Thank you for your purchase. We are processing your order and will redirect you to the orders page shortly.</p>
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--color-brand-dark)] rounded-full animate-spin mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-[var(--color-brand-cream)]">
      <Header />
      <main className="flex-grow py-8 md:py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-[var(--color-brand-dark)]">Checkout</h1>
        
        {!user && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 flex justify-between items-center text-sm">
            <span>You are checking out as a guest.</span>
            <Link to="/login" className="font-bold underline">Login for faster checkout</Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--color-brand-dark)]" /></div>
        ) : cartItems.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <p className="text-gray-500 mb-6">Your cart is empty.</p>
            <Link to="/shop" className="bg-[var(--color-brand-dark)] text-white px-8 py-3 rounded-xl font-bold tracking-widest hover:bg-[#152e22] transition-colors premium-button">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6 md:space-y-8">
              {/* Shipping Info */}
              <div className="premium-card p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-bold">Shipping Address</h2>
                  {user && addresses.length > 0 && (
                    <Link to="/profile/addresses" className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider underline">
                      Manage Addresses
                    </Link>
                  )}
                </div>
                
                {user && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-[var(--color-brand-dark)] bg-gray-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input 
                          type="radio" 
                          name="address" 
                          className="mt-1 mr-4 w-4 h-4 text-[var(--color-brand-dark)] border-gray-300 focus:ring-[var(--color-brand-dark)]" 
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{addr.title}</span>
                            {addr.is_default && <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{addr.full_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">First Name</label>
                      <input type="text" className="w-full px-4 py-3 premium-input text-sm" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Last Name</label>
                      <input type="text" className="w-full px-4 py-3 premium-input text-sm" placeholder="Doe" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Address</label>
                      <input type="text" className="w-full px-4 py-3 premium-input text-sm" placeholder="123 Main St, Apt 4B" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">District / City</label>
                      <input type="text" className="w-full px-4 py-3 premium-input text-sm" placeholder="Dhaka" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone</label>
                      <input type="tel" className="w-full px-4 py-3 premium-input text-sm" placeholder="+880 1..." />
                    </div>
                  </form>
                )}
              </div>
              
              {/* Payment Info */}
              <div className="premium-card p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[var(--color-brand-dark)] bg-gray-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" className="mr-3 w-4 h-4 text-[var(--color-brand-dark)] focus:ring-[var(--color-brand-dark)]" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <span className="font-medium text-sm">Cash on Delivery</span>
                  </label>
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'wa' ? 'border-[var(--color-brand-dark)] bg-gray-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" className="mr-3 w-4 h-4 text-[var(--color-brand-dark)] focus:ring-[var(--color-brand-dark)]" checked={paymentMethod === 'wa'} onChange={() => setPaymentMethod('wa')} />
                    <span className="font-medium text-sm">WhatsApp Checkout</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="premium-card p-4 md:p-6 sticky top-24">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-100 pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 items-start border-b border-gray-50 pb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.products?.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold">৳ {(item.products?.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">৳ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="font-medium">৳ {delivery.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium">৳ {tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Grand Total</span>
                    <span className="font-bold text-lg md:text-xl text-[var(--color-brand-dark)]">৳ {total.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || (!selectedAddressId && user != null)}
                  className="w-full bg-[var(--color-brand-dark)] text-white py-4 premium-button font-bold tracking-widest hover:bg-[#152e22] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {placingOrder ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> PROCESSING...</>
                  ) : (
                    'CONFIRM ORDER'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
