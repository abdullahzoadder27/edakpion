import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { HeroSlide, HeroSettings, Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, StarHalf, ArrowRight, Play, Check } from 'lucide-react';

const JamdaniPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="jamdani-hero" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="20" cy="20" r="2" fill="currentColor"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#jamdani-hero)"/>
  </svg>
);

const getColorHex = (colorName: string) => {
  const map: Record<string, string> = {
    'Navy': '#000080',
    'White': '#FFFFFF',
    'Black/White': '#111111',
    'Green/White': '#228B22',
    'Blue Pattern': '#4169E1',
    'Khaki': '#F0E68C',
    'Black': '#000000',
    'Green': '#008000',
    'Red': '#FF0000',
    'Yellow': '#FFFF00',
    'Purple': '#800080'
  };
  return map[colorName] || '#cccccc';
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings first to know which products to fetch
        const { data: settingsData } = await supabase.from('store_settings').select('key, value').in('key', ['hero_settings', 'hero_manager']);
        
        let finalSettings = null;
        if (settingsData) {
          const managerData = settingsData.find(s => s.key === 'hero_manager')?.value;
          const legacyData = settingsData.find(s => s.key === 'hero_settings')?.value;
          finalSettings = managerData || legacyData;
          if (finalSettings) setSettings(finalSettings);
        }

        let productQuery = supabase.from('products').select('*').eq('status', 'active');
        
        if (finalSettings?.products?.selection_mode === 'multiple' && finalSettings.products.selected_product_ids?.length > 0) {
          productQuery = productQuery.in('id', finalSettings.products.selected_product_ids);
        } else {
          productQuery = productQuery.order('created_at', { ascending: false }).limit(4);
        }

        const [slidesRes, productsRes] = await Promise.all([
          supabase.from('hero_slides').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          productQuery
        ]);
        
        if (slidesRes.data) setSlides(slidesRes.data);
        if (productsRes.data && productsRes.data.length > 0) {
          // If we had selected IDs, preserve their order
          let finalProducts = productsRes.data;
          if (finalSettings?.products?.selected_product_ids?.length > 0) {
            finalProducts = [...productsRes.data].sort((a, b) => {
               return finalSettings.products.selected_product_ids.indexOf(a.id) - finalSettings.products.selected_product_ids.indexOf(b.id);
            });
          }
          setProducts(finalProducts);
          if (finalProducts[0].colors?.length > 0) {
            setSelectedColor(finalProducts[0].colors[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching hero data:', err);
      } finally {
        setLoading(false);
        setTimeout(() => setIsInitialLoad(false), 2000);
      }
    };
    fetchData();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === 'undefined') return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 15;
    const y = (clientY / innerHeight - 0.5) * 15;
    setMousePos({ x, y });
  };

  const handleProductChange = (idx: number) => {
    if (idx === activeIndex) return;
    setActiveIndex(idx);
    const p = products[idx];
    if (p?.colors?.length > 0) {
      setSelectedColor(p.colors[0]);
    }
  };

  if (loading) return <div className="w-full min-h-[100svh] bg-transparent" />;

  const primaryColor = settings?.color_primary || '#E7B74C';
  const accentColor = settings?.design?.accent_color || settings?.color_accent || '#F0C75A';
  const buttonBg = settings?.design?.primary_color || settings?.color_button_bg || primaryColor;
  const textColor = settings?.design?.text_color || settings?.color_text_primary || '#F8F5EF';
  const descColor = settings?.design?.text_color || settings?.color_text_secondary || '#D9D2C7';
  
  const slide = slides[0] || {} as any;
              
  const activeProduct = products[activeIndex];

  const getStaggerDelay = (base: number) => isInitialLoad ? base : 0;

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[100svh] flex flex-col justify-center overflow-hidden pt-20 pb-8 lg:py-0"
      style={{
        backgroundColor: settings?.media?.background_type === 'solid' ? settings?.media?.background_color : undefined,
        backgroundImage: settings?.media?.background_type === 'image' ? `url(${settings?.media?.background_image_url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        {settings?.media?.background_type === 'gradient' && (
           <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10" />
        )}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] mix-blend-screen" 
          style={{ backgroundColor: primaryColor }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] mix-blend-screen" 
          style={{ backgroundColor: accentColor }} 
        />
        {settings?.media?.enable_animated_shapes !== false && <JamdaniPattern />}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-black/10" />
      </motion.div>

      <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col items-center justify-center min-h-full">
        {activeProduct && (
          <div className="w-full flex flex-col items-center justify-center relative z-20 flex-1 h-full pt-10">
            
            {/* Featured Product Image */}
            <div className="relative w-[85%] sm:w-[70%] max-w-xl mx-auto aspect-square flex-shrink-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.id}
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                  transition={{ duration: 0.7, delay: getStaggerDelay(0.1), ease: [0.25, 1, 0.5, 1] }}
                  className="relative w-full h-full flex items-center justify-center perspective-[1200px]"
                >
                  <motion.div
                    animate={{ y: [0, -15, 0], rotateZ: [0, 1.5, -1.5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ scale: 1.05, rotateX: mousePos.y, rotateY: -mousePos.x }}
                    className="relative z-20 w-full h-full flex items-center justify-center will-change-transform cursor-pointer"
                  >
                    <img 
                      src={activeProduct.images[0]} 
                      alt={activeProduct.name}
                      className="w-full h-full object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.5)]"
                      draggable={false}
                      fetchPriority="high"
                      loading="eager"
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 mix-blend-overlay pointer-events-none"
                      whileHover={{ opacity: 1, x: mousePos.x * 3, y: mousePos.y * 3 }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.div>
                  
                  {/* Floor Shadow */}
                  <motion.div 
                    className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[65%] h-[20px] bg-black/70 blur-[24px] rounded-[100%] pointer-events-none -z-10"
                    animate={{ scaleX: [1, 0.85, 1], opacity: [0.7, 0.4, 0.7] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            <div className="w-full flex justify-center items-end pointer-events-none mt-auto pb-4 lg:pb-8">
              <div className="w-full max-w-[90vw] sm:max-w-[80vw] lg:w-auto pointer-events-auto shrink-0 mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: getStaggerDelay(0.3), ease: "easeOut" }}
                  className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 pt-4 snap-x snap-mandatory px-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mx-auto justify-start lg:justify-center"
                >
                  {products.map((p, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button 
                        key={p.id}
                        onClick={() => handleProductChange(idx)}
                        className={`relative group flex flex-col items-center shrink-0 w-[85px] sm:w-[110px] xl:w-[120px] rounded-[2rem] pt-3 pb-2.5 transition-all duration-500 snap-center
                          ${isActive ? 'bg-white/10 border-white/30 scale-105 shadow-[0_15px_30px_rgba(0,0,0,0.3)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 shadow-lg'}
                          border backdrop-blur-md
                        `}
                      >
                        <div className="w-14 h-14 sm:w-20 sm:h-20 relative flex items-center justify-center mb-1.5">
                          <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-lg" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white mt-1">৳{p.price}</span>
                        <div className="mt-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: isActive ? primaryColor : 'rgba(255,255,255,0.1)', color: isActive ? '#000' : '#fff' }}>
                           {isActive ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <span className="text-base sm:text-lg leading-none font-light mb-0.5">+</span>}
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
