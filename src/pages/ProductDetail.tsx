import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Truck, RefreshCcw, Shield, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../lib/store';
import { formatPrice } from '../lib/utils';
import ProductCard from '../components/ui/ProductCard';
import SeoImage from '../components/ui/SeoImage';
import ProductReviews from "../components/ProductReviews";
import { Product } from '../types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, categories(id, name, slug)')
          .eq('slug', slug)
          .single();
          
        if (productError) throw productError;
        setProduct(productData);
        
        if (productData) {
          setSelectedSize(productData.sizes?.[0] || '');
          setSelectedColor(productData.colors?.[0] || '');
          
          // Fetch related
          const { data: relatedData } = await supabase
            .from('products')
            .select('*, categories(id, name, slug)')
            .eq('category_id', productData.category_id)
            .neq('id', productData.id)
            .limit(4);
            
          setRelatedProducts(relatedData || []);

          // Check session for recently viewed & wishlist
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Track recently viewed
            await supabase.from('recently_viewed').upsert({
              user_id: session.user.id,
              product_id: productData.id,
              viewed_at: new Date().toISOString()
            }, { onConflict: 'user_id,product_id' });

            // Check wishlist
            const { data: wishlistData } = await supabase
              .from('wishlists')
              .select('id')
              .eq('user_id', session.user.id)
              .eq('product_id', productData.id)
              .single();
              
            if (wishlistData) setInWishlist(true);
          } else {
            const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
            setInWishlist(guestWishlist.includes(productData.id));
          }
        }
      } catch (err) {
        // console.warn('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const handleBuyNow = () => {
    if (product && product.stock > 0) {
      navigate('/checkout', {
        state: {
          buyNowItem: {
            id: 'buy-now',
            product,
            quantity,
            selected_size: selectedSize,
            selected_color: selectedColor
          }
        }
      });
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity, selectedSize, selectedColor);
      alert('Added to cart!');
    }
  };

  const handleToggleWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      let guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      if (inWishlist) {
        guestWishlist = guestWishlist.filter((id: string) => id !== product.id);
        setInWishlist(false);
      } else {
        guestWishlist.push(product.id);
        setInWishlist(true);
      }
      localStorage.setItem('guest_wishlist', JSON.stringify(guestWishlist));
      return;
    }

    if (!product) return;

    try {
      if (inWishlist) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', product.id);
        setInWishlist(false);
      } else {
        await supabase
          .from('wishlists')
          .insert([{ user_id: session.user.id, product_id: product.id }]);
        setInWishlist(true);
      }
    } catch (err) {
      console.warn('Error updating wishlist:', err);
    }
  };

  if (loading) return <div className="p-24 text-center">Loading product...</div>;
  if (!product) return <div className="p-24 text-center">Product not found.</div>;

  return (
    <div className="bg-[#F5F2ED] min-h-screen py-12">
      <Helmet>
        <title>{product.name} | Premium Streetwear Bangladesh</title>
        <meta name="description" content={`Buy ${product.name} at Edakpion, the best premium streetwear brand in Bangladesh. Quality urban fashion.`} />
        
      </Helmet>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-500 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 mb-20">
          {/* Images */}
          <div className="md:w-1/2 flex gap-4">
            <div className="flex flex-col gap-4 w-20">
              {product.images?.map((img, i) => (
                <div key={i} className="w-20 h-24 bg-white border border-[#E8E4DE] rounded-xl overflow-hidden cursor-pointer hover:border-[#0F3D2E]">
                  <img loading="lazy" decoding="async" src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex-1 bg-white border border-[#E8E4DE] rounded-[32px] overflow-hidden h-[600px]">
              {product.images?.[0] && (
                <SeoImage src={product.images[0]} title={product.name} className="w-full h-full object-cover" />
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-[#0F3D2E]">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-serif text-gray-900">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-sm mb-3">COLOR: <span className="text-gray-500 font-normal">{selectedColor}</span></h4>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        selectedColor === color 
                        ? 'border-[#0F3D2E] bg-[#0F3D2E] text-white' 
                        : 'border-[#E8E4DE] bg-white hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h4 className="font-bold text-sm mb-3 flex justify-between">
                  <span>SIZE: <span className="text-gray-500 font-normal">{selectedSize}</span></span>
                  <button className="text-gray-500 font-normal underline">Size Guide</button>
                </h4>
                <div className="flex gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                        selectedSize === size 
                        ? 'border-[#0F3D2E] bg-[#0F3D2E] text-white' 
                        : 'border-[#E8E4DE] bg-white hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border border-[#E8E4DE] rounded-full bg-white px-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-500 hover:text-black">-</button>
                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-500 hover:text-black">+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-[#0F3D2E] text-white rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors disabled:opacity-50"
              >
                {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 bg-[#E8E4DE] text-[#0F3D2E] rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#d5cfc5] transition-colors disabled:opacity-50"
              >
                BUY NOW
              </button>
              
              <button 
                onClick={handleToggleWishlist}
                className={`w-12 h-12 flex items-center justify-center rounded-full border border-[#E8E4DE] bg-white transition-colors ${
                  inWishlist ? 'text-red-500 border-red-200' : 'text-[#0F3D2E] hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-[#E8E4DE]">
               <div className="flex items-center gap-3">
                  <div className="bg-white border border-[#E8E4DE] p-2 rounded-full"><Truck className="w-4 h-4 text-[#0F3D2E]" /></div>
                  <span className="text-sm font-medium">Free shipping on orders over ৳5000</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-white border border-[#E8E4DE] p-2 rounded-full"><RefreshCcw className="w-4 h-4 text-[#0F3D2E]" /></div>
                  <span className="text-sm font-medium">7 Days Return Policy</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-white border border-[#E8E4DE] p-2 rounded-full"><Shield className="w-4 h-4 text-[#0F3D2E]" /></div>
                  <span className="text-sm font-medium">100% Original Product</span>
               </div>
            </div>

          </div>
        </div>

        
        {/* Product Details Tabs */}
        <div className="mt-20 mb-20 bg-white rounded-3xl p-8 border border-[#E8E4DE]">
          <div className="flex flex-wrap gap-8 border-b border-[#E8E4DE] mb-8">
            {['description', 'specifications', 'reviews', 'shipping', 'return policy', 'faq'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-bold text-sm tracking-widest uppercase transition-colors ${activeTab === tab ? 'text-[#0F3D2E] border-b-2 border-[#0F3D2E]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="prose max-w-none text-gray-600 leading-relaxed min-h-[200px]">
            {activeTab === 'description' && (
              <div className="animate-in fade-in duration-500">
                <p>{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {product.tags.map((f, i) => <li key={i} className="flex gap-2"><span className="text-[#0F3D2E]">✓</span>{f}</li>)}
                  </ul>
                )}
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="animate-in fade-in duration-500">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Brand</td><td className="py-3">EDAKPION</td></tr>
                    
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Category</td><td className="py-3">{product.categories?.name || 'Uncategorized'}</td></tr>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Material</td><td className="py-3">Premium Quality</td></tr>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Country of Origin</td><td className="py-3">Bangladesh</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-4xl font-bold">4.8</div>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Based on 124 reviews</span>
                  </div>
                </div>
                <p>Customer reviews will appear here.</p>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <p><strong>Estimated Delivery:</strong> 3-5 Business Days (Inside Dhaka), 5-7 Business Days (Outside Dhaka)</p>
                <p><strong>Delivery Charge:</strong> ৳60 (Inside Dhaka), ৳120 (Outside Dhaka)</p>
                <p><strong>Cash on Delivery:</strong> Available for all locations.</p>
              </div>
            )}
            {activeTab === 'return policy' && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <p>We offer a hassle-free 7-day return policy. If you are not completely satisfied with your purchase, you can return it within 7 days of delivery.</p>
                <p>Items must be unused, in original packaging, and with all tags attached.</p>
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div>
                  <strong className="block mb-1">Is this product authentic?</strong>
                  <p className="text-sm">Yes, all products on EDAKPION are 100% authentic and sourced directly from manufacturers or authorized distributors.</p>
                </div>
                <div>
                  <strong className="block mb-1">How do I track my order?</strong>
                  <p className="text-sm">Once your order is shipped, you will receive a tracking link via email and SMS.</p>
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Product Reviews */}
        <ProductReviews 
          productId={product.id} 
          productName={product.name} 
          productImage={product.images?.[0]} 
          productDescription={product.description}
          productPrice={product.price}
          productSlug={product.slug}
          productStock={product.stock}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif mb-8 text-[#0F3D2E]">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

