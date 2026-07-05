import { Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../lib/store';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1, product.sizes[0], product.colors[0]);
  };

  return (
    <Link to={`/product/${product.slug}`} className="bg-white rounded-3xl p-3 border border-[#E8E4DE] flex flex-col group cursor-pointer hover:shadow-sm transition-shadow">
      <div className="aspect-[3/4] bg-[#F5F5F5] rounded-2xl mb-3 relative flex items-center justify-center overflow-hidden">
        {/* Wishlist Button */}
        <button 
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-colors"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <Heart className="w-4 h-4" />
        </button>
        
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <h3 className="text-xs font-bold mb-1 text-gray-900 truncate">{product.name}</h3>
      <div className="flex items-center justify-between">
        <span className="text-sm font-serif text-gray-900">
          {formatPrice(product.price)}
          {product.compare_at_price && (
            <span className="text-[10px] line-through text-gray-400 ml-1">{formatPrice(product.compare_at_price)}</span>
          )}
        </span>
        <button 
          onClick={handleAddToCart}
          className="w-8 h-8 shrink-0 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center hover:bg-[#154636] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );
}
