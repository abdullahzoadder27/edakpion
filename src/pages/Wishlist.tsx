import React, { useEffect, useState } from 'react';
import { UserDashboardLayout } from '../components/dashboard/UserDashboardLayout';
import { ShoppingCart, Trash2, Loader2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (!user || !isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: wishlist } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (wishlist) {
          const { data: wishlistItems, error } = await supabase
            .from('wishlist_items')
            .select('id, product_id, products(*)')
            .eq('wishlist_id', wishlist.id);
            
          if (error) throw error;
          setItems(wishlistItems || []);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [user]);

  const handleRemove = async (itemId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId);
      if (error) throw error;
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("Failed to remove item.");
    }
  };

  const handleAddToCart = async (product: any, itemId: string) => {
    if (!user || !supabase) return;
    try {
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        if (createError) throw createError;
        cart = newCart;
      }
      
      const { error: itemError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: product.id,
          quantity: 1,
          price: product.price
        });
        
      if (itemError) throw itemError;
      
      // Optionally remove from wishlist after adding to cart
      handleRemove(itemId);
      alert("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart.");
    }
  };

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Wishlist</h1>
          <span className="text-xs md:text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{items.length} Items</span>
        </div>
        
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-gray-500">
              <Heart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-900">Your wishlist is empty</p>
              <p className="text-sm mt-1 max-w-sm">Save your favorite items here and they'll be ready when you are.</p>
              <Link to="/shop" className="inline-block mt-8 px-8 py-3 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                Discover Styles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence>
                {items.map((item, idx) => {
                  const product = item.products;
                  if (!product) return null;
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      key={item.id} 
                      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all transform hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <Link to={`/product/${product.id}`} className="block aspect-[4/5] bg-gray-100 w-full overflow-hidden relative">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        {/* Overlay on hover (desktop only) */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                      </Link>
                      
                      <div className="p-3 md:p-4 flex flex-col flex-1">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-1 line-clamp-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                        </Link>
                        
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <p className="font-bold text-gray-900 text-sm">৳ {product.price?.toLocaleString()}</p>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded hidden sm:inline-block">IN STOCK</span>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(product, item.id)}
                          className="w-full mt-3 md:mt-4 flex items-center justify-center gap-2 py-2 md:py-2.5 bg-gray-900 text-white text-[10px] md:text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-black active:scale-[0.98] transition-all"
                        >
                          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
}
