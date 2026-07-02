import { Link } from 'react-router-dom';

export function SummerBanner() {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-16">
      <div className="relative rounded-2xl overflow-hidden bg-[#91a08c] min-h-[300px] md:min-h-[400px] flex items-center">
        <div className="relative z-10 p-10 md:p-16 text-white w-full md:w-1/2">
          <p className="text-xs font-semibold tracking-widest mb-2 uppercase opacity-90">New Collection</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">SUMMER '25</h2>
          <Link to="/shop" className="inline-block bg-[var(--color-brand-dark)] text-white px-8 py-3 rounded text-xs font-bold tracking-widest hover:bg-[#152e22] transition-colors">
            SHOP NOW
          </Link>
        </div>
        
        <div className="absolute right-0 top-0 w-1/2 md:w-2/3 h-full">
          <img 
            src="https://images.unsplash.com/photo-1523398002811-999aa8d9512e?auto=format&fit=crop&q=80&w=1200" 
            alt="Summer Collection" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#91a08c] via-[#91a08c]/80 to-transparent z-0"></div>
      </div>
    </div>
  );
}
