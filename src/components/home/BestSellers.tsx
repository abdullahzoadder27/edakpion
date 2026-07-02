import React from 'react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';

export function BestSellers() {
  const { products } = useProducts('BEST SELLER');
  const bestSellers = products.slice(0, 4);

  return (
    <section className="py-20 max-w-[1600px] mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">Best Sellers</h2>
        <p className="text-gray-500 max-w-xl mx-auto">Our most loved pieces, chosen by you.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {bestSellers.map(product => (
          <ProductCard 
            key={product.id} 
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl}
            hoverImage={product.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
