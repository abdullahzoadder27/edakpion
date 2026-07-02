import React, { useState, useEffect } from 'react';
import { Menu, Search, Heart, ShoppingBag, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function Header() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Dynamic Data States
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logo, setLogo] = useState('EDAKPION');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState([
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/collections' },
    { name: 'Fashion Journal', path: '/fashion-journal' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ]);

  const location = useLocation();
  const isHome = location.pathname === '/';

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Dynamic Data Fetching
  useEffect(() => {
    async function fetchDynamicData() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        // Fetch User specific data
        if (user) {
          // Profile Image
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          if (profile?.avatar_url) setProfileImage(profile.avatar_url);

          // Wishlist Count
          const { count: wCount } = await supabase
            .from('wishlists')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (wCount !== null) setWishlistCount(wCount);

          // Cart Count
          const { count: cCount } = await supabase
            .from('carts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (cCount !== null) setCartCount(cCount);
        }

        // Fetch Global Settings (Logo)
        const { data: settings } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['logo_text', 'logo_url'])
          .limit(2);
        
        if (settings) {
          const logoSetting = settings.find(s => s.key === 'logo_text');
          if (logoSetting?.value) setLogo(logoSetting.value);
        }

        // Fetch Menu Items
        const { data: menus } = await supabase
          .from('menu_items')
          .select('name, path, order_index')
          .order('order_index', { ascending: true });
        
        if (menus && menus.length >= 6) {
          // Ensure we only take the primary 6 as requested
          setNavLinks(menus.slice(0, 6));
        }
      } catch (err) {
        // Silently fallback to defaults if tables don't exist
        console.debug('Dynamic fetch fallback triggered', err);
      }
    }
    fetchDynamicData();
  }, [user]);

  const isActive = (path: string) => {
    if (path.includes('?')) return location.pathname + location.search === path;
    return location.pathname === path;
  };

  const headerBgClass = (isHome && !isScrolled) 
    ? 'bg-[var(--color-brand-dark)] md:bg-transparent py-3 md:py-4 text-white md:text-gray-900 shadow-none' 
    : 'bg-[var(--color-brand-dark)] shadow-md py-3 md:py-4 text-white';

  return (
    <>
      {/* Spacer for inner pages so content doesn't jump under the fixed header */}
      {(!isHome) && <div className="h-[56px] md:h-[64px]"></div>}
      {/* Spacer for mobile home page since header is solid */}
      {(isHome) && <div className="h-[56px] md:hidden"></div>}

      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Left: Mobile Menu Toggle & Desktop Logo space */}
          <div className="flex items-center gap-6 flex-1 md:flex-none">
            <button 
              className="p-1 transition-colors md:hidden text-white hover:text-gray-300"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="hidden md:block text-2xl font-bold tracking-widest uppercase">
              {logo}
            </Link>
          </div>
          
          {/* Mobile Center Logo */}
          <Link to="/" className="md:hidden text-lg sm:text-xl font-bold tracking-widest absolute left-1/2 -translate-x-1/2 uppercase truncate w-[60%] text-center">
            {logo}
          </Link>

          {/* Desktop Center Menu */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`transition-all duration-300 uppercase text-[11px] lg:text-xs tracking-widest font-bold ${
                  isActive(link.path) 
                    ? (isHome && !isScrolled ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-white border-b-2 border-white pb-1') 
                    : (isHome && !isScrolled ? 'text-gray-600 hover:text-gray-900 hover:-translate-y-0.5' : 'text-gray-300 hover:text-white hover:-translate-y-0.5')
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side: Icons */}
          <div className="flex items-center justify-end gap-4 sm:gap-6 flex-1 md:flex-none">
            <Link to="/shop" className={`hidden sm:block p-1 transition-all duration-300 ${isHome && !isScrolled ? 'text-gray-900 hover:text-gray-600 hover:-translate-y-0.5' : 'text-white hover:text-gray-300 hover:-translate-y-0.5'}`}>
              <Search className="w-5 h-5" />
            </Link>
            
            <Link to="/wishlist" className={`hidden sm:block p-1 transition-all duration-300 relative ${isHome && !isScrolled ? 'text-gray-900 hover:text-gray-600 hover:-translate-y-0.5' : 'text-white hover:text-gray-300 hover:-translate-y-0.5'}`}>
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </Link>
            
            <div className="relative hidden sm:block">
              {user ? (
                <div 
                  className={`p-1 cursor-pointer transition-all duration-300 ${isHome && !isScrolled ? 'text-gray-900 hover:text-gray-600 hover:-translate-y-0.5' : 'text-white hover:text-gray-300 hover:-translate-y-0.5'}`}
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <Link to="/profile">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-white" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Link>
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 premium-card py-2 z-50 overflow-hidden">
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">My Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50">Wishlist</Link>
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">Settings</Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className={`p-1 transition-all duration-300 ${isHome && !isScrolled ? 'text-gray-900 hover:text-gray-600 hover:-translate-y-0.5' : 'text-white hover:text-gray-300 hover:-translate-y-0.5'}`}>
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>

            <Link to="/cart" className={`p-1 transition-all duration-300 relative ${isHome && !isScrolled ? 'text-white md:text-gray-900 hover:text-gray-300 md:hover:text-gray-600 hover:-translate-y-0.5' : 'text-white hover:text-gray-300 hover:-translate-y-0.5'}`}>
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[var(--color-brand-dark)] text-[10px] font-bold rounded-full flex items-center justify-center border border-gray-200">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div 
        className={`fixed top-0 left-0 w-[80%] max-w-sm h-full bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.1)] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[var(--color-brand-dark)] text-white">
          <span className="text-xl font-bold tracking-widest uppercase">{logo}</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 hover:text-gray-300 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto py-6 px-6">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path}
                className={`text-lg font-medium tracking-wide transition-colors flex items-center justify-between ${
                  isActive(link.path) ? 'text-[var(--color-brand-dark)] font-bold' : 'text-gray-600 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-100 p-6 bg-gray-50 flex flex-col gap-4">
          <Link to="/wishlist" className="flex items-center justify-between text-gray-700 hover:text-[var(--color-brand-dark)] font-medium">
            <span className="flex items-center gap-3"><Heart className="w-5 h-5" /> Wishlist</span>
            {wishlistCount > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="flex items-center justify-between text-gray-700 hover:text-[var(--color-brand-dark)] font-medium">
            <span className="flex items-center gap-3"><ShoppingBag className="w-5 h-5" /> Cart</span>
            {cartCount > 0 && <span className="bg-[var(--color-brand-dark)] text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
          </Link>
          
          <div className="w-full h-px bg-gray-200 my-2"></div>
          
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-3 text-[var(--color-brand-dark)] font-bold">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-[var(--color-brand-dark)]" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                My Profile
              </Link>
              <Link to="/orders" className="flex items-center gap-3 text-gray-700 hover:text-[var(--color-brand-dark)] font-medium">
                My Orders
              </Link>
              <Link to="/profile" className="flex items-center gap-3 text-gray-700 hover:text-[var(--color-brand-dark)] font-medium">
                Settings
              </Link>
              <button onClick={signOut} className="text-left text-red-600 font-medium mt-2 flex items-center gap-3">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-3 text-[var(--color-brand-dark)] font-bold">
              <User className="w-5 h-5" /> Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

