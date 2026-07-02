import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function FeaturedProduct() {
  return (
    <section className="py-20 max-w-[1600px] mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="relative aspect-[3/4] md:aspect-[4/5] bg-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1000" 
            alt="Featured Product" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-sm">
            Product of the Month
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">Outerwear</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">The Technical Trench</h2>
            <div className="text-2xl text-gray-900 font-medium mb-6">৳ 8,500</div>
            <p className="text-gray-500 leading-relaxed mb-6">
              A modern reinterpretation of the classic trench coat. Constructed from a water-repellent, breathable technical fabric. Features a relaxed silhouette, hidden button placket, and adjustable cuffs for versatile styling.
            </p>
            <ul className="text-sm text-gray-500 space-y-2 mb-8">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span> Water-repellent finish</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span> Relaxed, slightly oversized fit</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span> 65% Cotton, 35% Nylon</li>
            </ul>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-gray-900 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-3">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <Link to="/checkout" className="flex-1 bg-white border border-gray-900 text-gray-900 px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors text-center">
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
