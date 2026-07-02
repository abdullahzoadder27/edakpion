import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Shop() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  
  // Map query params to the tabs expected by ProductGrid
  let activeTab = 'All Products';
  if (category === 'new') activeTab = 'NEW ARRIVAL';
  if (category === 'best') activeTab = 'BEST SELLER';
  if (category === 'discount') activeTab = 'DISCOUNTED';

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-[var(--color-brand-cream)]">
      <Header />
      <main className="flex-grow py-12 w-full">
        <div className="max-w-7xl mx-auto px-6 mb-8">
           <h1 className="text-3xl font-bold text-[var(--color-brand-dark)]">Shop</h1>
        </div>
        <ProductGrid activeTab={activeTab === 'All Products' ? undefined : activeTab} />

        {/* Shop Page Editorial Integration */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="relative rounded-3xl overflow-hidden premium-card">
            <div className="absolute inset-0 bg-[var(--color-brand-dark)]">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
                alt="Fashion Editorial" 
                className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
              />
            </div>
            <div className="relative z-10 p-12 md:p-20 text-center max-w-3xl mx-auto">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-white mb-6 inline-block">
                Fashion Tips of the Week
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Elevate Your Everyday Style
              </h2>
              <p className="text-lg text-white/80 mb-10">
                Discover the latest styling tips and wardrobe essentials curated by our fashion editors.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/fashion-journal" className="w-full sm:w-auto px-8 py-4 bg-white text-[var(--color-brand-dark)] font-bold tracking-widest rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group">
                  Read The Journal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/collections" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white text-white font-bold tracking-widest rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
                  Shop Collections
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
