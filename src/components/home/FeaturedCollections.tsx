import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHomepageData } from '../../hooks/useHomepageData';

const mockCollections = [
  { id: 1, name: "The Minimalist Edit", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Urban Streetwear", image: "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Summer Linen", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Evening Elegance", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800" },
  { id: 5, name: "Athleisure Premium", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" },
];

export function FeaturedCollections() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const collections = useHomepageData('featured_collections', mockCollections);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">Featured Collections</h2>
            <p className="text-gray-500 max-w-xl">Carefully curated pieces to elevate your wardrobe.</p>
          </div>
          <div className="hidden md:flex gap-4">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center premium-hover hover:bg-gray-900 hover:text-white transition-colors bg-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center premium-hover hover:bg-gray-900 hover:text-white transition-colors bg-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-6 px-6 lg:mx-0 lg:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {collections.map((collection) => (
            <div key={collection.id} className="w-[85vw] sm:w-[60vw] md:w-[400px] lg:w-[450px] xl:w-[500px] flex-shrink-0 snap-center group">
              <Link to={`/collections/${collection.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-200 premium-card premium-hover">
                <img 
                  src={collection.image} 
                  alt={collection.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-4">{collection.name}</h3>
                  <span className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-widest w-fit hover:bg-gray-100 transition-colors premium-button">
                    Shop Collection
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
