import { Heart } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import React from 'react';

interface ProductGridProps {
  activeTab?: string;
}

export function ProductGrid({ activeTab }: ProductGridProps) {
  const { products, loading } = useProducts(activeTab);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please login to add to wishlist.");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let { data: wishlist } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (!wishlist) {
          const { data: newWishlist, error: createError } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id })
            .select()
            .single();
            
          if (createError) throw createError;
          wishlist = newWishlist;
        }

        await supabase
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlist.id,
            product_id: productId
          });
          
        alert("Added to wishlist!");
      } catch (error) {
        console.error('Error adding to wishlist:', error);
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    await addToCart(productId, 1);
    alert("Added to cart!");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mb-16">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-lg font-bold tracking-wide uppercase">{activeTab ? activeTab : 'Top Picks'}</h2>
        <Link to="/shop" className="text-xs font-bold tracking-widest bg-[var(--color-brand-dark)] text-white px-5 py-2 rounded hover:bg-[#152e22] transition-colors">
          VIEW ALL
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm font-medium">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer block premium-card premium-hover p-3">
              <div className="relative bg-[#f4f1e9] rounded-xl overflow-hidden mb-4 aspect-[4/5]">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={(e) => handleWishlist(e, product.id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white premium-button rounded-full flex items-center justify-center hover:text-red-500 z-10"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="px-1 pb-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm font-medium text-gray-900 mb-3">৳ {product.price.toFixed(2)}</p>
                <button 
                  onClick={(e) => handleAddToCart(e, product.id)}
                  className="bg-[var(--color-brand-dark)] text-white px-5 py-2 rounded-xl text-xs font-bold tracking-wider premium-button hover:bg-[#152e22] w-max z-10 relative"
                >
                  ADD TO CART
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
