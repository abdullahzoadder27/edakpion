import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const mockArticles = [
  {
    id: 1,
    slug: 'how-to-style-an-oversized-tshirt',
    title: 'How to Style an Oversized T-Shirt: 5 Premium Looks',
    category: 'Style Guide',
    image: 'https://images.unsplash.com/photo-1523398002811-999aa8d9512e?auto=format&fit=crop&q=80&w=800',
    readTime: '4 min read',
    date: 'Jul 15, 2026',
    description: 'Master the art of the oversized silhouette with our comprehensive guide to balancing proportions.'
  },
  {
    id: 2,
    slug: 'summer-streetwear-essentials',
    title: 'Summer Streetwear Essentials 2026',
    category: 'Seasonal Collections',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    readTime: '6 min read',
    date: 'Jul 10, 2026',
    description: 'Discover the key pieces you need to stay cool while looking effortlessly styled this season.'
  },
  {
    id: 3,
    slug: 'premium-cotton-care-guide',
    title: 'The Ultimate Premium Cotton Care Guide',
    category: 'Product Care',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
    readTime: '3 min read',
    date: 'Jul 05, 2026',
    description: 'Learn how to wash, dry, and store your premium garments to make them last a lifetime.'
  }
];

export function FashionJournalSection() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100 mt-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.2em] text-gray-400 mb-3 uppercase">Editorial</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-brand-dark)] mb-4">
            Latest From Fashion Journal
          </h2>
          <p className="text-gray-500 text-lg">
            Style inspiration, product care guides, and the latest trends from our editorial team.
          </p>
        </div>
        <Link 
          to="/fashion-journal" 
          className="mt-6 md:mt-0 flex items-center gap-2 text-[var(--color-brand-dark)] font-bold hover:text-gray-600 transition-colors group"
        >
          View All Articles
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockArticles.map((article) => (
          <Link key={article.id} to={`/fashion-journal/${article.slug}`} className="group flex flex-col h-full">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6 premium-card">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-[var(--color-brand-dark)]">
                {article.category}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
              <span>{article.date}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors leading-tight">
              {article.title}
            </h3>
            
            <p className="text-gray-500 line-clamp-2 mt-auto">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
