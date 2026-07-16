const fs = require('fs');

const filepath = 'src/components/ui/HeroSlider.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const regex = /const currentSlide = slides\[activeIndex\] \|\| slides\[0\];[\s\S]*?const secondaryUrl = [^\n]+;/;

const replacement = `
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

content = content.replace(regex, replacement.trim());

// Also fix the main container background color
content = content.replace(
  '<div className="relative w-full h-[85vh] md:h-[90vh] min-h-[600px] md:min-h-[700px] max-h-[800px] md:max-h-[900px] overflow-hidden group flex flex-col md:flex-row">',
  '<div className="relative w-full h-[85vh] md:h-[90vh] min-h-[600px] md:min-h-[700px] max-h-[800px] md:max-h-[900px] overflow-hidden group flex flex-col md:flex-row transition-colors duration-1000" style={{ backgroundColor: bgColor }}>'
);
// In case the `sm:` class is still there in the original source
content = content.replace(
  '<div className="relative w-full h-[85vh] sm:h-[90vh] min-h-[600px] md:min-h-[700px] max-h-[800px] md:max-h-[900px] overflow-hidden group flex flex-col md:flex-row">',
  '<div className="relative w-full h-[85vh] sm:h-[90vh] min-h-[600px] md:min-h-[700px] max-h-[800px] md:max-h-[900px] overflow-hidden group flex flex-col md:flex-row transition-colors duration-1000" style={{ backgroundColor: bgColor }}>'
);

fs.writeFileSync(filepath, content);
console.log('Fixed HeroSlider vars');
