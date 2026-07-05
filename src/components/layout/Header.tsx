import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import SearchModal from './SearchModal';
import CartIconWithCount from './CartIconWithCount';
import WishlistIconWithCount from './WishlistIconWithCount';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E8E4DE] h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="text-[#1A1A1A] hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav className="hidden lg:flex space-x-6 text-[11px] font-semibold tracking-widest uppercase text-[#555]">
              <Link to="/shop" className="hover:text-[#0F3D2E]">Shop</Link>
              <Link to="/collections" className="hover:text-[#0F3D2E]">Collections</Link>
              <Link to="/about" className="hover:text-[#0F3D2E]">About</Link>
              <Link to="/blog" className="hover:text-[#0F3D2E]">Blog</Link>
            </nav>
          </div>
          
          <Link to="/" className="text-2xl font-serif font-black tracking-tighter text-[#0F3D2E] absolute left-1/2 -translate-x-1/2">
            EDAKPION
          </Link>
          
          <div className="flex items-center space-x-5">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-[#1A1A1A] hover:opacity-70 transition-opacity hidden sm:block"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link 
              to={isLoggedIn ? (isAdmin ? "/admin" : "/account") : "/login"} 
              className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
            >
              <User className="w-5 h-5" />
            </Link>
            <WishlistIconWithCount />
            <CartIconWithCount />
          </div>
        </div>
      </header>

      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
