import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-28 lg:pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 border-b border-gray-800 pb-16">
          
          <div className="lg:col-span-5 pr-0 lg:pr-12">
            <h2 className="text-3xl font-bold tracking-widest text-white mb-6 uppercase">EDAKPION</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
              Defining modern minimalism through premium fabrics, precise tailoring, and timeless silhouettes. Crafted for those who appreciate understated luxury.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[var(--color-brand-cream)] hover:border-[var(--color-brand-cream)] hover:text-[var(--color-brand-dark)] transition-all duration-300"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[var(--color-brand-cream)] hover:border-[var(--color-brand-cream)] hover:text-[var(--color-brand-dark)] transition-all duration-300"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[var(--color-brand-cream)] hover:border-[var(--color-brand-cream)] hover:text-[var(--color-brand-dark)] transition-all duration-300"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[var(--color-brand-cream)] hover:border-[var(--color-brand-cream)] hover:text-[var(--color-brand-dark)] transition-all duration-300"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-xs tracking-widest mb-6 text-white uppercase relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-gray-600 transition-all group-hover:after:w-full">Collections</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link to="/shop?category=new" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">New Arrivals</Link></li>
                <li><Link to="/shop?category=bestsellers" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Best Sellers</Link></li>
                <li><Link to="/shop?category=men" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Men's Edit</Link></li>
                <li><Link to="/shop?category=women" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Women's Edit</Link></li>
                <li><Link to="/shop?category=premium" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Premium Collection</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xs tracking-widest mb-6 text-white uppercase relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-gray-600">Assistance</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link to="/contact" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">FAQ & Support</Link></li>
                <li><Link to="/policy" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Shipping & Returns</Link></li>
                <li><Link to="/policy" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Track Order</Link></li>
                <li><Link to="/policy" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Size Guide</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-xs tracking-widest mb-6 text-white uppercase relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-gray-600">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link to="/policy" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Privacy Policy</Link></li>
                <li><Link to="/policy" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Terms of Service</Link></li>
                <li><Link to="/policy" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">Cookie Policy</Link></li>
                <li><Link to="/about" className="hover:text-[var(--color-brand-cream)] hover:translate-x-1 inline-block transition-all duration-300">About the Brand</Link></li>
              </ul>
            </div>
          </div>

        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium gap-6">
          <p className="text-center md:text-left">© {new Date().getFullYear()} EDAKPION. Designed with precision.</p>
          <div className="flex flex-wrap justify-center gap-3">
             <div className="px-3 py-1.5 bg-gray-800 rounded text-[10px] font-bold tracking-wider text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-default">VISA</div>
             <div className="px-3 py-1.5 bg-gray-800 rounded text-[10px] font-bold tracking-wider text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-default">MASTERCARD</div>
             <div className="px-3 py-1.5 bg-gray-800 rounded text-[10px] font-bold tracking-wider text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-default">AMEX</div>
             <div className="px-3 py-1.5 bg-gray-800 rounded text-[10px] font-bold tracking-wider text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-default">COD</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
