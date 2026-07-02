import React from 'react';
import { ShieldCheck, Tags, Truck, HeadphonesIcon } from 'lucide-react';

export function WhyChooseUs() {
  const features = [
    { icon: ShieldCheck, title: "Premium Fabric", desc: "Meticulously sourced materials for uncompromising comfort and durability." },
    { icon: Truck, title: "Fast Delivery", desc: "Complimentary express shipping on all orders over ৳3000." },
    { icon: Tags, title: "Easy Return", desc: "Hassle-free 7-day return policy on all unworn items." },
    { icon: HeadphonesIcon, title: "Secure Payment", desc: "Multiple secure payment gateways including Cash on Delivery." },
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">The EDAKPION Standard</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Committed to excellence in every detail, from fabric selection to your doorstep.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-8 bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
