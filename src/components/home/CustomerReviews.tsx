import React, { useRef } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  { id: 1, name: "Arif H.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", text: "The quality of the oversized tee is exceptional. Heavyweight cotton that drapes perfectly. Will definitely buy again.", rating: 5 },
  { id: 2, name: "Sarah M.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", text: "Finally found a brand in Bangladesh that understands minimalist aesthetics and premium fabrics. Fast delivery too.", rating: 5 },
  { id: 3, name: "Tanvir R.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", text: "The trench coat fits exactly as described. The stitching and details rival international luxury brands.", rating: 4 },
  { id: 4, name: "Nusrat F.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150", text: "Excellent customer service and easy returns. The hoodie is my new winter essential. Love the color.", rating: 5 },
  { id: 5, name: "Faisal K.", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=150", text: "Great fit and finish. The packaging felt very premium. Highly recommend to anyone looking for quality basics.", rating: 5 },
];

export function CustomerReviews() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-center md:text-left">Customer Voices</h2>
            <p className="text-gray-400 max-w-xl text-center md:text-left">Read what our community has to say about our products and service.</p>
          </div>
          <div className="hidden md:flex gap-4">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-6 px-6 lg:mx-0 lg:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((review) => (
            <div key={review.id} className="min-w-[85vw] md:min-w-[400px] flex-shrink-0 snap-center bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-1 mb-6 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-lg text-gray-200 mb-8 leading-relaxed font-serif italic">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                  <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-white">{review.name}</h4>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Verified Buyer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
