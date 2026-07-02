import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { ProductCard } from '../components/home/ProductCard';

const mockArticle = {
  id: 1,
  slug: 'how-to-style-an-oversized-tshirt',
  title: 'How to Style an Oversized T-Shirt: 5 Premium Looks',
  category: 'Style Guide',
  author: 'Elena Rossi',
  image: 'https://images.unsplash.com/photo-1523398002811-999aa8d9512e?auto=format&fit=crop&q=80&w=1200',
  readTime: '4 min read',
  date: 'Jul 15, 2026',
  content: `
    <p>The oversized t-shirt has transitioned from a comfortable loungewear staple to a high-fashion necessity. When styled correctly, it offers an effortless, elevated aesthetic that bridges the gap between streetwear and contemporary minimalism.</p>
    
    <h2>1. The Proportion Play</h2>
    <p>The key to mastering the oversized look is balancing proportions. Pair a heavyweight, boxy t-shirt with tailored trousers or structured denim. This contrast between the relaxed top and fitted bottom creates a deliberate, thoughtful silhouette.</p>
    
    <blockquote>"It's not just about buying a shirt two sizes too big; it's about the cut, the drop shoulder, and the weight of the cotton."</blockquote>
    
    <h2>2. Layering for Depth</h2>
    <p>An oversized tee serves as the perfect foundation for layered outfits. Try wearing it over a long-sleeve thermal or under a cropped jacket. The hem of the t-shirt peeking out adds a dimensional, styled appearance to an otherwise simple outfit.</p>
    
    <h2>3. The French Tuck</h2>
    <p>For a slightly more structured approach, utilize the "French tuck"—tucking only the front center of the shirt into your waistband while letting the rest hang loose. This defines the waistline and prevents the oversized fabric from completely swallowing your frame.</p>
  `,
};

import { useProducts } from '../hooks/useProducts';

export function FashionArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts('style-guide');
  const relatedProducts = products.slice(0, 3);
  const article = mockArticle; // In a real app, fetch based on slug

  return (
    <div className="min-h-screen font-sans antialiased bg-white text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-24">
        {/* Article Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8 text-center pt-8">
          <button 
            onClick={() => navigate('/fashion-journal')}
            className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Journal
          </button>
          
          <div className="flex items-center justify-center gap-4 text-xs font-bold tracking-wider uppercase text-gray-500 mb-6">
            <span className="text-[var(--color-brand-dark)]">{article.category}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{article.date}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-brand-dark)] leading-tight mb-8">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
            <span>By <span className="font-bold text-gray-900">{article.author}</span></span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-sm">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Two Column Layout for Content and Shop */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Main Content */}
            <div className="flex-1 lg:max-w-3xl">
              {/* Share Bar */}
              <div className="flex items-center gap-4 py-6 border-y border-gray-100 mb-10">
                <span className="text-sm font-bold tracking-widest uppercase text-gray-400 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </span>
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:text-blue-600 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:text-blue-400 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:text-blue-700 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rich Text Content */}
              <div 
                className="prose prose-lg prose-gray max-w-none 
                prose-headings:font-bold prose-headings:text-[var(--color-brand-dark)] prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-8
                prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-brand-dark)] 
                prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:font-medium prose-blockquote:text-gray-900 prose-blockquote:my-12
                prose-img:rounded-2xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              
              {/* Shop the Story (Mobile Only) */}
              <div className="mt-16 lg:hidden border-t border-gray-100 pt-16">
                <h3 className="text-2xl font-bold mb-8">Shop The Story</h3>
                <div className="grid grid-cols-2 gap-4">
                  {relatedProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.imageUrl}
                      hoverImage={product.imageUrl}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Shop the Story */}
            <div className="hidden lg:block w-[320px] xl:w-[380px] flex-shrink-0">
              <div className="sticky top-28 premium-card p-6 border border-gray-100 shadow-sm rounded-2xl bg-gray-50/50">
                <div className="text-center mb-8">
                  <h3 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">Shop This Look</h3>
                  <h4 className="text-xl font-bold text-[var(--color-brand-dark)]">Featured Products</h4>
                </div>
                
                <div className="space-y-6">
                  {relatedProducts.map((product) => (
                    <div key={product.id} className="flex gap-4 group bg-white p-3 rounded-xl hover:shadow-md transition-shadow">
                      <Link to={`/product/${product.id}`} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      <div className="flex flex-col justify-center">
                        <Link to={`/product/${product.id}`} className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-gray-600 transition-colors line-clamp-2">
                          {product.name}
                        </Link>
                        <p className="font-bold text-[var(--color-brand-dark)]">৳ {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-8 py-4 bg-[var(--color-brand-dark)] text-white font-bold tracking-widest rounded-xl hover:bg-[#152e22] transition-colors">
                  VIEW FULL COLLECTION
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
