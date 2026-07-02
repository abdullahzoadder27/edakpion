import React from 'react';

export function Newsletter() {
  return (
    <section className="py-24 max-w-[1600px] mx-auto px-6">
      <div className="relative bg-[var(--color-brand-dark)] overflow-hidden flex flex-col md:flex-row items-center justify-between premium-card shadow-lg">
        
        {/* Abstract luxury background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            alt="Newsletter Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-dark)] via-[var(--color-brand-dark)] to-transparent opacity-90"></div>
        </div>

        <div className="relative z-10 p-12 md:p-24 md:w-2/3 lg:w-1/2">
          <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4 block">The Inner Circle</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 leading-tight">
            Unlock Exclusive <br /> Privileges.
          </h2>
          <p className="text-gray-300 mb-10 max-w-md text-sm md:text-base leading-relaxed">
            Subscribe to our newsletter and receive early access to new collections, exclusive editorial content, and 10% off your first purchase.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white focus:bg-white/20 transition-all duration-300 placeholder:text-gray-400"
              required
            />
            <button type="submit" className="bg-white text-gray-900 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors whitespace-nowrap premium-button">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
