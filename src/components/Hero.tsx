import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import { useHomepageData } from '../hooks/useHomepageData';

const mockSlides = [
  {
    id: 1,
    title: "Timeless Style,\nUnmatched Quality",
    subtitle: "Premium Clothing",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
    badge: "New Arrival",
    link: "/shop?category=new",
    floatingProduct: {
      name: "Classic Trench Coat",
      price: 8500,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200"
    }
  },
  {
    id: 2,
    title: "Summer Essentials\nCollection '26",
    subtitle: "New Drop",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200",
    badge: "Trending",
    link: "/shop?category=summer",
    floatingProduct: {
      name: "Linen Blend Shirt",
      price: 2200,
      image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=200"
    }
  }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = useHomepageData('hero_slides', mockSlides);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative bg-[#f8f9fa] overflow-hidden min-h-[600px] lg:min-h-[85vh] flex items-center lg:pt-0">
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-[45%] h-[75%] lg:w-[60%] lg:h-full bg-[var(--color-brand-dark)]/5 rounded-bl-[80px] lg:rounded-bl-[100px] z-0"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] rounded-full bg-[var(--color-brand-green-light)]/10 blur-3xl z-0"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="max-w-[1600px] mx-auto w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center px-6 lg:px-12 relative z-10">
            
            {/* Left: 40% Text & CTA */}
            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 pb-12 lg:pb-0">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-dark)] animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                    {slides[currentSlide].badge}
                  </span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6 text-gray-900 leading-[1.05] whitespace-pre-line">
                  {slides[currentSlide].title}
                </h1>
                
                <p className="text-gray-500 text-lg mb-10 max-w-md">
                  Discover the perfect blend of contemporary design and timeless craftsmanship.
                </p>
                
                <div className="flex flex-wrap items-center gap-6">
                  <Link to={slides[currentSlide].link} className="inline-flex items-center justify-center gap-3 bg-[var(--color-brand-dark)] text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest hover:bg-black transition-all hover:-translate-y-1 premium-button group">
                    Shop Collection
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="User" />
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="User" />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="User" />
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center text-yellow-500"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                      <span className="font-medium text-gray-900">4.9/5 (12k+ Reviews)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: 60% Lifestyle Image & Floating Cards */}
            <div className="lg:col-span-7 h-[500px] lg:h-[85%] relative order-1 lg:order-2 mt-8 lg:mt-0">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="w-full h-full relative flex items-center justify-end"
              >
                <div className="relative w-full lg:w-[90%] h-full rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={slides[currentSlide].image} 
                    alt="Hero Model" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                
                {/* Floating Product Card */}
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="absolute left-4 lg:-left-12 bottom-12 lg:bottom-24 premium-glass premium-hover p-4 flex items-center gap-4 w-64 cursor-pointer"
                >
                  <img src={slides[currentSlide].floatingProduct.image} alt="Product" className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{slides[currentSlide].floatingProduct.name}</h4>
                    <p className="text-sm font-bold text-[var(--color-brand-dark)] mt-1">৳ {slides[currentSlide].floatingProduct.price.toLocaleString()}</p>
                    <Link to={slides[currentSlide].link} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 mt-1 inline-block">View Details</Link>
                  </div>
                </motion.div>

              </motion.div>
            </div>
            
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${currentSlide === index ? 'w-8 h-2 bg-[var(--color-brand-dark)]' : 'w-2 h-2 bg-gray-300'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
