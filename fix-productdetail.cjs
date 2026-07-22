const fs = require('fs');
const file = 'src/pages/ProductDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace state
content = content.replace(
  /const \[quantity, setQuantity\] = useState\(1\);\s*const \[inWishlist, setInWishlist\] = useState\(false\);\s*const \[activeTab, setActiveTab\] = useState\('description'\);\s*const addItem = useCartStore\(\(state\) => state\.addItem\);/,
  `const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const addItem = useCartStore((state) => state.addItem);

  // Gallery state
  const [activeImage, setActiveImage] = useState<string>('');
  const [validImages, setValidImages] = useState<string[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50 && validImages.length > 1) {
      const currentIndex = validImages.indexOf(activeImage);
      if (diff > 0) {
        // Swipe left -> next image
        const nextIndex = (currentIndex + 1) % validImages.length;
        setActiveImage(validImages[nextIndex]);
      } else {
        // Swipe right -> prev image
        const prevIndex = (currentIndex - 1 + validImages.length) % validImages.length;
        setActiveImage(validImages[prevIndex]);
      }
    }
    setTouchStart(null);
  };`
);

// Replace useEffect
content = content.replace(
  /if \(productError\) throw productError;\s*setProduct\(productData\);\s*if \(productData\) \{\s*setSelectedSize\(productData\.sizes\?\.\[0\] \|\| ''\);/g,
  `if (productError) throw productError;
        setProduct(productData);
        
        if (productData) {
          const imgs = Array.from(new Set((productData.images || []).filter((img: any) => typeof img === 'string' && img.trim() !== '')));
          setValidImages(imgs);
          if (imgs.length > 0) {
            setActiveImage(imgs[0]);
          } else {
            setActiveImage('https://placehold.co/800x1000/F5F2ED/0F3D2E?text=No+Image');
          }

          setSelectedSize(productData.sizes?.[0] || '');`
);

// Replace JSX
const jsxMatch = /<div className="md:w-1\/2 flex gap-4">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Info \*\/\}/.exec(content);
if (jsxMatch) {
  content = content.replace(jsxMatch[0], `<div className="md:w-1/2 flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
            {validImages.length > 1 && (
              <div className="flex md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-y-auto w-full md:w-24 snap-x snap-mandatory scrollbar-hide py-2 md:py-0 pr-4 md:pr-0">
                {validImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={\`shrink-0 w-20 md:w-24 h-24 md:h-28 bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 snap-center focus:outline-none \${
                      activeImage === img
                        ? 'border-[#0F3D2E] scale-105 shadow-md ring-2 ring-[#0F3D2E]/20'
                        : 'border-[#E8E4DE] hover:border-[#0F3D2E]/50 hover:scale-[1.02]'
                    }\`}
                    aria-label={\`View image \${i + 1}\`}
                  >
                    <img 
                      loading="lazy" 
                      decoding="async" 
                      src={img} 
                      alt={\`\${product.name} thumbnail \${i + 1}\`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Error';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            <div 
              className="flex-1 bg-white border border-[#E8E4DE] rounded-[32px] overflow-hidden h-[450px] sm:h-[500px] md:h-[650px] relative group touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                key={activeImage}
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover animate-in fade-in duration-300 transition-transform duration-700 ease-out group-hover:scale-105" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x1000/F5F2ED/0F3D2E?text=Error';
                }}
              />
            </div>
          </div>
          
          {/* Info */}`);
} else {
  console.log('JSX replacement failed');
}

fs.writeFileSync(file, content);
console.log('File updated');
