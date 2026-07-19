import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { HeroSlide } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#D4AF37'); // Default gold/luxury accent
  
  // Touch handling
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, settingsRes] = await Promise.all([
          supabase
            .from('hero_slides')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true }),
          supabase
            .from('store_settings')
            .select('key, value')
            .in('key', ['hero_settings', 'hero_manager'])
        ]);
        
        if (slidesRes.data) {
          // Filter out slides that haven't reached start_date or have passed end_date
          const now = new Date();
          const validSlides = slidesRes.data.filter(slide => {
            if (slide.start_date && new Date(slide.start_date) > now) return false;
            if (slide.end_date && new Date(slide.end_date) < now) return false;
            return true;
          });
          setSlides(validSlides);
        }

        if (settingsRes.data) {
          const managerData = settingsRes.data.find(s => s.key === 'hero_manager')?.value;
          const legacyData = settingsRes.data.find(s => s.key === 'hero_settings')?.value;
          const settings = managerData || legacyData || {};
          
          if (settings.color_primary) setPrimaryColor(settings.color_primary);
          if (settings.color_accent || settings.design?.accent_color) {
            setAccentColor(settings.color_accent || settings.design?.accent_color);
          }
        }
      } catch (err) {
        console.error('Error fetching hero data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    let interval: NodeJS.Timeout;
    if (!isHovered) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe left
    if (diff > 50) {
      handleNext();
    }
    // Swipe right
    else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  if (loading) {
    return (
      <div className="w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] bg-gray-50 flex flex-col items-center justify-center text-gray-400">
        <div className="w-16 h-16 mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📸</span>
        </div>
        <p>No active slides found.</p>
      </div>
    );
  }

  const activeSlide = slides[activeIndex];

  return (
    <section 
      className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-black focus:outline-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Hero Image Slider"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image with Ken Burns Effect */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute inset-0 w-full h-full"
          >
            <picture className="absolute inset-0 w-full h-full">
              <source 
                media="(min-width: 768px)" 
                srcSet={activeSlide.desktop_image || activeSlide.image_url || ''} 
              />
              <img 
                src={activeSlide.mobile_image || activeSlide.desktop_image || activeSlide.image_url || ''}
                alt={activeSlide.title || 'Hero Background'}
                className="w-full h-full object-cover"
                loading={activeIndex === 0 ? "eager" : "lazy"}
                fetchPriority={activeIndex === 0 ? "high" : "auto"}
              />
            </picture>
          </motion.div>

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

          {/* Content Container */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-[1440px] mx-auto px-[20px] pb-[24px] sm:px-[5%] sm:pb-[8%] lg:px-[7%] lg:pb-[10%] relative z-10">
              <motion.div 
                className="max-w-2xl text-white flex flex-col items-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeSlide.badge && (
                  <span 
                    className="uppercase tracking-[0.2em] text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                    style={{ color: accentColor }}
                  >
                    {activeSlide.badge}
                  </span>
                )}
                
                {activeSlide.title && (
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-3 sm:mb-5 line-clamp-2 drop-shadow-md">
                    {activeSlide.title}
                  </h2>
                )}
                
                {activeSlide.description && (
                  <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 line-clamp-2 font-medium drop-shadow-md max-w-xl">
                    {activeSlide.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {activeSlide.primary_button_text && (
                    <Link
                      to={activeSlide.primary_button_url || '#'}
                      className="w-full sm:w-auto text-center px-8 py-3.5 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-semibold rounded-full shadow-lg"
                      style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                      target={activeSlide.primary_button_url?.startsWith('http') ? '_blank' : undefined}
                      rel={activeSlide.primary_button_url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {activeSlide.primary_button_text}
                    </Link>
                  )}
                  
                  {activeSlide.secondary_button_text && (
                    <Link
                      to={activeSlide.secondary_button_url || '#'}
                      className="w-full sm:w-auto text-center px-8 py-3.5 bg-black/20 hover:bg-white hover:text-black backdrop-blur-md border border-white text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 font-semibold rounded-full shadow-lg"
                      target={activeSlide.secondary_button_url?.startsWith('http') ? '_blank' : undefined}
                      rel={activeSlide.secondary_button_url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {activeSlide.secondary_button_text}
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.preventDefault(); handlePrev(); }}
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={(e) => { e.preventDefault(); handleNext(); }}
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === activeIndex}
              className={`transition-all duration-500 rounded-full ${
                idx === activeIndex 
                  ? 'w-8 h-1.5 bg-white' 
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
