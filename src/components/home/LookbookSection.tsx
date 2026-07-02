import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function LookbookSection() {
  return (
    <section className="py-20 max-w-[1600px] mx-auto px-6">
      <div className="relative aspect-[4/3] md:aspect-[21/9] bg-gray-100 overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000" 
          alt="Lookbook" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        
        {/* Hotspots */}
        <div className="absolute top-[40%] left-[30%] md:left-[45%]">
          <div className="relative">
            <button className="w-8 h-8 bg-white/90 text-gray-900 rounded-full flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white p-3 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
              <div className="flex gap-3">
                <img src="https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=100" className="w-12 h-16 object-cover" alt="Shirt" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Oxford Shirt</p>
                  <p className="text-xs text-gray-500 mb-2">৳ 2,200</p>
                  <Link to="/product/2" className="text-[10px] font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-0.5 hover:text-gray-500 transition-colors">Shop Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[30%] left-[50%] md:left-[55%]">
          <div className="relative">
            <button className="w-8 h-8 bg-white/90 text-gray-900 rounded-full flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 transition-transform delay-300">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Complete The Look</h2>
          <p className="text-gray-200 mb-6 max-w-md hidden md:block">Shop the entire outfit curated by our stylists for an effortlessly elevated aesthetic.</p>
          <Link to="/shop?look=1" className="inline-block bg-white text-gray-900 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
            Shop Outfit
          </Link>
        </div>
      </div>
    </section>
  );
}
