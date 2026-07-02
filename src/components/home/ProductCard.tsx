import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  key?: React.Key;
  id: string;
  name: string;
  shortDesc?: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  isNew?: boolean;
  discount?: number;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  reviewCount?: number;
}

export function ProductCard({
  id,
  name,
  shortDesc = "Premium quality everyday essential.",
  price,
  originalPrice,
  image,
  hoverImage,
  isNew,
  discount,
  inStock = true,
  sizes = ['S', 'M', 'L', 'XL'],
  colors = ['#111111', '#e2dec9', '#4a5568'],
  rating = 5.0,
  reviewCount = 120
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group flex flex-col relative premium-card premium-hover p-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        {isNew && <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">New</span>}
        {discount && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">-{discount}%</span>}
        {!inStock && <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">Out of Stock</span>}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <button className="w-8 h-8 premium-button bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-gray-50">
          <Heart className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 premium-button bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50">
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Image Container */}
      <Link to={`/product/${id}`} className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
        <img 
          src={image} 
          alt={name} 
          className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-500 ${isHovered && hoverImage ? 'opacity-0' : 'opacity-100'}`}
        />
        {hoverImage && (
          <img 
            src={hoverImage} 
            alt={`${name} alt view`} 
            className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
          />
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-bold text-gray-900">{rating.toFixed(1)}</span>
          <span className="text-[10px] text-gray-500">({reviewCount} Reviews)</span>
        </div>

        <Link to={`/product/${id}`} className="text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors mb-1 line-clamp-1">
          {name}
        </Link>
        
        <p className="text-[11px] text-gray-500 line-clamp-1 mb-3">{shortDesc}</p>

        {/* Variations (Sizes & Colors preview) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {colors.slice(0, 3).map((color, idx) => (
              <div key={idx} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }}></div>
            ))}
          </div>
          <div className="text-[10px] font-medium text-gray-500">
            {sizes.slice(0, 3).join(', ')}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">৳ {price.toLocaleString()}</span>
            {originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">৳ {originalPrice.toLocaleString()}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center premium-button hidden sm:flex">
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full premium-button hover:bg-black">
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
