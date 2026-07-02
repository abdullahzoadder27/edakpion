const fs = require('fs');
let content = fs.readFileSync('src/components/home/BestSellers.tsx', 'utf8');

const target1 = `import { useHomepageData } from '../../hooks/useHomepageData';

const mockBestSellers = [
  { id: '1', name: "Signature Oversized Tee", price: 1200, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { id: '2', name: "Everyday Oxford Shirt", price: 2200, image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: '3', name: "Relaxed Fit Chino", price: 2800, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
  { id: '4', name: "Minimalist Leather Sneaker", price: 4500, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800" },
];

export function BestSellers() {
  const bestSellers = useHomepageData('best_sellers', mockBestSellers);`;

const replace1 = `import { useProducts } from '../../hooks/useProducts';

export function BestSellers() {
  const { products } = useProducts('best-sellers');
  const bestSellers = products.slice(0, 4);`;

content = content.replace(target1, replace1);

const target2 = `      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {bestSellers.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>`;

const replace2 = `      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {bestSellers.map(product => (
          <ProductCard 
            key={product.id} 
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl}
            hoverImage={product.imageUrl}
          />
        ))}
      </div>`;

content = content.replace(target2, replace2);
fs.writeFileSync('src/components/home/BestSellers.tsx', content);
