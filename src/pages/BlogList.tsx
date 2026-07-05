import { useState, useEffect } from 'react';
import { getPublishedBlogs } from '../lib/api';
import { Blog } from '../types';
import BlogCard from '../components/ui/BlogCard';
import { Search } from 'lucide-react';

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    getPublishedBlogs().then(data => {
      setBlogs(data);
      setLoading(false);
    });
  }, []);

  const filteredBlogs = blogs.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && b.category !== category) return false;
    return true;
  });

  const categories = Array.from(new Set(blogs.map(b => b.category).filter(Boolean)));

  return (
    <div className="bg-[#F5F2ED] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-4">The Journal</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Stories, style guides, and news from the world of EDAKPION.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-[#E8E4DE] outline-none text-sm"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setCategory('')}
              className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${!category ? 'bg-[#0F3D2E] text-white' : 'bg-white text-[#0F3D2E] border border-[#E8E4DE]'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat as string)}
                className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${category === cat ? 'bg-[#0F3D2E] text-white' : 'bg-white text-[#0F3D2E] border border-[#E8E4DE]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading articles...</div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500 bg-white rounded-[32px] border border-[#E8E4DE]">
            No articles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
