import { useState, useEffect } from 'react';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { Product } from '../types';
import ProductCard from '../components/ui/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const categories = ['All', 'T-Shirts', 'Shirts', 'Jackets', 'Accessories'];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  // Filter logic
  let filteredProducts = products;
  
  if (tagFilter) {
    filteredProducts = filteredProducts.filter(p => p.tags && p.tags.includes(tagFilter));
  } else if (activeCategory !== 'All') {
    // Basic category filtering for now
    filteredProducts = filteredProducts.filter(p => p.name.includes(activeCategory));
  }

  const clearFilters = () => {
    setActiveCategory('All');
    setSearchParams({});
  };

  const getPageTitle = () => {
    if (tagFilter === 'new-arrival') return 'New Arrivals';
    if (tagFilter === 'best-seller') return 'Best Sellers';
    if (tagFilter === 'discounted') return 'Discounts';
    return 'Shop All';
  };

  return (
    <div className="bg-[#F5F2ED] min-h-screen pb-16">
      {/* Shop Header */}
      <div className="bg-[#0F3D2E] text-white py-12 md:py-20 mb-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{getPageTitle()}</h1>
          <p className="text-gray-300 max-w-xl mx-auto font-light">Explore our premium collection of timeless fashion. Designed for comfort, styled for everyday wear.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                <h3 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4" /> FILTERS</h3>
                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-black">Clear All</button>
              </div>
              
              <div className="mb-8">
                <h4 className="font-bold text-sm mb-4">CATEGORIES</h4>
                <ul className="space-y-3">
                  {categories.map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => {
                          setActiveCategory(cat);
                          if (tagFilter) setSearchParams({});
                        }}
                        className={`text-sm hover:text-[#0F3D2E] transition-colors ${(activeCategory === cat && !tagFilter) ? 'font-bold text-[#0F3D2E]' : 'text-gray-600'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h4 className="font-bold text-sm mb-4 flex items-center justify-between">
                  PRICE <ChevronDown className="w-4 h-4" />
                </h4>
                {/* Price range placeholder */}
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full border rounded p-2 text-sm bg-white" />
                  <span>-</span>
                  <input type="number" placeholder="Max" className="w-full border rounded p-2 text-sm bg-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">Showing {filteredProducts.length} products</p>
              <select className="border rounded p-2 text-sm bg-white outline-none cursor-pointer">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-[#0F3D2E] animate-spin" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#0F3D2E] mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">We couldn't find any products matching your filters.</p>
                <button onClick={clearFilters} className="bg-[#0F3D2E] text-white px-6 py-2 rounded-md hover:bg-[#0a291f] transition-colors">
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Pagination Placeholder */}
            {filteredProducts.length > 0 && !isLoading && (
              <div className="flex justify-center mt-16">
                <button className="border border-gray-300 px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">
                  LOAD MORE
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

