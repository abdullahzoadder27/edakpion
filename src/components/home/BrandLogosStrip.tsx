import React from 'react';
import { Shield, Truck, CreditCard, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  { icon: Shield, text: "Premium Quality" },
  { icon: Truck, text: "Fast Shipping" },
  { icon: CreditCard, text: "Secure Payment" },
  { icon: RefreshCw, text: "Easy Return" },
];

export function BrandLogosStrip() {
  // Duplicate features for infinite scroll effect
  const scrollItems = [...features, ...features, ...features];

  return (
    <div className="bg-gray-50 border-y border-gray-100 overflow-hidden py-8">
      <div className="flex w-fit">
        <motion.div
          animate={{ x: [0, -1035] }} // Adjust width based on content if needed
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20
          }}
          className="flex items-center whitespace-nowrap"
        >
          {scrollItems.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4 px-12 md:px-24">
              <feature.icon className="w-6 h-6 text-gray-900" />
              <span className="text-sm font-bold tracking-widest uppercase text-gray-900">
                {feature.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
