import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Clock } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import { Product } from '../../types';

export default function UserRecentlyViewed() {
  const { profile } = useOutletContext<any>();
  const [items, setItems] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchRecent = async () => {
      try {
        const { data, error } = await supabase
          .from('recently_viewed')
          .select('id, product_id, products(*)')
          .eq('user_id', profile.id)
          .order('viewed_at', { ascending: false })
          .limit(12);
          
        if (error) throw error;
        
        if (data) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            product: item.products
          })).filter(item => item.product != null);
          setItems(mapped);
        }
      } catch (err) {
        // console.error('Error fetching recently viewed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [profile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#0F3D2E]">Recently Viewed</h1>
        <p className="text-gray-500 text-sm">Products you have looked at recently.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">Loading products...</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-[#0F3D2E]">No recently viewed products</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
