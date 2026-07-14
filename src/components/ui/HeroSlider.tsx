import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { gsap } from 'gsap';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?q=80&w=1200&auto=format&fit=crop',
    alt: 'Premium Streetwear Model 1'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1523398002811-999aa8ffdd59?q=80&w=1200&auto=format&fit=crop',
    alt: 'Premium Streetwear Model 2'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Premium Streetwear Model 3'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?q=80&w=1200&auto=format&fit=crop',
    alt: 'Premium Streetwear Model 4'
  }
];

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const animateContent = () => {
    // Kill existing tweens on the elements
    gsap.killTweensOf([headlineRef.current, subtitleRef.current, descRef.current, btnRef.current]);

    gsap.fromTo(subtitleRef.current,
      { y: 20, opacity: 0, filter: 'blur(4px)' },
      { y: 0, opacity: 0.7, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo(headlineRef.current,
      { y: 30, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', delay: 0.1 }
    );
    gsap.fromTo(descRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 0.8, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
    gsap.fromTo(btnRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)', delay: 0.4 }
    );
  };

  useEffect(() => {
    animateContent();
  }, [activeIndex]);

  return (
    <div className="w-full h-[600px] bg-[#0F3D2E] rounded-[32px] relative overflow-hidden flex flex-col md:flex-row items-center max-w-7xl mx-auto group">
      <style>{`
        .animate-ken-burns {
          animation: kenBurns 20s ease-out infinite alternate;
        }
        @keyframes kenBurns {
          0% { transform: scale(1) translateZ(0); }
          100% { transform: scale(1.15) translateZ(0); }
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

      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white z-10">
        <span ref={subtitleRef} className="text-[12px] font-bold tracking-[0.3em] uppercase opacity-70 mb-2">Premium Fashion Store</span>
        <h1 ref={headlineRef} className="text-5xl md:text-7xl font-serif leading-[0.9] mb-4">Streetwear<br/>Bangladesh</h1>
        <p ref={descRef} className="text-sm opacity-80 mb-8 max-w-sm font-light">
          Defining the new standard of Streetwear in Bangladesh. EDAKPION focuses on heavyweight silhouettes, premium essentials, and the art of the oversized fit. More than just a clothing brand—this is your urban uniform.
        </p>
        <div ref={btnRef}>
          <Link to="/shop" className="btn-premium inline-block w-max px-10 py-4 bg-white text-[#0F3D2E] font-bold text-xs tracking-widest uppercase rounded-full hover:bg-[#F5F2ED]">
            SHOP NOW
          </Link>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full md:bg-[#154636] pointer-events-none md:pointer-events-auto overflow-hidden md:overflow-visible">
        <div className="w-full h-full flex items-end justify-center relative">
            <div className="w-[80%] h-[90%] bg-[#215a48] rounded-t-full opacity-40 animate-pulse hidden md:block" style={{ animationDuration: '4s' }}></div>
            <div className="absolute bottom-0 right-0 md:right-10 w-[200px] md:w-[300px] h-[280px] md:h-[400px] bg-[#0F3D2E] border-x-4 border-t-4 md:border-x-8 md:border-t-8 border-white/30 rounded-t-[100px] flex items-center justify-center overflow-hidden animate-float shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              
              {/* Luxury Water Drop / Glass effect */}
              <div className="absolute inset-0 overflow-hidden z-20 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-10%] left-[20%] w-[1px] h-[15px] bg-white/40 blur-[0.5px] rounded-full animate-[waterDrop_4s_infinite_linear] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-[-10%] left-[50%] w-[2px] h-[20px] bg-white/30 blur-[0.5px] rounded-full animate-[waterDrop_6s_infinite_linear] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[-10%] left-[80%] w-[1px] h-[10px] bg-white/50 blur-[0.5px] rounded-full animate-[waterDrop_3s_infinite_linear] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-[-10%] left-[35%] w-[1px] h-[12px] bg-white/40 blur-[0.5px] rounded-full animate-[waterDrop_5s_infinite_linear] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" style={{ animationDelay: '3.5s' }}></div>
                <div className="absolute top-[-10%] left-[65%] w-[2px] h-[18px] bg-white/30 blur-[0.5px] rounded-full animate-[waterDrop_4.5s_infinite_linear] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" style={{ animationDelay: '1.5s' }}></div>
              </div>

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
                loop={true}
                className="w-full h-full z-10"
              >
                {slides.map((slide, index) => (
                  <SwiperSlide key={slide.id}>
                    <img
                      fetchPriority={index === 0 ? "high" : "auto"}
                      loading={index === 0 ? "eager" : "lazy"}
                      src={slide.image}
                      alt={slide.alt}
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
      <div className="absolute bottom-6 right-6 md:right-16 z-20 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto">
        <button className="hero-prev w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md pointer-events-auto" aria-label="Previous slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="hero-pagination flex items-center gap-2 pointer-events-auto"></div>
        <button className="hero-next w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md pointer-events-auto" aria-label="Next slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

    </div>
  );
}
