import { Link } from 'react-router-dom';

export function PromoBanner() {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-16">
      <div className="relative premium-card premium-hover overflow-hidden bg-[var(--color-brand-green-light)] min-h-[250px] md:min-h-[300px] flex items-center">
        <div className="relative z-10 p-10 md:p-16 text-white w-full md:w-1/2">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">75% OFF</h2>
          <p className="text-lg md:text-xl font-medium tracking-wide mb-4 text-green-100">ON SELECTED ITEMS</p>
          <p className="text-sm text-gray-200 mb-8">Hurry Up! Limited Time Offer</p>
          <Link to="/shop" className="inline-block bg-white text-black px-8 py-3 rounded text-xs font-bold tracking-widest hover:bg-gray-100 transition-colors premium-button">
            SHOP NOW
          </Link>
        </div>
        
        <div className="absolute right-0 top-0 w-1/2 md:w-1/2 h-full">
          <img 
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800" 
            alt="Promo Banner" 
            className="w-full h-full object-cover object-center mix-blend-luminosity opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-green-light)] to-transparent z-0"></div>
        </div>
      </div>
    </div>
  );
}
