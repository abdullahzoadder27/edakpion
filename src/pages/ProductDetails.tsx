import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useProductDetails } from '../hooks/useProductDetails';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { 
  Heart, Share2, Star, Minus, Plus, ShoppingBag, 
  ShieldCheck, Truck, RotateCcw, ChevronRight, Check
} from 'lucide-react';
import { ProductGrid } from '../components/ProductGrid';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, reviews, loading } = useProductDetails(id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedColor(0);
      setSelectedSize('');
      setQuantity(1);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center py-32">
          <div className="animate-pulse flex flex-col items-center">
             <div className="w-12 h-12 border-4 border-gray-300 border-t-[var(--color-brand-dark)] rounded-full animate-spin"></div>
             <p className="mt-4 text-gray-500 font-medium tracking-widest text-sm">LOADING...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center py-32">
          <p className="text-xl font-bold text-gray-800 mb-4">Product Not Found</p>
          <Link to="/shop" className="text-sm font-bold tracking-widest text-[var(--color-brand-dark)] underline hover:text-[#152e22]">BACK TO SHOP</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    
    await addToCart(product.id, quantity, selectedSize);
    alert(`Added ${quantity} ${product?.name} to cart!`);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    
    await addToCart(product.id, quantity, selectedSize);
    navigate('/checkout');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    ));
  };

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-white">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 py-3 px-6 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center text-xs text-gray-500 gap-2">
          <Link to="/" className="hover:text-[var(--color-brand-dark)]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-[var(--color-brand-dark)]">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 pb-32 sm:pb-12">
        
        {/* Main Product Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
          
          {/* Left: Gallery */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
            {/* Thumbnails (Desktop side, Mobile bottom) */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 w-full sm:w-20 lg:w-24 shrink-0 no-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)}
                  className={`relative shrink-0 w-16 h-20 sm:w-full sm:h-24 lg:h-32 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[var(--color-brand-dark)] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="order-1 sm:order-2 flex-grow relative bg-[#f9f9f9] rounded-xl overflow-hidden aspect-[4/5] sm:aspect-auto sm:h-[600px] lg:h-[750px] group cursor-zoom-in">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110" 
              />
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badges?.map(badge => (
                  <span key={badge} className="bg-[var(--color-brand-dark)] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm">
                    {badge}
                  </span>
                ))}
              </div>
              
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-red-500 hover:scale-110 transition-all z-10">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 flex flex-col">
            
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating || 5)}
                  <span className="text-gray-900 font-medium ml-1">{product.rating}</span>
                  <a href="#reviews" className="text-gray-500 hover:underline">({product.reviewCount} Reviews)</a>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Sold: <span className="font-medium text-gray-900">{product.soldCount}+</span></span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">SKU: {product.sku}</span>
              </div>

              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-bold text-[var(--color-brand-dark)]">৳{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">৳{product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              
              {product.discountPercentage && (
                <div className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded mb-4">
                  Save ৳{product.saveAmount} ({product.discountPercentage}%)
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {product.shortDescription}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedColor(idx)}
                      className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor === idx ? 'border-gray-900' : 'border-transparent'}`}
                    >
                      <div className="w-full h-full rounded-full border border-gray-200" style={{ backgroundColor: color }}></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Size</h3>
                  <button onClick={() => setShowSizeGuide(true)} className="text-xs text-gray-500 hover:text-[var(--color-brand-dark)] underline">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {product.sizes.map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 rounded border flex items-center justify-center text-sm font-medium transition-all
                        ${selectedSize === size 
                          ? 'border-[var(--color-brand-dark)] bg-[var(--color-brand-dark)] text-white' 
                          : 'border-gray-200 hover:border-gray-900 text-gray-900'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded h-12 w-32">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input type="number" value={quantity} readOnly className="w-full h-full text-center text-sm font-medium border-x border-gray-300 outline-none appearance-none" />
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className={`text-sm font-medium ${product.stockStatus === 'Low Stock' ? 'text-orange-500' : 'text-green-600'}`}>
                  {product.stockStatus} {product.stockCount && `(${product.stockCount} left)`}
                </span>
              </div>
            </div>

            {/* Actions (Desktop) */}
            <div className="hidden sm:flex flex-col gap-3 mb-10">
              <div className="flex gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-white border border-[var(--color-brand-dark)] text-[var(--color-brand-dark)] h-14 rounded flex items-center justify-center gap-2 font-bold tracking-widest hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" /> ADD TO CART
                </button>
                <button className="w-14 h-14 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-900 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={handleBuyNow}
                className="w-full bg-[var(--color-brand-dark)] text-white h-14 rounded font-bold tracking-widest hover:bg-[#152e22] transition-colors shadow-lg"
              >
                BUY IT NOW
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Estimated Delivery</h4>
                    <p className="text-xs text-gray-600 mt-1">Inside Dhaka: 1-2 Days | Outside Dhaka: 3-5 Days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">100% Authentic</h4>
                    <p className="text-xs text-gray-600 mt-1">Premium quality materials guaranteed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Easy Returns</h4>
                    <p className="text-xs text-gray-600 mt-1">7-days hassle-free return policy applies.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges Image Placeholder */}
            <div className="flex justify-center border-t border-gray-200 pt-6">
               <div className="flex gap-4 sm:gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                  {/* Abstract representations of trust badges */}
                  <div className="flex flex-col items-center gap-1"><ShieldCheck className="w-6 h-6" /><span className="text-[10px] font-bold">SECURE</span></div>
                  <div className="flex flex-col items-center gap-1"><Truck className="w-6 h-6" /><span className="text-[10px] font-bold">FAST</span></div>
                  <div className="flex flex-col items-center gap-1"><RotateCcw className="w-6 h-6" /><span className="text-[10px] font-bold">RETURN</span></div>
                  <div className="flex flex-col items-center gap-1"><Star className="w-6 h-6" /><span className="text-[10px] font-bold">QUALITY</span></div>
               </div>
            </div>
            
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-200 pt-10 mb-20">
          <div className="flex overflow-x-auto border-b border-gray-200 mb-8 no-scrollbar gap-8">
            {['description', 'specifications', 'shipping', 'reviews'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold tracking-widest uppercase whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-[var(--color-brand-dark)] text-[var(--color-brand-dark)]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="grid md:grid-cols-2 gap-10">
                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                  <p>{product.description}</p>
                  {product.highlights && (
                    <div className="pt-4">
                      <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Highlights</h4>
                      <ul className="space-y-2">
                        {product.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-bold text-2xl mb-2 font-serif italic text-gray-800">Designed for Comfort</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Every detail is meticulously crafted to ensure the perfect fit and feel.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && product.specifications && (
              <div className="max-w-3xl">
                <table className="w-full text-sm text-left">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 font-bold text-gray-900 w-1/3">{key}</td>
                        <td className="py-3 px-4 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl text-sm text-gray-600 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Delivery Charges & Times</h4>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Inside Dhaka: ৳60 (1-2 Working Days)</li>
                    <li>Outside Dhaka: ৳120 (3-5 Working Days)</li>
                    <li>Free shipping on orders above ৳5000</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Return & Exchange Policy</h4>
                  <p className="mb-2">We offer a 7-day return and exchange policy from the date of delivery.</p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Item must be unworn, unwashed, and have original tags attached.</li>
                    <li>Exchange is subject to size/color availability.</li>
                    <li>Delivery charges are non-refundable unless the item is defective.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
               <div id="reviews" className="max-w-4xl">
                 <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-8 border-b border-gray-100">
                   <div className="text-center shrink-0">
                     <p className="text-5xl font-bold text-gray-900 mb-2">{product.rating}</p>
                     <div className="flex justify-center gap-1 mb-2">{renderStars(product.rating || 5)}</div>
                     <p className="text-xs text-gray-500">Based on {product.reviewCount} reviews</p>
                   </div>
                   <div className="flex-grow w-full max-w-sm space-y-2">
                     {[5,4,3,2,1].map(star => (
                       <div key={star} className="flex items-center gap-3 text-xs">
                         <span className="w-8 shrink-0">{star} Star</span>
                         <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-yellow-400" style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : 0}%` }}></div>
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                     <button className="w-full bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded font-bold tracking-widest hover:bg-[#152e22] text-xs">WRITE A REVIEW</button>
                   </div>
                 </div>

                 <div className="space-y-8">
                   {reviews.length > 0 ? reviews.map(review => (
                     <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                       <div className="flex justify-between items-start mb-3">
                         <div>
                           <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                             {review.userName}
                             {review.verified && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full lowercase italic">Verified</span>}
                           </p>
                           <div className="flex gap-1 mt-1">{renderStars(review.rating)}</div>
                         </div>
                         <span className="text-xs text-gray-400">{review.date}</span>
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                     </div>
                   )) : (
                     <p className="text-gray-500 text-sm italic">No reviews yet. Be the first to review this product!</p>
                   )}
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Fashion Journal - Style Inspiration */}
        <div className="border-t border-gray-200 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-gray-400 mb-2 uppercase">Style Inspiration</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-brand-dark)]">
                From The Journal
              </h2>
            </div>
            <Link to="/fashion-journal" className="mt-4 md:mt-0 text-sm font-bold tracking-widest text-[var(--color-brand-dark)] hover:text-gray-500 uppercase flex items-center gap-2">
              Read More 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                slug: 'how-to-style-an-oversized-tshirt',
                title: '5 Ways to Style This Piece',
                image: 'https://images.unsplash.com/photo-1523398002811-999aa8d9512e?auto=format&fit=crop&q=80&w=600',
                category: 'Style Guide'
              },
              {
                slug: 'premium-cotton-care-guide',
                title: 'How to Wash Premium Cotton',
                image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600',
                category: 'Product Care'
              },
              {
                slug: 'summer-streetwear-essentials',
                title: 'Summer Outfit Ideas',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
                category: 'Fashion Tips'
              }
            ].map((article, idx) => (
              <Link key={idx} to={`/fashion-journal/${article.slug}`} className="group block">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 premium-card">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase text-[var(--color-brand-dark)]">
                    {article.category}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-gray-600 transition-colors">{article.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest text-[var(--color-brand-dark)]">You May Also Like</h2>
          <ProductGrid />
        </div>

      </main>
      <Footer />

      {/* Mobile Sticky Purchase Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 sm:hidden flex gap-3">
        <button 
          onClick={handleAddToCart}
          className="w-12 h-12 shrink-0 border border-[var(--color-brand-dark)] text-[var(--color-brand-dark)] rounded flex items-center justify-center bg-white"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-grow bg-[var(--color-brand-dark)] text-white h-12 rounded font-bold tracking-widest text-xs"
        >
          BUY IT NOW
        </button>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-gray-400 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[500px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 px-4 rounded-tl">Size</th>
                    <th className="py-3 px-4">Chest (in)</th>
                    <th className="py-3 px-4">Length (in)</th>
                    <th className="py-3 px-4">Shoulder (in)</th>
                    <th className="py-3 px-4 rounded-tr">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">S</td>
                    <td className="py-3 px-4">38</td>
                    <td className="py-3 px-4">27</td>
                    <td className="py-3 px-4">17.5</td>
                    <td className="py-3 px-4">8.5</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">M</td>
                    <td className="py-3 px-4">40</td>
                    <td className="py-3 px-4">28</td>
                    <td className="py-3 px-4">18</td>
                    <td className="py-3 px-4">9</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">L</td>
                    <td className="py-3 px-4">42</td>
                    <td className="py-3 px-4">29</td>
                    <td className="py-3 px-4">18.5</td>
                    <td className="py-3 px-4">9.5</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">XL</td>
                    <td className="py-3 px-4">44</td>
                    <td className="py-3 px-4">30</td>
                    <td className="py-3 px-4">19</td>
                    <td className="py-3 px-4">10</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-6 text-xs text-gray-500">
                <p>* Measurements are in inches.</p>
                <p>* Tollerance +/- 0.5 inches.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
