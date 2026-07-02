import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { Clock, Search, ChevronRight, ArrowRight } from 'lucide-react';

const categories = [
  'All',
  'Fashion Tips',
  'Style Guide',
  'New Arrivals',
  'Product Care',
  'Seasonal Collections',
  'Lifestyle',
  'Brand Stories',
  'News & Offers'
];

const articles = [
  {
    id: 1,
    slug: 'how-to-style-an-oversized-tshirt',
    title: 'How to Style an Oversized T-Shirt: 5 Premium Looks',
    category: 'Style Guide',
    author: 'Elena Rossi',
    image: 'https://images.unsplash.com/photo-1523398002811-999aa8d9512e?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min read',
    date: 'Jul 15, 2026',
    description: 'Master the art of the oversized silhouette with our comprehensive guide to balancing proportions. From streetwear to elevated casual, discover how to make this essential piece work for any occasion.',
    featured: true
  },
  {
    id: 2,
    slug: 'summer-streetwear-essentials',
    title: 'Summer Streetwear Essentials 2026',
    category: 'Seasonal Collections',
    author: 'Marcus Chen',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    readTime: '6 min read',
    date: 'Jul 10, 2026',
    description: 'Discover the key pieces you need to stay cool while looking effortlessly styled this season.',
    featured: false
  },
  {
    id: 3,
    slug: 'premium-cotton-care-guide',
    title: 'The Ultimate Premium Cotton Care Guide',
    category: 'Product Care',
    author: 'Sarah Jenkins',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
    readTime: '3 min read',
    date: 'Jul 05, 2026',
    description: 'Learn how to wash, dry, and store your premium garments to make them last a lifetime.',
    featured: false
  },
  {
    id: 4,
    slug: 'evolution-of-cargo-pants',
    title: 'The Evolution of Cargo Pants in Modern Fashion',
    category: 'Fashion Tips',
    author: 'David Wright',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800',
    readTime: '5 min read',
    date: 'Jun 28, 2026',
    description: 'From utilitarian roots to high-fashion runways, explore how cargo pants became a wardrobe staple.',
    featured: false
  },
  {
    id: 5,
    slug: 'minimalist-wardrobe-essentials',
    title: 'Building a Timeless Minimalist Wardrobe',
    category: 'Lifestyle',
    author: 'Elena Rossi',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    readTime: '7 min read',
    date: 'Jun 22, 2026',
    description: 'Focus on quality over quantity with these essential pieces that form the foundation of any great wardrobe.',
    featured: false
  }
];

export function FashionJournal() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  const filteredArticles = regularArticles.filter(article => {
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen font-sans antialiased bg-white text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-brand-dark)]">
              Fashion Journal
            </h1>
            <p className="text-lg text-gray-500">
              Style inspiration, product care guides, and the latest trends from our editorial team.
            </p>
          </div>
        </div>

        {/* Featured Article Hero */}
        {featuredArticle && activeCategory === 'All' && !searchQuery && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
            <Link to={`/fashion-journal/${featuredArticle.slug}`} className="group relative block rounded-2xl overflow-hidden premium-card">
              <div className="aspect-[21/9] md:aspect-[21/7] relative w-full">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                    {featuredArticle.category}
                  </span>
                  <span className="text-white/80 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredArticle.readTime}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
                  {featuredArticle.title}
                </h2>
                <p className="text-white/80 text-lg max-w-2xl hidden md:block mb-6">
                  {featuredArticle.description}
                </p>
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-gray-200 transition-colors">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sticky top-[64px] z-30 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Categories Scroll */}
            <div className="flex-1 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-[var(--color-brand-dark)] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72 flex-shrink-0">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-dark)] focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
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
          ) : (
            <div className="text-center py-24">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your category or search term.</p>
              <button 
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="mt-6 text-[var(--color-brand-dark)] font-bold hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
