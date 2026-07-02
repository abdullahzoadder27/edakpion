import React from 'react';
import { motion } from 'motion/react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';

export function TrendingProducts() {
  const { products } = useProducts('TRENDING');
  // Use first 5 products for trending marquee
  const trendingProducts = products.slice(0, 5);
  const scrollItems = [...trendingProducts, ...trendingProducts];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">Trending Now</h2>
        <p className="text-gray-500">What everyone is buying right now.</p>
      </div>

      <div className="flex w-fit group">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30,
          }}
          className="flex gap-6 px-6 items-start"
        >
          {scrollItems.map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="w-[280px] md:w-[350px] flex-shrink-0">
               <ProductCard 
                 id={product.id}
                 name={product.name}
                 price={product.price}
                 image={product.imageUrl}
                 hoverImage={product.imageUrl}
               />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
