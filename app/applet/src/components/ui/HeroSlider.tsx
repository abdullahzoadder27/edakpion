import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { HeroSlide } from '../../types';
import { ArrowLeft, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { gsap } from 'gsap';

// Background Pattern
const JamdaniPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="jamdani" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="20" cy="20" r="2" fill="currentColor"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#jamdani)"/>
  </svg>
);

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Content Refs for animation
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        let validSlides = data || [];
        const now = new Date();
        validSlides = validSlides.filter((s: any) => {
          if (s.start_date && new Date(s.start_date) > now) return false;
          if (s.end_date && new Date(s.end_date) < now) return false;
          return true;
        });

        if (validSlides.length === 0) {
          validSlides = [{
            id: 'fallback-1',
            title: "Premium Men's Fashion<br/>for Everyday Confidence",
            description: "Discover premium shirts, polos, oversized tees and timeless essentials crafted for modern Bangladeshi men.",
            image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000',
            primary_button_text: 'Shop Now',
            primary_button_url: '/shop',
            secondary_button_text: 'Explore',
            secondary_button_url: '/shop',
            is_active: true,
            display_order: 0
          } as HeroSlide];
        }
        
        // Pad array to ensure we have enough slides for the 3D carousel effect
        let padded = [...validSlides];
        if (padded.length === 1) {
            padded = [padded[0], padded[0], padded[0], padded[0]];
        } else if (padded.length === 2) {
            padded = [padded[0], padded[1], padded[0], padded[1]];
        } else if (padded.length === 3) {
            padded = [padded[0], padded[1], padded[2], padded[0]];
        }
        
        setSlides(padded);
      } catch (err) {
        console.error('Error fetching hero slides:', err);
        // Fallback on error
        setSlides([{
          id: 'error-fallback',
          title: "Premium Men's Fashion<br/>for Everyday Confidence",
          description: "Discover premium shirts, polos, oversized tees and timeless essentials crafted for modern Bangladeshi men.",
          image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000',
          primary_button_text: 'Shop Now',
          primary_button_url: '/shop',
          secondary_button_text: 'Explore',
          secondary_button_url: '/shop',
          is_active: true,
          display_order: 0
        } as HeroSlide].flatMap(x => [x, x, x, x]));
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating || slides.length <= 1) return;
    setIsAnimating(true);
    
    let nextIndex;
    if (dir === 'next') {
      nextIndex = (activeIndex + 1) % slides.length;
    } else {
      nextIndex = (activeIndex + slides.length - 1) % slides.length;
    }
    
    setActiveIndex(nextIndex);
    
    // Animate content out and in
    if (titleRef.current && descRef.current && buttonsRef.current) {
        gsap.to([titleRef.current, descRef.current, buttonsRef.current], {
            y: -10,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            onComplete: () => {
                gsap.to([titleRef.current, descRef.current, buttonsRef.current], {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power3.out"
                });
            }
        });
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      navigate('next');
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex, slides.length, isAnimating]);

  // Touch handling for swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      navigate('next');
    }
    if (touchEndX.current - touchStartX.current > 50) {
      navigate('prev');
    }
  };

  if (loading) {
    return <div className="w-full h-[85vh] bg-[#0a0a0a] flex items-center justify-center text-[#E5D5C5] animate-pulse">Loading Premium Collection...</div>;
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[activeIndex];
  const title = currentSlide.title || "PREMIUM COLLECTION";
  const desc = currentSlide.description || "Experience unparalleled quality and style with our latest curated selections.";
  const primaryText = currentSlide.primary_button_text || "Shop Now";
  const primaryUrl = currentSlide.primary_button_url || "/shop";
  const secondaryText = currentSlide.secondary_button_text || "Explore";
  const secondaryUrl = currentSlide.secondary_button_url || "/shop";

  const getStyleForRole = (index: number) => {
    if (index === activeIndex) {
      // Center Main
      return {
        transform: 'translateX(-50%) scale(1) rotateY(0deg)',
        left: '50%',
        opacity: 1,
        zIndex: 20,
        filter: 'blur(0px) brightness(1.1)',
        bottom: '0%',
      };
    }
    
    const prevIndex = (activeIndex + slides.length - 1) % slides.length;
    if (index === prevIndex || (slides.length === 2 && index !== activeIndex)) {
      // Left
      return {
        transform: 'translateX(-50%) scale(0.85) rotateY(-35deg)',
        left: isMobile ? '15%' : '20%',
        opacity: 0.6,
        zIndex: 10,
        filter: 'blur(4px) brightness(0.6)',
        bottom: '2%',
      };
    }
    
    const nextIndex = (activeIndex + 1) % slides.length;
    if (index === nextIndex && slides.length > 2) {
      // Right
      return {
        transform: 'translateX(-50%) scale(0.85) rotateY(35deg)',
        left: isMobile ? '85%' : '80%',
        opacity: 0.6,
        zIndex: 10,
        filter: 'blur(4px) brightness(0.6)',
        bottom: '2%',
      };
    }
    
    // Hidden Back
    return {
      transform: 'translateX(-50%) scale(0.7) rotateY(0deg)',
      left: '50%',
      opacity: 0,
      zIndex: 5,
      filter: 'blur(10px) brightness(0.3)',
      bottom: '5%',
    };
  };

  return (
    <div className="w-full flex justify-center px-4 md:px-8 mt-4 md:mt-8">
      <div 
        className="relative w-full max-w-[1320px] h-[85vh] min-h-[550px] md:min-h-[650px] bg-[#111111] text-[#F5F2ED] flex flex-col md:flex-row items-center font-sans overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: '1200px' }}
      >
          <JamdaniPattern />
          
          {/* Cinematic lighting effect */}
          <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[#ffffff]/5 blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none mix-blend-screen" />

          {/* Floor reflection gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#0a0a0a] via-[#111111]/80 to-transparent z-30 pointer-events-none" />

          {/* Inner Content Wrapper */}
          <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-between z-40 px-6 md:px-12 lg:px-20 pt-10 md:pt-0 pb-6 md:pb-0 gap-6 md:gap-10 lg:gap-12">
              
              {/* Left Side (Content) */}
              <div className="w-full md:w-[45%] flex flex-col justify-center items-center md:items-start text-center md:text-left z-50">
                  
                  {/* Trust Badges */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-6">
                      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase bg-[#1A1A1A] px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                          <Award className="w-3 h-3" /> Premium
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase bg-[#1A1A1A] px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                          <ShieldCheck className="w-3 h-3" /> Limited
                      </div>
                  </div>

                  {/* Headline */}
                  <div className="overflow-hidden mb-3 md:mb-5 w-full">
                      <h1 ref={titleRef} className="text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[4rem] font-serif leading-[1.05] text-[#F5F2ED] tracking-tight w-full" dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  {/* Description */}
                  <div className="overflow-hidden max-w-sm mb-6 md:mb-8">
                      <p ref={descRef} className="text-[13px] md:text-sm text-gray-400 font-light leading-relaxed">
                          {desc}
                      </p>
                  </div>

                  {/* Buttons */}
                  <div ref={buttonsRef} className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 items-center">
                      {primaryText && (
                          <Link to={primaryUrl} className="group relative px-7 py-3.5 md:px-8 md:py-4 bg-[#F5F2ED] text-[#111111] text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase overflow-hidden rounded-full transition-transform hover:scale-105 duration-300">
                              <span className="relative z-10">{primaryText}</span>
                              <div className="absolute inset-0 bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </Link>
                      )}
                      {secondaryText && (
                          <Link to={secondaryUrl} className="group px-7 py-3.5 md:px-8 md:py-4 border border-white/20 text-white text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/40 transition-all duration-300 rounded-full">
                              {secondaryText}
                          </Link>
                      )}
                  </div>

                  {/* Desktop Navigation Arrows */}
                  {slides.length > 1 && (
                      <div className="hidden md:flex gap-3 mt-12 lg:mt-16">
                          <button onClick={() => navigate('prev')} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md" aria-label="Previous">
                              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                          </button>
                          <button onClick={() => navigate('next')} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md" aria-label="Next">
                              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                          </button>
                      </div>
                  )}
              </div>

              {/* Right Side (Fake-3D Fashion Character Showcase) */}
              <div className="w-full md:w-[55%] h-[40vh] sm:h-[45vh] md:h-full relative overflow-visible flex items-end justify-center z-20 mt-2 md:mt-0" style={{ transformStyle: 'preserve-3d' }}>
                  
                  {/* Center Spotlight */}
                  <div className="absolute bottom-[5%] md:bottom-[15%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] md:w-[70%] md:h-[70%] bg-[#D4AF37]/15 blur-[50px] md:blur-[80px] rounded-full pointer-events-none" />

                  <div className="absolute inset-0 flex items-end justify-center" style={{ transformStyle: 'preserve-3d' }}>
                      {slides.map((slide, index) => {
                          const imageUrl = isMobile ? (slide.mobile_image || slide.image_url) : (slide.desktop_image || slide.image_url);
                          return (
                              <div 
                                  key={`${slide.id}-${index}`}
                                  className="absolute bottom-0 w-[60%] sm:w-[50%] md:w-[75%] lg:w-[65%] xl:w-[55%] origin-bottom pointer-events-none transition-all ease-[cubic-bezier(0.25,1,0.5,1)]"
                                  style={{
                                      ...getStyleForRole(index),
                                      transitionDuration: '800ms',
                                      willChange: 'transform, opacity, filter, left, bottom'
                                  }}
                              >
                                  <img 
                                      src={imageUrl} 
                                      alt={slide.title || "Fashion Image"} 
                                      className="w-full h-auto object-contain object-bottom select-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] md:drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                                      draggable={false}
                                  />
                              </div>
                          );
                      })}
                  </div>
              </div>

              {/* Mobile Navigation Arrows */}
              {slides.length > 1 && (
                  <div className="flex md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 gap-4 z-50">
                      <button onClick={() => navigate('prev')} className="w-10 h-10 rounded-full border border-white/10 bg-[#111]/60 flex items-center justify-center backdrop-blur-md" aria-label="Previous">
                          <ArrowLeft className="w-4 h-4 text-white" />
                      </button>
                      <button onClick={() => navigate('next')} className="w-10 h-10 rounded-full border border-white/10 bg-[#111]/60 flex items-center justify-center backdrop-blur-md" aria-label="Next">
                          <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
