import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from './ProductCard';

const trendingProducts = [
  { id: 't1', name: "Boxy Fit Denim Jacket", price: 3800, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800" },
  { id: 't2', name: "Ribbed Knit Sweater", price: 2400, image: "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&q=80&w=800" },
  { id: 't3', name: "Pleated Wide Leg Trouser", price: 2900, image: "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: 't4', name: "Silk Blend Resort Shirt", price: 3200, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800" },
  { id: 't5', name: "Minimalist Crossbody Bag", price: 1800, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800" },
];

export function TrendingProducts() {
  const scrollItems = [...trendingProducts, ...trendingProducts];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">Trending Now</h2>
        <p className="text-gray-500">What everyone is buying right now.</p>
      </div>

      <div className="flex w-fit group">
        <motion.div
          animate={{ x: [0, -2000] }} // Approximated width, ideally calculated or CSS marquee used
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30,
          }}
          className="flex gap-6 px-6 items-start"
        >
          {scrollItems.map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="w-[280px] md:w-[350px] flex-shrink-0">
               <ProductCard {...product} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
