import React from 'react';
import { Link } from 'react-router-dom';

export function PromotionalBanner() {
  return (
    <section className="py-20 max-w-[1600px] mx-auto px-6">
      <div className="relative overflow-hidden bg-gray-900 min-h-[500px] flex items-center justify-center py-20 px-6 text-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            alt="Promotion Background" 
            className="w-full h-full object-cover mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <span className="inline-block px-4 py-1 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
            End of Season Sale
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight">
            Elevate Your <br className="hidden md:block"/> Everyday Style.
          </h2>
          <p className="text-gray-300 text-lg md:text-xl font-medium mb-10 max-w-xl">
            Up to 50% off on selected premium items. Upgrade your wardrobe with our meticulously crafted pieces.
          </p>
          <Link to="/shop?sale=true" className="bg-white text-gray-900 px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
            Shop The Sale
          </Link>
        </div>
      </div>
    </section>
  );
}
