import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .ilike('name', `%${query}%`)
          .eq('status', 'active')
          .limit(5);
          
        if (!error && data) {
          setResults(data as any[]);
        }
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceId = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceId);
  }, [query]);

  const handleProductClick = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleViewAll = () => {
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-white p-6 shadow-xl"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Search className="w-6 h-6 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 text-2xl font-serif bg-transparent border-none outline-none placeholder:text-gray-300"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loading && <div className="text-gray-500 py-4">Searching...</div>}

              {!loading && results.length > 0 && (
                <div className="space-y-4">
                  {results.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#0F3D2E]">{product.name}</h4>
                        <p className="text-sm text-gray-500">{(product as any).categories?.name}</p>
                      </div>
                      <div className="font-medium text-[#0F3D2E]">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleViewAll}
                    className="w-full text-center py-4 text-sm font-bold tracking-widest text-[#0F3D2E] uppercase hover:opacity-70"
                  >
                    View All Results
                  </button>
                </div>
              )}
              
              {!loading && query && results.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
