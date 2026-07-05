import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  // Store settings could be fetched here, using static/fallback for now
  const socialLinks = {
    facebook_url: '#',
    instagram_url: '#',
    tiktok_url: '#',
    youtube_url: '#'
  };

  return (
    <footer className="bg-[#1C1C1C] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="w-48 h-32 bg-[#0F3D2E] rounded-xl overflow-hidden mb-6 flex items-center justify-center text-[#F5F2ED] font-serif text-2xl tracking-widest">
               EDAKPION
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider">SHOP</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?tag=new-arrival" className="hover:text-white transition-colors">New Arrival</Link></li>
              <li><Link to="/shop?tag=best-seller" className="hover:text-white transition-colors">Best Seller</Link></li>
              <li><Link to="/shop?tag=discounted" className="hover:text-white transition-colors">Discounts</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider">COMPANY</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider">HELP</h4>
            <ul className="space-y-3 text-sm text-gray-400 mb-8">
              <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
            </ul>
            
            <h4 className="font-bold mb-4 text-sm tracking-wider">FOLLOW US</h4>
            <div className="flex gap-4">
              <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 border border-gray-600 rounded-full hover:bg-white hover:text-black transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 border border-gray-600 rounded-full hover:bg-white hover:text-black transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href={socialLinks.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-2 border border-gray-600 rounded-full hover:bg-white hover:text-black transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.34 2.88 2.88 0 0 1 2.31-4.53 2.66 2.66 0 0 1 1.04.2v-3.24a5.45 5.45 0 0 0-1.1-.12 6.14 6.14 0 0 0-6.15 6.14 6.14 6.14 0 0 0 6.15 6.14 6.14 6.14 0 0 0 6.14-6.14V8.14a8.1 8.1 0 0 0 4.03 1.07V5.88a5.1 5.1 0 0 1-4.04-1.63z"/></svg>
              </a>
              <a href={socialLinks.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 border border-gray-600 rounded-full hover:bg-white hover:text-black transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2025 EDAKPION. All Rights Reserved.</p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-white rounded text-black font-bold">VISA</span>
            <span className="px-2 py-1 bg-white rounded text-black font-bold">Mastercard</span>
            <span className="px-2 py-1 bg-[#E2136E] rounded text-white font-bold">bKash</span>
            <span className="px-2 py-1 bg-[#F58220] rounded text-white font-bold">Nagad</span>
            <span className="px-2 py-1 bg-[#2C2E83] rounded text-white font-bold">SSLCommerz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
