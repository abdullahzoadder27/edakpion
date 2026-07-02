import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { Trash2, Plus, Minus, Loader2, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, loading, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'EDAK10') {
      setDiscount(0.1);
      alert('10% Discount applied!');
    } else {
      alert('Invalid coupon code');
      setDiscount(0);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.products?.price || 0) * item.quantity, 0);
  const discountAmount = subtotal * discount;
  const tax = (subtotal - discountAmount) * 0.05; // 5% tax example
  const delivery = subtotal > 0 ? 120 : 0; // 120 Tk delivery
  const total = subtotal - discountAmount + tax + delivery;

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-[var(--color-brand-cream)]">
      <Header />
      <main className="flex-grow py-8 md:py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-[var(--color-brand-dark)]">Your Shopping Cart</h1>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--color-brand-dark)]" /></div>
        ) : cartItems.length === 0 ? (
          <div className="premium-card p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Discover our latest collections.</p>
            
            <Link to="/shop" className="bg-[var(--color-brand-dark)] text-white px-8 py-3 rounded-xl font-bold tracking-widest hover:bg-[#152e22] transition-colors premium-button text-xs md:text-sm">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id} 
                    className="premium-card p-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center relative group"
                  >
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 sm:top-1/2 sm:-translate-y-1/2 sm:right-6 w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {item.products?.images?.[0] ? (
                        <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                      ) : item.products?.imageUrl ? (
                        <img src={item.products.imageUrl} alt={item.products.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    
                    <div className="flex-1 pr-8 sm:pr-12">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">{item.products?.name}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-4">Price: ৳ {item.products?.price?.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-gray-900">৳ {((item.products?.price || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="lg:col-span-1">
              <div className="premium-card p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>
                
                <div className="mb-6 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-dark)] outline-none transition-all uppercase"
                    />
                  </div>
                  <button onClick={applyCoupon} className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
                    Apply
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900">৳ {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount (10%)</span>
                      <span className="font-bold text-green-600">- ৳ {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (5%)</span>
                    <span className="font-bold text-gray-900">৳ {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Charge</span>
                    <span className="font-bold text-gray-900">৳ {delivery.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Grand Total</span>
                    <span className="font-bold text-xl text-[var(--color-brand-dark)]">৳ {total.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[var(--color-brand-dark)] text-white py-4 premium-button font-bold tracking-widest hover:bg-[#152e22] flex items-center justify-center gap-2 mt-4"
                >
                  PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
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
