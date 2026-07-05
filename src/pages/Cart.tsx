import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../lib/store';
import { formatPrice } from '../lib/utils';

export default function Cart() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const deliveryCharge = items.length > 0 ? 100 : 0;
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="bg-[#F5F2ED] min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-6 rounded-full mb-6 text-[#0F3D2E] border border-[#E8E4DE]">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-serif mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md font-light">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="bg-[#0F3D2E] text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors">
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F2ED] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-serif mb-8 text-[#0F3D2E]">SHOPPING CART</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 mb-4 pb-4 border-b">
                  <div className="col-span-6">PRODUCT</div>
                  <div className="col-span-3 text-center">QUANTITY</div>
                  <div className="col-span-2 text-right">PRICE</div>
                  <div className="col-span-1"></div>
                </div>
                
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-4 border-b border-gray-50 last:border-0 pb-0">
                      <div className="col-span-1 sm:col-span-6 flex gap-4">
                        <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.selected_color && `Color: ${item.selected_color}`}
                            {item.selected_color && item.selected_size && ' | '}
                            {item.selected_size && `Size: ${item.selected_size}`}
                          </p>
                          <p className="sm:hidden font-bold mt-2">{formatPrice(item.product.price)}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-1 sm:col-span-3 flex sm:justify-center items-center">
                        <div className="flex items-center border border-[#E8E4DE] rounded-full bg-white">
                          <button 
                            className="p-2 hover:text-[#0F3D2E] transition-colors"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <button 
                            className="p-2 hover:text-[#0F3D2E] transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block col-span-2 text-right font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                      
                      <div className="col-span-1 flex justify-end sm:justify-center absolute sm:relative right-6 mt-4 sm:mt-0 sm:right-auto">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full sm:bg-transparent"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">ORDER SUMMARY</h2>
              
              {/* Coupon Code */}
              <div className="mb-6 pb-6 border-b border-[#E8E4DE]">
                <label className="block text-sm font-bold text-gray-700 mb-2">Have a coupon?</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Coupon Code" className="flex-1 border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" />
                  <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors">Apply</button>
                </div>
              </div>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">VAT (0%)</span>
                  <span className="font-bold">৳0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coupon Discount</span>
                  <span className="font-bold text-red-500">- ৳0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Charge</span>
                  <span className="font-bold">{formatPrice(deliveryCharge)}</span>
                </div>
              </div>
              
              <div className="border-t border-[#E8E4DE] pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-serif text-[#0F3D2E]">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">Including VAT</p>
              </div>
              
              <Link to="/checkout" className="block w-full bg-[#0F3D2E] text-white text-center py-4 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors">
                PROCEED TO CHECKOUT
              </Link>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">SECURE CHECKOUT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

