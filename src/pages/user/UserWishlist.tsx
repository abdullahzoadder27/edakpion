import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import { Product } from '../../types';

export default function UserWishlist() {
  const { profile } = useOutletContext<any>();
  const [wishlistItems, setWishlistItems] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchWishlist = async () => {
      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select('id, product_id, products(*)')
          .eq('user_id', profile.id);
          
        if (error) throw error;
        
        if (data) {
          // map it correctly
          const mapped = data.map((item: any) => ({
            id: item.id,
            product: item.products
          })).filter(item => item.product != null);
          setWishlistItems(mapped);
        }
      } catch (err) {
        // console.warn('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [profile]);

  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase.from('wishlists').delete().eq('id', id);
      if (error) throw error;
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.warn('Error removing from wishlist:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#0F3D2E]">My Wishlist</h1>
        <p className="text-gray-500 text-sm">Save your favorite items here.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">Loading wishlist...</div>
      ) : wishlistItems.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-[#0F3D2E] mb-2">Your wishlist is empty</p>
          <p className="mb-6">Save items you love to your wishlist and buy them later.</p>
          <Link to="/" className="inline-block px-8 py-3 bg-[#0F3D2E] text-white rounded-full text-sm font-bold tracking-wider hover:bg-[#154636] transition-colors">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />
              <button 
                onClick={() => handleRemove(item.id)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
