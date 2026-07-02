import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { products as mockProducts } from '../data';

export function useProducts(activeTab?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!isSupabaseConfigured || !supabase) {
        console.warn('Supabase is not configured. Falling back to mock data so the UI does not break.');
        let filteredMock = mockProducts;
        if (activeTab) {
          // Simply simulate filtering for mock data
          // In real app, you might map tabs to specific flags (is_new_arrival, etc)
          filteredMock = mockProducts.filter(p => p.category === 'Top Picks'); 
        }
        setProducts(filteredMock);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('products')
          .select('*, product_images(image_url)')
          .eq('status', 'active');

        if (activeTab) {
          if (activeTab === 'NEW ARRIVAL') query = query.eq('is_new_arrival', true);
          if (activeTab === 'BEST SELLER') query = query.eq('is_best_seller', true);
          if (activeTab === 'TRENDING') query = query.eq('is_trending', true);
          if (activeTab === 'PREMIUM') query = query.eq('is_featured', true);
          if (activeTab === 'DISCOUNTED') query = query.not('sale_price', 'is', null);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          const formattedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
            category: item.category_id || 'Top Picks'
          }));
          
          if (formattedProducts.length === 0) {
            // Provide mock data if table is empty for visual purposes in dev
             setProducts(mockProducts);
          } else {
             setProducts(formattedProducts);
          }
        }
      } catch (err: any) {
        // Silent catch for expected fallback
        setError(err.message);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeTab]);

  return { products, loading, error };
}
