import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { gsap } from 'gsap';
import { supabase } from '../../lib/supabase';
import { HeroSlide } from '../../types';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const btn2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSlides(data);
        } else {
          // Provide a beautiful fallback slide if the database is empty
          setSlides([
            {
              id: 'fallback-1',
              title: 'Discover Our<br/>Premium Collection',
              subtitle: 'WELCOME TO EDAKPION',
              description: 'Experience unparalleled quality and style with our latest curated selections.',
              image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
              desktop_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
              primary_button_text: 'Shop Now',
              primary_button_url: '/shop',
              badge: 'New Arrivals',
              is_active: true,
              display_order: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching hero slides:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const animateContent = () => {
    // Kill existing tweens on the elements
    gsap.killTweensOf([headlineRef.current, subtitleRef.current, descRef.current, btnRef.current, btn2Ref.current, badgeRef.current]);

    gsap.fromTo(subtitleRef.current,
      { y: 20, opacity: 0, filter: 'blur(4px)' },
      { y: 0, opacity: 0.7, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo(headlineRef.current,
      { y: 40, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power4.out', delay: 0.1 }
    );

    gsap.fromTo(descRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 0.8, duration: 0.8, ease: 'power2.out', delay: 0.3 }
    );

    gsap.fromTo(btnRef.current,
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.5 }
    );
    
    if (btn2Ref.current) {
      gsap.fromTo(btn2Ref.current,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.6 }
      );
    }
    
    if (badgeRef.current) {
      gsap.fromTo(badgeRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  };

  useEffect(() => {
    if (slides.length > 0) {
      animateContent();
    }
  }, [activeIndex, slides]);

  if (loading) return <div className="h-[600px] w-full flex items-center justify-center bg-[#0F3D2E] text-white">Loading...</div>;
  if (slides.length === 0) return null;

  const currentSlide = slides[activeIndex] || slides[0];

  return (
    <div className="relative w-full h-[600px] md:h-[700px] bg-[#0F3D2E] overflow-hidden group">
      <style>{/* same styles... */}</style>
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes waterDrop {
          0% { transform: translateY(-20px) scaleY(1); opacity: 0; }
          10% { opacity: 0.6; }
          80% { opacity: 0.6; transform: translateY(350px) scaleY(1.2); }
          100% { opacity: 0; transform: translateY(400px) scaleY(1.5); }
        }
        
        .btn-premium {
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        .btn-premium:hover {
          box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.3);
          transform: translateY(-3px);
        }
        .btn-premium::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300%;
          height: 300%;
          background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 60%);
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          transition: transform 0.6s, opacity 0.6s;
        }
        .btn-premium:active::after {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
          transition: 0s;
        }
        
        /* Swiper custom styles */
        .hero-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: rgba(255,255,255,0.4);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-pagination-bullet-active {
          background-color: white;
          transform: scale(1.3);
        }
      `}</style>
      
      {/* Background ambient effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#154636] blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white z-10 h-full relative">
        {currentSlide.badge && (
          <div ref={badgeRef} className="mb-4">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold tracking-wider uppercase">
              {currentSlide.badge}
            </span>
          </div>
        )}
        <span ref={subtitleRef} className="text-[12px] font-bold tracking-[0.3em] uppercase opacity-70 mb-2">
          {currentSlide.subtitle}
        </span>
        <h1 ref={headlineRef} className="text-5xl md:text-7xl font-serif leading-[1.1] mb-4" dangerouslySetInnerHTML={{__html: currentSlide.title?.replace(/\n/g, '<br/>') || ''}}>
        </h1>
        <p ref={descRef} className="text-sm opacity-80 mb-8 max-w-sm font-light">
          {currentSlide.description}
        </p>
        
        <div className="flex flex-wrap gap-4">
          {currentSlide.primary_button_text && (
            <div ref={btnRef}>
              <Link to={currentSlide.primary_button_url || '/shop'} className="btn-premium inline-block w-max px-8 py-3 bg-white text-[#0F3D2E] font-bold text-xs tracking-widest uppercase rounded-full hover:bg-[#F5F2ED]">
                {currentSlide.primary_button_text}
              </Link>
            </div>
          )}
          {currentSlide.secondary_button_text && (
            <div ref={btn2Ref}>
              <Link to={currentSlide.secondary_button_url || '/shop'} className="btn-premium inline-block w-max px-8 py-3 border border-white/30 text-white font-bold text-xs tracking-widest uppercase rounded-full hover:bg-white/10 backdrop-blur-sm">
                {currentSlide.secondary_button_text}
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full md:bg-[#154636] pointer-events-none md:pointer-events-auto overflow-hidden md:overflow-visible">
        <div className="w-full h-full flex items-end justify-center relative">
            <div className="w-[80%] h-[90%] bg-[#215a48] rounded-t-full opacity-40 animate-pulse hidden md:block" style={{ animationDuration: '4s' }}></div>
            
            <div className="absolute bottom-0 right-0 md:right-10 w-[200px] md:w-[300px] h-[280px] md:h-[400px] bg-[#0F3D2E] border-x-4 border-t-4 md:border-x-8 md:border-t-8 border-white/30 rounded-t-[100px] flex items-center justify-center overflow-hidden animate-float shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              
              <Swiper
                modules={[Autoplay, EffectFade, Pagination, Navigation]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={1200}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{
                  clickable: true,
                  el: '.hero-pagination',
                  bulletClass: 'hero-pagination-bullet',
                  bulletActiveClass: 'hero-pagination-bullet-active',
                }}
                navigation={{
                  nextEl: '.hero-next',
                  prevEl: '.hero-prev',
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                loop={slides.length > 1}
                className="w-full h-full z-10"
              >
                {slides.map((slide, index) => (
                  <SwiperSlide key={slide.id}>
                    <img
                      fetchPriority={index === 0 ? "high" : "auto"}
                      loading={index === 0 ? "eager" : "lazy"}
                      src={slide.desktop_image || slide.image_url}
                      alt={slide.title || 'Slide'}
                      className="h-full w-full object-cover transform-gpu"
                      style={{
                        animation: activeIndex === index ? 'kenBurns 20s ease-out infinite alternate' : 'none',
                        willChange: 'transform'
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
        </div>
      </div>
      
      {/* Navigation Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 md:right-16 z-20 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto">
          <button className="hero-prev w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md pointer-events-auto" aria-label="Previous slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="hero-pagination flex items-center gap-2 pointer-events-auto"></div>
          <button className="hero-next w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md pointer-events-auto" aria-label="Next slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
