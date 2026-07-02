import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';

export function NewArrivalsCarousel() {
  const { products, loading } = useProducts('NEW ARRIVAL');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.5;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 max-w-[1600px] mx-auto px-6">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">New Arrivals</h2>
          <p className="text-gray-500 max-w-xl">The latest additions to our premium collection.</p>
        </div>
        <div className="hidden md:flex gap-4">
          <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-6 px-6 lg:mx-0 lg:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="w-[75vw] sm:w-[45vw] md:w-[320px] lg:w-[380px] xl:w-[400px] flex-shrink-0 snap-center">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </section>
  );
}
