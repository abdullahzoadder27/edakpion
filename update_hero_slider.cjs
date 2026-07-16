const fs = require('fs');

const filepath = 'src/components/ui/HeroSlider.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Update query to fetch 'Published' status instead of just is_active
// Actually, let's just query where status is Published.
content = content.replace(
  ".eq('is_active', true)",
  ".eq('status', 'Published')"
);

// 2. We need dynamic colors from currentSlide
const extractCurrentSlide = `
  const currentSlide = slides[activeIndex] || slides[0];
  const title = currentSlide.title || "Premium Men's Fashion<br/>for Everyday Confidence";
  const subtitle = currentSlide.subtitle || "ELEVATE YOUR STYLE";
  const description = currentSlide.description || "Discover premium shirts, polos, oversized tees and timeless essentials crafted for modern Bangladeshi men. Quality fabrics, elegant design and confident style—only from eDakpion.";
  const primaryText = currentSlide.primary_button_text || "Shop Now";
  const primaryUrl = currentSlide.primary_button_url || "/shop";
  const secondaryText = currentSlide.secondary_button_text || "";
  const secondaryUrl = currentSlide.secondary_button_url || "/collection";
  
  const bgColor = currentSlide.background_color || '#0F3D2E';
  const panelColor = currentSlide.panel_color || '#154636';
  const ghostText = currentSlide.ghost_text || '';
  const autoplayDuration = currentSlide.autoplay_duration || 5000;
  const animationType = currentSlide.animation_type || 'fade';
`;

content = content.replace(
  /const currentSlide = slides\[activeIndex\] \|\| slides\[0\];[\s\S]*?const primaryText = currentSlide\.primary_button_text \|\| "Shop Now";/m,
  extractCurrentSlide.trim().split('\n').slice(0, 5).join('\n') + '\n  const primaryText = currentSlide.primary_button_text || "Shop Now";' // wait this is getting messy
);

// Better way: regex replace the entire const definitions
content = content.replace(
  /const currentSlide = slides\[activeIndex\] \|\| slides\[0\];[\s\S]*?const secondaryUrl = currentSlide\.secondary_button_url \|\| "\/collection";/m,
  extractCurrentSlide.trim()
);

// 3. Update main container styling
content = content.replace(
  'max-h-[800px] md:max-h-[900px] bg-[#0F3D2E] overflow-hidden',
  'max-h-[800px] md:max-h-[900px] overflow-hidden'
);

content = content.replace(
  '<div className="relative w-full h-[85vh] sm:h-[90vh] min-h-[600px] md:min-h-[700px] max-h-[800px] md:max-h-[900px] overflow-hidden group flex flex-col md:flex-row">',
  '<div className="relative w-full h-[85vh] sm:h-[90vh] min-h-[600px] md:min-h-[700px] max-h-[800px] md:max-h-[900px] overflow-hidden group flex flex-col md:flex-row transition-colors duration-1000" style={{ backgroundColor: bgColor }}>'
);
// In case the replace failed because of exact string:
content = content.replace(
  /className="relative w-full h-\[85vh\] sm:h-\[90vh\] min-h-\[600px\] md:min-h-\[700px\] max-h-\[800px\] md:max-h-\[900px\] (bg-\[\#0F3D2E\]\s*)?overflow-hidden group flex flex-col md:flex-row"/,
  'className="relative w-full h-[85vh] sm:h-[90vh] min-h-[600px] md:min-h-[700px] max-h-[800px] md:max-h-[900px] overflow-hidden group flex flex-col md:flex-row transition-colors duration-1000" style={{ backgroundColor: bgColor }}'
);


// 4. Update panel background
content = content.replace(
  /md:bg-\[\#154636\]/g,
  ''
);

content = content.replace(
  '<div className="w-full md:w-1/2 relative flex-1 pointer-events-none md:pointer-events-auto mt-4 md:mt-0 flex items-end justify-end md:justify-center overflow-hidden z-10 md:z-0 pr-4 md:pr-0">',
  '<div className="w-full md:w-1/2 relative flex-1 pointer-events-none md:pointer-events-auto mt-4 md:mt-0 flex items-end justify-end md:justify-center overflow-hidden z-10 md:z-0 pr-4 md:pr-0 transition-colors duration-1000" style={{ backgroundColor: typeof window !== "undefined" && window.innerWidth >= 768 ? panelColor : "transparent" }}>'
);

// 5. Update ambient circles
content = content.replace(
  '<div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#154636] blur-[100px] mix-blend-screen animate-pulse"',
  '<div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[100px] mix-blend-screen animate-pulse transition-colors duration-1000"'
);
content = content.replace(
  "style={{ animationDuration: '12s', animationDelay: '2s' }}",
  "style={{ animationDuration: '12s', animationDelay: '2s', backgroundColor: panelColor }}"
);

// 6. Update image frame bg
content = content.replace(
  'shrink-0 bg-[#0F3D2E] border-x-4',
  'shrink-0 border-x-4'
);

content = content.replace(
  "className=\"relative bottom-0 right-0 md:right-auto w-[220px] sm:w-[280px] md:w-[320px] lg:w-[380px] h-[300px] sm:h-[380px] md:h-[450px] lg:h-[520px] shrink-0 border-x-4 border-t-4 md:border-x-8 md:border-t-8 border-white/30 rounded-t-[100px] md:rounded-t-[150px] flex items-center justify-center overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-float transform-gpu origin-bottom md:mb-10\"",
  "className=\"relative bottom-0 right-0 md:right-auto w-[220px] sm:w-[280px] md:w-[320px] lg:w-[380px] h-[300px] sm:h-[380px] md:h-[450px] lg:h-[520px] shrink-0 border-x-4 border-t-4 md:border-x-8 md:border-t-8 border-white/30 rounded-t-[100px] md:rounded-t-[150px] flex items-center justify-center overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-float transform-gpu origin-bottom md:mb-10 transition-colors duration-1000\" style={{ backgroundColor: bgColor }}"
);

// 7. Swiper settings
content = content.replace(
  /autoplay=\{\{[\s\S]*?\}\}/,
  'autoplay={{ delay: autoplayDuration, disableOnInteraction: false, pauseOnMouseEnter: true }}'
);
content = content.replace(
  'effect="fade"',
  'effect={animationType === "slide" ? undefined : "fade"}'
);

// 8. Add Ghost Text
if (!content.includes('ghostText')) {
  content = content.replace(
    '{/* Background ambient effects */}',
    `{/* Background ambient effects */}\n      {ghostText && (\n        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0 opacity-[0.03]">\n          <span className="text-[15vw] font-black uppercase whitespace-nowrap">{ghostText}</span>\n        </div>\n      )}`
  );
}

// Write the file
fs.writeFileSync(filepath, content);
console.log('Updated HeroSlider.tsx');
