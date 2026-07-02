import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PremiumCollection() {
  return (
    <section className="py-24 max-w-[1600px] mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">The Premium Edit</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Discover our most exclusive pieces, crafted with uncompromising attention to detail.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-20">
        <div className="order-2 md:order-1 flex flex-col justify-center items-start md:pr-12 lg:pr-24">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Editor's Pick</span>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            Structured Silhouette, Fluid Movement
          </h3>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Meticulously tailored from our signature heavyweight cotton blend, these pieces offer the perfect balance of structure and comfort. Designed to transition seamlessly from day to night.
          </p>
          <Link to="/shop?category=premium" className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
            Explore Collection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        <div className="order-1 md:order-2 aspect-[4/5] bg-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=1000" 
            alt="Premium Editorial 1" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="aspect-[4/5] bg-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1594938298593-78f41a15e4f2?auto=format&fit=crop&q=80&w=1000" 
            alt="Premium Editorial 2" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </div>
        <div className="flex flex-col justify-center items-start md:pl-12 lg:pl-24">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Craftsmanship</span>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            The Art of Minimalism
          </h3>
          <p className="text-gray-500 mb-8 leading-relaxed">
            We believe in subtracting the obvious and adding the meaningful. Every seam, stitch, and fabric choice is intentional, resulting in garments that endure beyond seasonal trends.
          </p>
          <Link to="/about" className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
            Our Story
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
