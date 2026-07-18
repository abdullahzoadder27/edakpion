import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { HeroSlide, HeroSettings } from '../../types';
import { ArrowLeft, ArrowRight, ShieldCheck, Award, Truck } from 'lucide-react';
import { gsap } from 'gsap';

const DEFAULT_SETTINGS: HeroSettings = {
  id: 'default',
  is_enabled: true,
  desktop_layout: 'split',
  tablet_layout: 'split',
  mobile_layout: 'stacked',
  desktop_height: '70vh',
  tablet_height: '60vh',
  mobile_height: 'auto',
  container_width: 'max-w-[1180px]',
  content_alignment: 'left',
  character_position: 'right',
  character_size: '80%',
  section_padding: 'px-4 sm:px-6 md:px-8',
  gap_text_character: 'gap-0',
  bg_color: '#0F0F10',
  overlay_color: '#0F0F10',
  overlay_opacity: 80,
  gradient_style: 'bg-gradient-to-br from-[#0F0F10] via-[#0F0F10] to-[#1B1B1D]',
  enable_spotlight: true,
  enable_jamdani: true,
  color_primary: '#E7B74C',
  color_secondary: '#C89A2B',
  color_accent: '#F0C75A',
  color_button_bg: '#E7B74C',
  color_button_text: '#0F0F10',
  color_button_hover: '#F0C75A',
  color_text_primary: '#F8F5EF',
  color_text_secondary: '#D9D2C7',
  font_family: 'font-sans',
  heading_size_desktop: 'text-[3.75rem] xl:text-[4.25rem]',
  heading_size_tablet: 'text-4xl md:text-5xl',
  heading_size_mobile: 'text-[2.25rem]',
  desc_size_desktop: 'text-sm',
  desc_size_mobile: 'text-[13px]',
  font_weight_heading: 'font-bold',
  letter_spacing: 'tracking-tight',
  line_height: 'leading-[1.05]',
  anim_floating: true,
  anim_mouse_parallax: true,
  anim_fade: true,
  anim_slide: true,
  anim_character_scale: true,
  anim_speed: '800ms',
  anim_duration: '0.5s',
  desktop_char_width: 'lg:w-[85%] xl:w-[80%]',
  tablet_char_width: 'md:w-[55%]',
  mobile_char_width: 'w-[75%] sm:w-[65%]',
  desktop_text_width: 'max-w-none',
  mobile_text_align: 'text-center',
  mobile_char_align: 'justify-center',
  mobile_gap_headline_char: 'mb-2 mt-[-5px]',
  mobile_gap_char_desc: 'mb-3',
  mobile_btn_width: 'w-full',
  seo_h1: '',
  updated_at: ''
};

// Background Pattern
const JamdaniPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
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
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Content Refs for animation
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charactersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, settingsRes] = await Promise.all([
          supabase.from('hero_slides').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          supabase.from('store_settings').select('value').eq('key', 'hero_settings').single()
        ]);

        if (slidesRes.error) throw slidesRes.error;
        if (settingsRes.data && settingsRes.data.value) {
            setSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data.value, seo_h1: "" });
        }
        
        let validSlides = slidesRes.data || [];
        const now = new Date();
        validSlides = validSlides.filter((s: any) => {
          if (s.start_date && new Date(s.start_date) > now) return false;
          if (s.end_date && new Date(s.end_date) < now) return false;
          return true;
        });

        if (validSlides.length === 0) {
          validSlides = [{
            id: 'fallback-1',
            title: "",
            description: "Minimal design. Maximum confidence.",
            image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000',
            primary_button_text: 'Shop Now',
            primary_button_url: '/shop',
            is_active: true,
            display_order: 0
          } as HeroSlide];
        }
        
        // Pad array to ensure we have at least 3 slides for the 3-character layout
        let padded = [...validSlides];
        if (padded.length === 1) padded = [padded[0], padded[0], padded[0]];
        else if (padded.length === 2) padded = [padded[0], padded[1], padded[0]];
        
        setSlides(padded);
      } catch (err) {
        console.error('Error fetching hero data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!charactersRef.current || isMobile || !settings.anim_mouse_parallax) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth - 0.5) * 20;
      const yPos = (clientY / innerHeight - 0.5) * 20;

      gsap.to(charactersRef.current, {
        x: xPos,
        y: yPos,
        duration: 1,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, settings.anim_mouse_parallax]);

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
    if (titleRef.current && descRef.current && buttonsRef.current && settings.anim_fade) {
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

    setTimeout(() => setIsAnimating(false), parseInt(settings.anim_speed) || 800);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      navigate('next');
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex, slides.length, isAnimating]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => touchStartX.current = e.changedTouches[0].screenX;
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current - touchEndX.current > 50) navigate('next');
    if (touchEndX.current - touchStartX.current > 50) navigate('prev');
  };

  if (loading) return <div className="w-full h-[85vh] min-h-[500px] lg:min-h-[600px] bg-[#111111] flex items-center justify-center text-[#F5F2ED] animate-pulse mt-4 md:mt-8">Loading Premium Collection...</div>;
  if (!settings.is_enabled || slides.length === 0) return null;

  const currentSlide = slides[activeIndex];
  let title = currentSlide.title || settings.seo_h1 || "";
  if (title === "Premium Streetwear Made to Stand Out") title = "";
  const desc = currentSlide.description || "";
  const primaryText = currentSlide.primary_button_text;
  const primaryUrl = currentSlide.primary_button_url || "/shop";
  const secondaryText = currentSlide.secondary_button_text;
  const secondaryUrl = currentSlide.secondary_button_url || "/shop";

  const getStyleForRole = (index: number) => {
    if (index === activeIndex) {
      return {
        transform: 'translateX(-50%) scale(1.15) rotateY(0deg)',
        left: '50%', opacity: 1, zIndex: 20,
        filter: 'blur(0px) brightness(1.1)', bottom: '0%',
      };
    }
    const prevIndex = (activeIndex + slides.length - 1) % slides.length;
    if (index === prevIndex || (slides.length === 2 && index !== activeIndex)) {
      return {
        transform: 'translateX(-50%) scale(0.95) rotateY(-25deg)',
        left: '20%', opacity: 0.6, zIndex: 10,
        filter: 'blur(4px) brightness(0.6)', bottom: '2%',
      };
    }
    const nextIndex = (activeIndex + 1) % slides.length;
    if (index === nextIndex && slides.length > 2) {
      return {
        transform: 'translateX(-50%) scale(0.95) rotateY(25deg)',
        left: '80%', opacity: 0.6, zIndex: 10,
        filter: 'blur(4px) brightness(0.6)', bottom: '2%',
      };
    }
    return {
      transform: 'translateX(-50%) scale(0.7) rotateY(0deg)',
      left: '50%', opacity: 0, zIndex: 5,
      filter: 'blur(10px) brightness(0.3)', bottom: '5%',
    };
  };

  return (
    <div className={`w-full flex justify-center ${settings.section_padding} mt-4 lg:mt-6 mb-8`}>
      <div 
        ref={containerRef}
        className={`relative w-full ${settings.container_width} ${settings.gradient_style} text-[#F8F5EF] ${settings.font_family} overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]`}
        style={{ perspective: '1200px', backgroundColor: settings.bg_color, minHeight: '400px', height: isMobile ? settings.mobile_height : settings.desktop_height }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
          {settings.enable_jamdani && (
            <div className="absolute inset-0 opacity-10 mix-blend-overlay">
               <JamdaniPattern />
            </div>
          )}
          
          {/* Cinematic lighting effect */}
          {settings.enable_spotlight && (
            <>
              <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none mix-blend-screen" style={{ backgroundColor: settings.color_primary, opacity: 0.05 }} />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] pointer-events-none mix-blend-screen" style={{ backgroundColor: settings.color_secondary, opacity: 0.1 }} />
            </>
          )}

          {/* Floor reflection gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/80 to-transparent z-30 pointer-events-none" />
          
          <div className="relative w-full h-full flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[1fr_auto_auto_auto_auto_auto_1fr] z-40 px-5 sm:px-10 lg:px-12 xl:px-16 pt-6 pb-5 lg:py-0 items-center lg:items-start text-center lg:text-left gap-0">
               
              {/* Label */}
              <div className="lg:col-span-6 lg:row-start-2 flex justify-center lg:justify-start mb-0 lg:mb-2 z-50">
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase bg-[rgba(255,255,255,0.03)] px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-lg" style={{ color: settings.color_primary }}>
                          <Award className="w-3 h-3" /> Premium Quality
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase bg-[rgba(255,255,255,0.03)] px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-lg" style={{ color: settings.color_text_secondary }}>
                          <ShieldCheck className="w-3 h-3" /> Limited
                      </div>
                  </div>
              </div>

              {/* Headline */}
              {title && (
                  <div className="lg:col-span-7 lg:row-start-3 flex justify-center lg:justify-start mb-0 lg:mb-2.5 z-50">
                      <h1 ref={titleRef} className={`${isMobile ? settings.heading_size_mobile : settings.heading_size_desktop} ${settings.font_weight_heading} ${settings.letter_spacing} ${settings.line_height} text-center lg:text-left w-full line-clamp-2 drop-shadow-md`} style={{ color: settings.color_text_primary }} dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br/>') }} />
                  </div>
              )}

              {/* Character */}
              <div className={`lg:col-start-5 lg:col-span-8 lg:row-start-1 lg:row-span-7 h-[36vh] sm:h-[40vh] lg:h-full w-full relative flex items-end justify-center z-40 ${settings.mobile_gap_headline_char} lg:my-0 lg:-ml-6 xl:-ml-10`} style={{ transformStyle: 'preserve-3d' }}>
                  
                  {settings.enable_spotlight && (
                      <div className="absolute bottom-[10%] lg:bottom-[15%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] lg:w-[60%] lg:h-[60%] blur-[50px] lg:blur-[80px] rounded-full pointer-events-none" style={{ backgroundColor: settings.color_primary, opacity: 0.15 }} />
                  )}

                  <div ref={charactersRef} className="absolute inset-0 flex items-end justify-center" style={{ transformStyle: 'preserve-3d' }}>
                      {slides.map((slide, index) => {
                          const imageUrl = isMobile ? (slide.mobile_image || slide.image_url) : (slide.desktop_image || slide.image_url);
                          return (
                              <div 
                                  key={`${slide.id}-${index}`}
                                  className={`absolute bottom-0 ${isMobile ? settings.mobile_char_width : settings.desktop_char_width} origin-bottom pointer-events-none transition-all ease-[cubic-bezier(0.25,1,0.5,1)]`}
                                  style={{
                                      ...getStyleForRole(index),
                                      transitionDuration: settings.anim_speed,
                                      willChange: 'transform, opacity, filter, left, bottom'
                                  }}
                              >
                                  <img 
                                      src={imageUrl} 
                                      alt={slide.title || settings.seo_image_alt || "Fashion Image"} 
                                      className="w-full h-auto max-h-[36vh] sm:max-h-[40vh] lg:max-h-[70vh] object-contain object-bottom select-none drop-shadow-[0_15px_25px_rgba(231,183,76,0.15)] lg:drop-shadow-[0_20px_35px_rgba(231,183,76,0.2)]"
                                      draggable={false}
                                  />
                              </div>
                          );
                      })}
                  </div>
              </div>

              {/* Description */}
              {desc && (
                <div className={`lg:col-span-5 lg:row-start-4 flex justify-center lg:justify-start ${settings.mobile_gap_char_desc} lg:mb-3 z-50`}>
                    <p ref={descRef} className={`${isMobile ? settings.desc_size_mobile : settings.desc_size_desktop} text-center lg:text-left font-light leading-relaxed line-clamp-2 max-w-[280px] sm:max-w-sm lg:max-w-none`} style={{ color: settings.color_text_secondary }}>
                        {desc}
                    </p>
                </div>
              )}

              {/* Buttons */}
              <div className="lg:col-span-6 lg:row-start-5 flex justify-center lg:justify-start mb-4 lg:mb-0 z-50 w-full sm:w-auto">
                  <div ref={buttonsRef} className={`flex flex-row justify-center lg:justify-start gap-3 ${settings.mobile_btn_width} sm:w-auto items-center`}>
                      {primaryText && (
                          <Link to={primaryUrl} className="group relative w-full sm:w-auto text-center px-6 py-3 md:px-7 md:py-3.5 text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase overflow-hidden rounded-full transition-transform hover:scale-105 duration-300 shadow-lg flex-1 sm:flex-none" style={{ backgroundColor: settings.color_button_bg, color: settings.color_button_text }}>
                              <span className="relative z-10">{primaryText}</span>
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: settings.color_button_hover }} />
                          </Link>
                      )}
                      {secondaryText && (
                          <Link to={secondaryUrl} className="group w-full sm:w-auto text-center px-6 py-3 md:px-7 md:py-3.5 border border-[rgba(255,255,255,0.08)] text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[rgba(255,255,255,0.03)] transition-all duration-300 rounded-full backdrop-blur-sm shadow-lg flex-1 sm:flex-none" style={{ color: settings.color_text_primary, borderColor: 'rgba(255,255,255,0.08)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = settings.color_primary; e.currentTarget.style.color = settings.color_primary; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = settings.color_text_primary; }}>
                              {secondaryText}
                          </Link>
                      )}
                  </div>
              </div>

              {/* Desktop Nav */}
              <div className="hidden lg:flex lg:col-span-6 lg:row-start-6 mt-8 xl:mt-10 z-50 gap-3">
                  <button onClick={() => navigate('prev')} className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 group backdrop-blur-md" aria-label="Previous" onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.color_primary} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <ArrowLeft className="w-4 h-4 transition-colors" style={{ color: settings.color_text_secondary }} />
                  </button>
                  <button onClick={() => navigate('next')} className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 group backdrop-blur-md" aria-label="Next" onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.color_primary} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <ArrowRight className="w-4 h-4 transition-colors" style={{ color: settings.color_text_secondary }} />
                  </button>
              </div>

              {/* Mobile Nav */}
              {slides.length > 1 && (
                  <div className="flex lg:hidden justify-center z-50 gap-4 mt-2 mb-2">
                      <button onClick={() => navigate('prev')} className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center backdrop-blur-md" aria-label="Previous">
                          <ArrowLeft className="w-4 h-4" style={{ color: settings.color_text_primary }} />
                      </button>
                      <button onClick={() => navigate('next')} className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center backdrop-blur-md" aria-label="Next">
                          <ArrowRight className="w-4 h-4" style={{ color: settings.color_text_primary }} />
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
