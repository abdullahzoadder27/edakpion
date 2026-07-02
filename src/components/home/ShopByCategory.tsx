import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';

const categories = [
  "New Arrival", "Best Seller", "Men", "Women", "Oversized", "Hoodies", "Accessories", "On Discount"
];

export function ShopByCategory() {
  const [activeCategory, setActiveCategory] = useState("New Arrival");
  const { products } = useProducts(activeCategory);
  
  // Use first 6 products for display
  const displayProducts = products.slice(0, 6);

  return (
    <section className="py-20 max-w-[1600px] mx-auto px-6">
      
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Sidebar (Desktop) / Top Scroll (Mobile) */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-32">
            <h2 className="text-2xl font-bold tracking-tighter text-gray-900 mb-8 hidden lg:block">Category</h2>
            
            {/* Mobile Categories (Horizontal Scroll) */}
            <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6 gap-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`snap-center flex-shrink-0 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                    activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Desktop Categories (Vertical List) */}
            <ul className="hidden lg:flex flex-col gap-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeCategory === cat ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] translate-x-2' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 lg:hidden">{activeCategory}</h3>
            <div className="hidden lg:flex items-center justify-between w-full">
               <h3 className="text-2xl font-bold text-gray-900">{activeCategory}</h3>
               <Link to={`/shop?category=${activeCategory.toLowerCase()}`} className="text-xs font-bold tracking-widest uppercase border-b border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors flex items-center gap-2 group">
                 View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.imageUrl}
                hoverImage={product.imageUrl}
              />
            ))}
          </div>
          
          {/* Mobile View All */}
          <div className="mt-8 text-center lg:hidden">
            <Link to={`/shop?category=${activeCategory.toLowerCase()}`} className="inline-block px-8 py-3 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black premium-button">
               View All {activeCategory}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
