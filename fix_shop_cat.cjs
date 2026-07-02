const fs = require('fs');
let content = fs.readFileSync('src/components/home/ShopByCategory.tsx', 'utf8');

const target1 = `import { ProductCard } from './ProductCard';

const categories = [
  "New Arrival", "Best Seller", "Men", "Women", "Oversized", "Hoodies", "Accessories", "On Discount"
];

const categoryProducts = [
  { id: '1', name: "Signature Oversized Tee", price: 1200, rating: 5.0, reviewCount: 120, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { id: '2', name: "Everyday Oxford Shirt", price: 2200, rating: 4.8, reviewCount: 85, image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: '3', name: "Relaxed Fit Chino", price: 2800, rating: 4.5, reviewCount: 42, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
  { id: '4', name: "Minimalist Sneaker", price: 4500, rating: 4.9, reviewCount: 210, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800" },
  { id: '5', name: "Boxy Fit Denim Jacket", price: 3800, rating: 4.7, reviewCount: 56, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800" },
  { id: '6', name: "Ribbed Knit Sweater", price: 2400, rating: 4.6, reviewCount: 89, image: "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&q=80&w=800" },
];

export function ShopByCategory() {
  const [activeCategory, setActiveCategory] = useState("New Arrival");`;

const replace1 = `import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';

const categories = [
  "New Arrival", "Best Seller", "Men", "Women", "Oversized", "Hoodies", "Accessories", "On Discount"
];

export function ShopByCategory() {
  const [activeCategory, setActiveCategory] = useState("New Arrival");
  const { products } = useProducts(activeCategory);
  
  // Use first 6 products for display
  const displayProducts = products.slice(0, 6);`;

content = content.replace(target1, replace1);

const target2 = `        <div className="flex-grow">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-12">
            {categoryProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>`;

const replace2 = `        <div className="flex-grow">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-12">
            {displayProducts.map(product => (
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
fs.writeFileSync('src/components/home/ShopByCategory.tsx', content);
