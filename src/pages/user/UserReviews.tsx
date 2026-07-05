import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Star, MessageSquare } from 'lucide-react';
import { Review } from '../../types';

export default function UserReviews() {
  const { profile } = useOutletContext<any>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, products(name, images)')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        // console.warn('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [profile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#0F3D2E]">My Reviews</h1>
        <p className="text-gray-500 text-sm">Products you have rated and reviewed.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>You haven't written any reviews yet.</p>
            <p className="text-sm mt-2">Buy products and share your thoughts to help others.</p>
            <Link to="/account/orders" className="inline-block mt-4 px-6 py-2 bg-[#0F3D2E] text-white rounded-lg text-sm font-medium hover:bg-[#154636] transition-colors">
              View Orders
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E4DE]">
            {reviews.map(review => (
              <div key={review.id} className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {review.products?.images?.[0] ? (
                      <img src={review.products.images[0]} alt={review.products.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><MessageSquare className="w-8 h-8" /></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#0F3D2E]">{review.products?.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                        review.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        review.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-[#0F3D2E] text-[#0F3D2E]' : 'fill-gray-200 text-gray-200'}`} 
                        />
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{review.review_text}</p>
                    
                    <p className="text-xs text-gray-400">
                      Reviewed on {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
