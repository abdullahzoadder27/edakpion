import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThumbsUp, Truck, RefreshCcw, ShieldCheck, DollarSign, Clock, HelpCircle, Star } from 'lucide-react';
import { getProducts, getPublishedBlogs } from '../lib/api';
import { Product, Blog } from '../types';
import ProductCard from '../components/ui/ProductCard';
import BlogCard from '../components/ui/BlogCard';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [activeTab, setActiveTab] = useState('New Arrival');
  const tabs = ['New Arrival', 'Best Seller', 'Trending', 'Premium'];
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [email, setEmail] = useState('');

  
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.warn);
    getPublishedBlogs(3).then(setBlogs).catch(console.warn);
    
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('store_settings').select('value').eq('key', 'homepage_cms').single();
        if (data && data.value) setContent(data.value);
      } catch (err) {
        console.warn('Error fetching homepage CMS:', err);
      }
    };
    fetchSettings();
  }, []);


  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('subscribers').insert([{ email }]);
      if (error) {
        if (error.code === '23505') alert('You are already subscribed!');
        else throw error;
      } else {
        alert('Subscribed successfully!');
        setEmail('');
      }
    } catch (err) {
      console.warn('Subscription error:', err);
    }
  };

  return (
    <div className="bg-[#F5F2ED] pb-16">
      <Helmet>
        <title>EDAKPION | Streetwear Bangladesh - Premium Fashion Store</title>
        <meta name="description" content="Defining the new standard of Streetwear in Bangladesh. EDAKPION focuses on heavyweight silhouettes, premium essentials, and the art of the oversized fit. More than just a clothing brand—this is your urban uniform." />
      </Helmet>
      {/* Hero Section */}
      <div className="px-6 pt-6">
        <div className="w-full h-[600px] bg-[#0F3D2E] rounded-[32px] relative overflow-hidden flex flex-col md:flex-row items-center max-w-7xl mx-auto">
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center text-white z-10">
            <span className="text-[12px] font-bold tracking-[0.3em] uppercase opacity-70 mb-2">Premium Fashion Store</span>
            <h1 className="text-5xl md:text-7xl font-serif leading-[0.9] mb-4">Streetwear<br/>Bangladesh</h1>
            <p className="text-sm opacity-80 mb-8 max-w-sm font-light">
              Defining the new standard of Streetwear in Bangladesh. EDAKPION focuses on heavyweight silhouettes, premium essentials, and the art of the oversized fit. More than just a clothing brand—this is your urban uniform.
            </p>
            <Link to="/shop" className="w-max px-10 py-4 bg-white text-[#0F3D2E] font-bold text-xs tracking-widest uppercase rounded-full hover:bg-[#F5F2ED] transition-colors">
              SHOP NOW
            </Link>
          </div>
          
          <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-[#154636]">
            <div className="w-full h-full flex items-end justify-center relative">
               <div className="w-[80%] h-[90%] bg-[#215a48] rounded-t-full opacity-40 animate-pulse"></div>
               <div className="absolute bottom-0 right-10 w-[300px] h-[400px] bg-[#0F3D2E] border-x-8 border-t-8 border-white/10 rounded-t-[100px] flex items-center justify-center overflow-hidden">
                  <img fetchPriority="high" src="https://images.unsplash.com/photo-1516826957135-700ede19c6ce?q=80&w=1200&auto=format&fit=crop" alt="Model" className="h-full w-full object-cover" />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Feature Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20 mt-8 mb-16 px-6">
          <div className="bg-white p-6 rounded-3xl flex items-center space-x-4 border border-[#E8E4DE]">
            <div className="w-10 h-10 bg-[#F5F2ED] rounded-full flex items-center justify-center text-[#0F3D2E]">
               <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">PREMIUM QUALITY</h4>
              <p className="text-[11px] text-gray-500">Finest Bangladeshi Fabric</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl flex items-center space-x-4 border border-[#E8E4DE]">
            <div className="w-10 h-10 bg-[#F5F2ED] rounded-full flex items-center justify-center text-[#0F3D2E]">
               <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">FAST DELIVERY</h4>
              <p className="text-[11px] text-gray-500">Across all 64 districts</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl flex items-center space-x-4 border border-[#E8E4DE]">
            <div className="w-10 h-10 bg-[#F5F2ED] rounded-full flex items-center justify-center text-[#0F3D2E]">
               <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">EASY RETURNS</h4>
              <p className="text-[11px] text-gray-500">7 Days stress-free return</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Products */}
        <div className="px-6 mb-16">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex space-x-8 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm pb-1 whitespace-nowrap ${
                    activeTab === tab
                      ? 'font-bold border-b-2 border-[#0F3D2E] text-[#0F3D2E]'
                      : 'font-medium text-gray-400 hover:text-gray-600 transition-colors'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link to="/shop" className="text-xs font-bold underline uppercase tracking-tighter text-[#0F3D2E] whitespace-nowrap ml-4">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Collection Banner */}
        <div className="px-6 mb-16">
          <div className="bg-[#B2B8A3] rounded-[32px] overflow-hidden flex flex-col md:flex-row items-center min-h-[300px]">
            <div className="p-8 md:p-16 md:w-1/2 flex flex-col justify-center text-[#0F3D2E]">
              <p className="text-xs font-bold tracking-widest mb-2 opacity-80 uppercase">NEW COLLECTION</p>
              <h2 className="text-4xl md:text-5xl font-serif mb-6">SUMMER '25</h2>
              <Link to="/shop?collection=summer" className="bg-[#0F3D2E] text-white px-8 py-3 rounded-full font-bold w-max hover:bg-[#154636] transition-colors text-xs tracking-widest uppercase">
                SHOP NOW
              </Link>
            </div>
            <div className="md:w-1/2 h-64 md:h-[400px] w-full">
              <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1473&auto=format&fit=crop" alt="Summer Collection" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="px-6 mb-16">
          <h2 className="text-2xl font-serif text-center mb-8 text-[#0F3D2E]">WHY CHOOSE OUR STREETWEAR BRAND</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F3D2E] text-white p-6 rounded-[24px] flex flex-col items-start gap-4">
               <div className="bg-white rounded-full p-2"><ShieldCheck className="w-5 h-5 text-[#0F3D2E]" /></div>
               <h3 className="font-bold text-sm tracking-wider">PREMIUM QUALITY</h3>
               <p className="text-xs text-gray-300 font-light">We use the best materials for best comfort.</p>
            </div>
            <div className="bg-[#0F3D2E] text-white p-6 rounded-[24px] flex flex-col items-start gap-4 relative overflow-hidden">
               <div className="bg-white rounded-full p-2 relative z-10"><DollarSign className="w-5 h-5 text-[#0F3D2E]" /></div>
               <h3 className="font-bold text-sm tracking-wider relative z-10">AFFORDABLE PRICE</h3>
               <p className="text-xs text-gray-300 font-light relative z-10">Best quality at the most affordable price.</p>
               <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#154636] rounded-tl-full opacity-50"></div>
            </div>
            <div className="bg-[#0F3D2E] text-white p-6 rounded-[24px] flex flex-col items-start gap-4">
               <div className="bg-white rounded-full p-2"><Clock className="w-5 h-5 text-[#0F3D2E]" /></div>
               <h3 className="font-bold text-sm tracking-wider">FAST SHIPPING</h3>
               <p className="text-xs text-gray-300 font-light">Get your order at your doorstep quickly.</p>
            </div>
            <div className="bg-[#0F3D2E] text-white p-6 rounded-[24px] flex flex-col items-start gap-4">
               <div className="bg-white rounded-full p-2"><HelpCircle className="w-5 h-5 text-[#0F3D2E]" /></div>
               <h3 className="font-bold text-sm tracking-wider">CUSTOMER SUPPORT</h3>
               <p className="text-xs text-gray-300 font-light">We are always here to help you.</p>
            </div>
          </div>
        </div>

        {/* Blog Section */}
        <div className="px-6 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-[#0F3D2E]">LATEST FROM BLOG</h2>
            <Link to="/blog" className="text-xs font-bold underline uppercase tracking-tighter text-[#0F3D2E]">
              View All
            </Link>
          </div>
          
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Loading blogs...
            </div>
          )}
        </div>

        {/* Subscribe Section */}
        <div className="px-6 mb-8">
          <div className="bg-white border border-[#E8E4DE] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
             <div className="md:w-1/2 relative z-10 mb-8 md:mb-0">
               <h2 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-2 leading-tight">SUBSCRIBE<br/>& GET 10% OFF</h2>
               <p className="text-gray-500 mb-8 text-sm font-light">On Your First Order</p>
               
               <form onSubmit={handleSubscribe} className="flex w-full max-w-md bg-[#F5F2ED] rounded-full p-1 border border-[#E8E4DE]">
                 <input 
                   type="email" 
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   placeholder="Your Email Address" 
                   className="flex-1 px-4 py-3 outline-none rounded-l-full text-sm bg-transparent"
                   required
                 />
                 <button 
                   type="submit" 
                   className="bg-[#0F3D2E] text-white px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors"
                 >
                   SUBSCRIBE
                 </button>
               </form>
             </div>
             
             <div className="md:w-1/2 flex justify-end">
                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop" alt="App Preview" className="w-64 h-auto rounded-3xl shadow-lg mix-blend-multiply border-4 border-white" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
