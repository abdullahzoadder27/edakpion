import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProductReview } from '../types';
import { Star, CheckCircle, ChevronDown, MessageSquare, ThumbsUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';

interface Props {
  productId: string;
  productName: string;
  productImage?: string;
  productDescription?: string;
  productPrice?: number;
  productSlug?: string;
  productStock?: number;
}

export default function ProductReviews({ productId, productName, productImage, productDescription, productPrice, productSlug, productStock }: Props) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      // Fetch admin-created reviews
      const { data: adminData, error: adminError } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'Published');
        
      // Fetch user-created reviews
      const { data: userData, error: userError } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .eq('status', 'approved');

      if (adminError) console.error("Admin reviews error:", adminError);
      if (userError) console.error("User reviews error:", userError);

      let allReviews: any[] = [];
      
      if (adminData) {
        allReviews = [...adminData];
      }
      
      if (userData) {
        const mappedUserReviews = userData.map((r: any) => ({
          id: r.id,
          product_id: r.product_id,
          customer_name: r.profiles?.full_name || 'Verified Customer',
          review_text: r.review_text,
          rating: r.rating || 5,
          verified_buyer: !!r.order_id,
          customer_location: '',
          customer_designation: 'Customer',
          profile_image: r.profiles?.avatar_url || r.review_image_url || '',
          review_date: r.created_at,
          helpful_count: 0,
          status: 'Published',
          sort_order: 0,
          admin_reply: r.admin_reply || '',
          created_at: r.created_at,
          updated_at: r.updated_at
        }));
        allReviews = [...allReviews, ...mappedUserReviews];
      }

      setReviews(allReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return sorted.sort((a, b) => b.helpful_count - a.helpful_count);
      default:
        return sorted;
    }
  };

  const sortedReviews = getSortedReviews();
  const visibleReviews = sortedReviews.slice(0, visibleCount);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length 
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

  
  const structuredData: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "image": productImage ? [productImage] : undefined,
    "description": productDescription,
    "brand": {
      "@type": "Brand",
      "name": "Edakpion"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://edakpion.com/product/${productSlug || productId}`,
      "priceCurrency": "BDT",
      "price": productPrice || 0,
      "availability": (productStock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  if (reviews.length > 0) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };
    structuredData.review = reviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.customer_name
      },
      "datePublished": r.review_date.split('T')[0],
      "reviewBody": r.review_text,
      "reviewRating": {
        "@type": "Rating",
        "bestRating": "5",
        "ratingValue": r.rating.toString(),
        "worstRating": "1"
      }
    }));
  }


  if (loading) {
    return <div className="py-12 flex justify-center text-gray-500">Loading reviews...</div>;
  }

  return (
    <div className="py-12 border-t border-gray-100" id="reviews">
      {structuredData && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Reviews Summary */}
          <div className="md:w-1/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#0F3D2E]" />
              Customer Reviews
            </h2>
            
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                <div>
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">Based on {reviews.length} reviews</div>
                </div>
              </div>

              <div className="space-y-3">
                {ratingCounts.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16 text-sm text-gray-600">
                      <span>{stars}</span>
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-right text-sm text-gray-500">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:w-2/3">
            {reviews.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{reviews.length} Reviews</h3>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 text-sm font-medium text-gray-700"
                    >
                      <option value="newest">Newest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-6">
                  <AnimatePresence>
                  {visibleReviews.map((review) => (
                    <motion.div 
                    key={review.id} 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-100 pb-6 last:border-0"
                  >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {review.profile_image ? (
                            <img src={review.profile_image} alt={review.customer_name} loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                              {review.customer_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{review.customer_name}</span>
                              {review.verified_buyer && (
                                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            {(review.customer_designation || review.customer_location) && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {review.customer_designation} {review.customer_designation && review.customer_location ? '•' : ''} {review.customer_location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(review.review_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      
                      <div className="text-gray-700 prose prose-sm max-w-none">
                        <ReactMarkdown>{review.review_text}</ReactMarkdown>
                      </div>
                      {review.admin_reply && (
                        <div className="mt-4 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-[#0F3D2E] flex items-center justify-center text-white text-xs font-bold">
                              EDK
                            </div>
                            <span className="font-bold text-sm text-gray-900">EDAKPION Support</span>
                          </div>
                          <div className="text-gray-700 text-sm">
                            <ReactMarkdown>{review.admin_reply}</ReactMarkdown>
                          </div>
                        </div>
                      )}


                      {review.helpful_count > 0 && (
                        <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{review.helpful_count} people found this helpful</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>

                {visibleCount < reviews.length && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 5)}
                      className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl">
                <Star className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this product once you purchase it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
