import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const planeControls = useAnimation();
  const trailControls = useAnimation();
  const shakeControls = useAnimation();

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Base width is 1120 for desktop. Scale down proportionally if smaller.
        const newScale = Math.min(1, entry.contentRect.width / 1120);
        setScale(newScale);
      }
    });
    if (cardRef.current) observer.observe(cardRef.current);

    // Continuous slow motion
    planeControls.start({
      offsetDistance: ["0%", "100%"],
      transition: { duration: 20, ease: "linear", repeat: Infinity }
    });
    
    trailControls.start({
      pathLength: [0, 0.4, 0],
      pathOffset: [0, 0.6, 1],
      opacity: [0, 1, 0],
      transition: { duration: 20, ease: "linear", repeat: Infinity }
    });

    return () => observer.disconnect();
  }, [planeControls, trailControls]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setIsInvalid(true);
      shakeControls.start({
        x: [0, -8, 8, -6, 6, -4, 4, 0],
        transition: { duration: 0.4 }
      });
      return;
    }
    setIsInvalid(false);
    setStatus('loading');

    // Simulate API
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  // SVG Flight path - starts center top, loops right, swoops under, returns left.
  const flightPath = "M 560 120 Q 800 120, 880 180 C 960 240, 860 320, 800 260 C 740 200, 840 140, 920 200 Q 1000 280, 560 420 C 350 420, 400 120, 560 120";

  return (
    <section className="w-full bg-[#FCFCFC] py-[70px] md:py-[90px] xl:py-[120px] flex justify-center relative overflow-hidden font-sans">
      <div className="w-full max-w-[1440px] px-5 md:px-[4%] xl:px-0 flex justify-center relative z-10">
        
        {/* Relative wrapper for card and background shape */}
        <div className="relative w-full xl:w-[1120px] flex justify-center z-10">
          
          {/* Floating Background Shape */}
          <div className="absolute top-[-5%] bottom-[-5%] right-[-6%] w-[25%] bg-gradient-to-br from-[#FF365F] to-[#D60035] z-[-1] hidden md:block" />

          {/* Main Card */}
          <motion.div
            ref={cardRef}
            className="bg-white rounded-[30px] w-full min-h-[500px] relative shadow-[0_30px_80px_rgba(0,0,0,0.08)] flex flex-col items-center py-16 md:py-24 px-6 overflow-hidden"
            whileHover={{ y: -6, boxShadow: "0 40px 100px rgba(0,0,0,0.12)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {/* Animation Layer */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div style={{ width: 1120, height: 500, transform: `scale(${scale})`, transformOrigin: 'center center', position: 'absolute' }}>
                
                {/* Background Glow */}
                <motion.div 
                  className="absolute w-[200px] h-[200px] bg-[#FF365F] rounded-full blur-[80px]"
                  style={{ 
                    offsetPath: `path('${flightPath}')`,
                    offsetRotate: "0deg",
                    marginTop: -100, marginLeft: -100,
                    top: 0, left: 0
                  } as any}
                  initial={{ opacity: 0, offsetDistance: "0%" }}
                  animate={{ 
                    opacity: [0, 0.1, 0.1, 0],
                    offsetDistance: ["0%", "100%"]
                  }}
                  transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                />

                <svg width="1120" height="500" viewBox="0 0 1120 500" className="absolute inset-0">
                  <defs>
                    <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF365F" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FF365F" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#D60035" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Static Flight Path */}
                  <path 
                    d={flightPath} 
                    stroke="#D9D9D9" 
                    strokeWidth="1.5" 
                    fill="none" 
                    opacity="0.45" 
                  />
                  
                  {/* Motion Trail */}
                  <motion.path
                    d={flightPath}
                    stroke="url(#trailGradient)"
                    strokeWidth="3"
                    fill="none"
                    style={{ filter: status === 'success' ? 'url(#glow)' : 'none' }}
                    animate={trailControls}
                  />
                </svg>

                {/* Plane */}
                <motion.div
                  style={{
                    offsetPath: `path('${flightPath}')`,
                    offsetRotate: "auto",
                    position: 'absolute',
                    top: 0, left: 0,
                    width: 140, height: 140,
                    marginLeft: -70, marginTop: -70,
                    zIndex: 20
                  } as any}
                  initial={{ offsetDistance: "0%" }}
                  animate={planeControls}
                >
                  <motion.div 
                    style={{ perspective: 1000, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    animate={{ 
                      rotateX: (mousePosition.y / 500) * -8, 
                      rotateY: (mousePosition.x / 1120) * 8,
                      y: [0, -12, 0]
                    }}
                    transition={{ 
                      rotateX: { type: "spring", stiffness: 150, damping: 15 },
                      rotateY: { type: "spring", stiffness: 150, damping: 15 },
                      y: { duration: 3, ease: "easeInOut", repeat: Infinity }
                    }}
                  >
                    <svg width="140" height="140" viewBox="0 0 64 64" fill="none" className="transform -rotate-12 drop-shadow-xl">
                      <path d="M60 20L8 12L24 32L60 20Z" fill="#FF365F"/>
                      <path d="M60 20L24 32L16 52L60 20Z" fill="#D60035"/>
                      <path d="M24 32L8 12L16 52L24 32Z" fill="#B0002A"/>
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Interactive Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-[600px] mt-8">
              <motion.h2 
                className="text-[38px] md:text-[52px] xl:text-[64px] font-black tracking-[-2px] text-[#0F172A] mb-12 text-center"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                animate={{ scale: isHovered ? 1.01 : 1 }}
                transition={{ duration: 0.4 }}
              >
                SUBSCRIBE<span className="text-[#E61B4D]">.</span>
              </motion.h2>

              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                <motion.div className="w-full relative mb-12" animate={shakeControls}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (isInvalid) setIsInvalid(false);
                    }}
                    placeholder="Enter your email"
                    className={`w-full max-w-[540px] h-[56px] bg-transparent border-b outline-none text-[16px] transition-all duration-300 px-2 text-center md:text-left ${
                      isInvalid 
                        ? 'border-red-500 text-red-500' 
                        : status === 'success'
                          ? 'border-green-500 text-green-700'
                          : 'border-[#E7E7E7] focus:border-[#E61B4D] focus:shadow-[0_10px_20px_-10px_rgba(230,27,77,0.15)] text-gray-800'
                    }`}
                    disabled={status === 'loading' || status === 'success'}
                    aria-label="Email Address"
                  />
                  {isInvalid && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-2 text-xs text-red-500 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" /> Invalid email address
                    </motion.div>
                  )}
                  {status === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hidden md:block"
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className={`h-[58px] rounded-full text-white font-bold tracking-[0.5px] transition-all duration-300 flex items-center justify-center ${
                    status === 'success'
                      ? 'bg-green-500 w-[220px] shadow-[0_12px_30px_rgba(34,197,94,0.25)] cursor-default'
                      : 'bg-gradient-to-br from-[#FF365F] to-[#D60035] w-full md:w-[220px] shadow-[0_12px_30px_rgba(214,0,53,0.25)] hover:-translate-y-[3px] hover:scale-[1.03] active:scale-[0.98]'
                  }`}
                  style={{
                     boxShadow: (isHovered && status !== 'success') ? '0 15px 35px rgba(214,0,53,0.35)' : undefined
                  }}
                >
                  <AnimatePresence mode="wait">
                    {status === 'idle' && (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        SUBSCRIBE
                      </motion.span>
                    )}
                    {status === 'loading' && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </motion.div>
                    )}
                    {status === 'success' && (
                      <motion.span key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                        <Check className="w-5 h-5" /> SUBSCRIBED
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
