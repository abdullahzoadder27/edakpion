import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { migrateDemoProducts } from '../utils/migrateProducts';

export function useProducts(activeTab?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!isSupabaseConfigured || !supabase) {
        console.warn('Supabase is not configured.');
        setProducts([]);
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
          if (activeTab === 'DISCOUNTED') query = query.not('compare_at_price', 'is', null);
        }

        let { data, error } = await query;
        if (error) throw error;

        if (data) {
          if (data.length === 0 && !activeTab) {
             // Auto migrate
             const success = await migrateDemoProducts();
             if (success) {
               const { data: retryData } = await query;
               if (retryData) {
                  data = retryData;
               }
             }
          }
          const formattedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
            category: item.category_id || 'Top Picks'
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err: any) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeTab]);

  return { products, loading, error };
}
