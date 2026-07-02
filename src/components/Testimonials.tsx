import { Star } from 'lucide-react';
import { testimonials } from '../data';

export function Testimonials() {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-[var(--color-brand-card)] p-8 rounded-2xl flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'fill-[var(--color-brand-dark)] text-[var(--color-brand-dark)]' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-800 font-medium leading-relaxed mb-4">"{testimonial.text}"</p>
            <p className="text-xs font-bold text-gray-900">- {testimonial.name}</p>
          </div>
        ))}
        <div className="bg-[var(--color-brand-card)] rounded-2xl overflow-hidden h-[200px] md:h-auto">
           <img 
              src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600" 
              alt="Style" 
              className="w-full h-full object-cover object-top"
            />
        </div>
      </div>
    </div>
  );
}
