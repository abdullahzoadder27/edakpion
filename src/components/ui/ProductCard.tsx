import { Heart, Plus, ShoppingBag, Eye, ArrowRightLeft, Share2, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../lib/store';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [inWishlist, setInWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    checkWishlist();
  }, [product.id]);
  
  const checkWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .single();
      if (data) setInWishlist(true);
    } else {
      // Local storage fallback for guests
      const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      setInWishlist(guestWishlist.includes(product.id));
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      await addItem(product, 1, product.sizes?.[0], product.colors?.[0]);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      navigate('/checkout', {
        state: {
          buyNowItem: {
            id: 'buy-now',
            product,
            quantity: 1,
            selected_size: product.sizes?.[0],
            selected_color: product.colors?.[0]
          }
        }
      });
    }
  };
  
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      if (inWishlist) {
        await supabase.from('wishlists').delete().eq('user_id', session.user.id).eq('product_id', product.id);
        setInWishlist(false);
      } else {
        await supabase.from('wishlists').insert([{ user_id: session.user.id, product_id: product.id }]);
        setInWishlist(true);
      }
    } else {
      let guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      if (inWishlist) {
        guestWishlist = guestWishlist.filter((id: string) => id !== product.id);
        setInWishlist(false);
      } else {
        guestWishlist.push(product.id);
        setInWishlist(true);
      }
      localStorage.setItem('guest_wishlist', JSON.stringify(guestWishlist));
    }
  };
  
  const discountPercent = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) 
    : 0;

  return (
    <Link to={`/product/${product.slug}`} className="bg-white rounded-3xl p-3 border border-[#E8E4DE] flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300 relative h-full">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {discountPercent > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">-{discountPercent}%</span>
        )}
        {product.stock <= 0 && (
          <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full">OUT OF STOCK</span>
        )}
      </div>

      <div className="aspect-[3/4] bg-[#F5F5F5] rounded-2xl mb-3 relative flex items-center justify-center overflow-hidden">
        {/* Top Right Action Buttons */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 transform translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <button 
            className={`w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-sm ${inWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-500 hover:bg-white'}`}
            onClick={handleToggleWishlist}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-[#0F3D2E] hover:bg-white transition-colors shadow-sm" onClick={(e) => e.preventDefault()} title="Compare">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-[#0F3D2E] hover:bg-white transition-colors shadow-sm" onClick={(e) => e.preventDefault()} title="Quick View">
            <Eye className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-[#0F3D2E] hover:bg-white transition-colors shadow-sm" onClick={(e) => { e.preventDefault(); navigator.share?.({ title: product.name, url: window.location.origin + '/product/' + product.slug }); }} title="Share">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Images with Hover Effect */}
        <img loading="lazy" decoding="async" 
          src={product.images[0]} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${product.images[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {product.images[1] && (
          <img loading="lazy" decoding="async" 
            src={product.images[1]} 
            alt={product.name} 
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
          />
        )}
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-[10px] text-gray-400 ml-1">(0)</span>
        </div>
        
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Brand Name</p>
        <h3 className="text-xs font-bold mb-2 text-gray-900 line-clamp-2 leading-tight flex-1">{product.name}</h3>
        
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-[#E8E4DE]/50">
          <div className="flex flex-col">
            <span className="text-sm font-serif text-gray-900 font-bold">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-[10px] line-through text-gray-400">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-8 h-8 shrink-0 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center hover:bg-[#154636] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/add"
              title="Add to Cart"
            >
              <Plus className="w-4 h-4 group-hover/add:scale-110 transition-transform" />
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="px-3 h-8 shrink-0 rounded-full bg-[#E8E4DE] text-[#0F3D2E] font-bold text-[10px] flex items-center justify-center hover:bg-[#d5cfc5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              title="Buy Now"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
