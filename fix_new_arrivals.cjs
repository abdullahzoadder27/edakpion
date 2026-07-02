const fs = require('fs');
let content = fs.readFileSync('src/components/home/NewArrivalsCarousel.tsx', 'utf8');

const target1 = `import { ProductCard } from './ProductCard';

const products = [
  { id: '1', name: "Premium Heavyweight Hoodie", price: 2500, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: '2', name: "Oversized Vintage Wash Tee", price: 1200, originalPrice: 1500, discount: 20, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { id: '3', name: "Classic Denim Jacket", price: 3500, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800" },
  { id: '4', name: "Essential Jogger", price: 1800, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: '5', name: "Structured Tote Bag", price: 1500, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800" },
];

export function NewArrivalsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);`;

const replace1 = `import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';

export function NewArrivalsCarousel() {
  const { products, loading } = useProducts('new-arrivals');
  const scrollContainerRef = useRef<HTMLDivElement>(null);`;

content = content.replace(target1, replace1);

const target2 = `        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8">
          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[350px] snap-start">
              <ProductCard {...product} />
            </div>
          ))}
        </div>`;

const replace2 = `        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8">
          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[350px] snap-start">
              <ProductCard 
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.price + 200}
                discount={product.price ? Math.round((200 / (product.price + 200)) * 100) : 0}
                image={product.imageUrl}
                hoverImage={product.imageUrl}
                isNew={true}
              />
            </div>
          ))}
        </div>`;

content = content.replace(target2, replace2);
fs.writeFileSync('src/components/home/NewArrivalsCarousel.tsx', content);
