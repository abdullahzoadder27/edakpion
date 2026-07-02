const fs = require('fs');
let content = fs.readFileSync('src/pages/FashionArticle.tsx', 'utf8');

const target1 = `  relatedProducts: [
    { id: '1', name: "Signature Oversized Tee", price: 1200, rating: 5.0, reviewCount: 120, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", hoverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
    { id: '3', name: "Relaxed Fit Chino", price: 2800, rating: 4.5, reviewCount: 42, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
    { id: '4', name: "Minimalist Sneaker", price: 4500, rating: 4.9, reviewCount: 210, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800" }
  ]
};

export function FashionArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();`;

const replace1 = `};

import { useProducts } from '../hooks/useProducts';

export function FashionArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts('style-guide');
  const relatedProducts = products.slice(0, 3);`;

content = content.replace(target1, replace1);

const target2 = `              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {mockArticle.relatedProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>`;

const replace2 = `              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {relatedProducts.map(product => (
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
fs.writeFileSync('src/pages/FashionArticle.tsx', content);
