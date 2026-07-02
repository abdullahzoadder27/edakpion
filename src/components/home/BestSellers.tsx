import React from 'react';
import { ProductCard } from './ProductCard';
import { useHomepageData } from '../../hooks/useHomepageData';

const mockBestSellers = [
  { id: '1', name: "Signature Oversized Tee", price: 1200, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { id: '2', name: "Everyday Oxford Shirt", price: 2200, image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: '3', name: "Relaxed Fit Chino", price: 2800, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
  { id: '4', name: "Minimalist Leather Sneaker", price: 4500, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800" },
];

export function BestSellers() {
  const bestSellers = useHomepageData('best_sellers', mockBestSellers);

  return (
    <section className="py-20 max-w-[1600px] mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">Best Sellers</h2>
        <p className="text-gray-500 max-w-xl mx-auto">Our most loved pieces, chosen by you.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {bestSellers.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
