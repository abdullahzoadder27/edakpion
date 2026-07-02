import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Package, Heart, ShoppingCart, MapPin, Bell, 
  Ticket, Clock, MessageSquare, Settings, LogOut, 
  Menu, X, User, ChevronRight
} from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { useAuth } from '../../contexts/AuthContext';

export function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/profile', icon: Home },
    { name: 'My Profile', path: '/profile/edit', icon: User },
    { name: 'My Orders', path: '/orders', icon: Package },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Shopping Cart', path: '/cart', icon: ShoppingCart },
    { name: 'Saved Addresses', path: '/profile/addresses', icon: MapPin },
    { name: 'Notifications', path: '/profile/notifications', icon: Bell },
    { name: 'Coupons', path: '/profile/coupons', icon: Ticket },
    { name: 'Recently Viewed', path: '/profile/recently-viewed', icon: Clock },
    { name: 'Support', path: '/profile/support', icon: MessageSquare },
    { name: 'Settings', path: '/profile/settings', icon: Settings },
  ];

  const bottomNavItems = [
    { name: 'Dashboard', path: '/profile', icon: Home },
    { name: 'Orders', path: '/orders', icon: Package },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Menu', action: () => setMobileMenuOpen(true), icon: Menu },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans antialiased text-gray-900 selection:bg-[var(--color-brand-dark)] selection:text-white">
      <Header />
      
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-[15px] leading-tight text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">My Account</p>
            </div>
         </div>
      </div>

      <main className="flex-grow w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 xl:px-12 pb-24 md:pb-12 flex gap-8 lg:gap-12 relative items-start">
        
        {/* Desktop Sidebar (280px wide as requested) */}
        <aside className="hidden md:block w-[280px] shrink-0 sticky top-24">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-6 xl:p-8 overflow-hidden transition-all duration-300">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-bold text-lg text-gray-900 truncate w-full px-2">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Premium Member</p>
            </div>
            
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/profile' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-250 ease-out relative overflow-hidden ${
                      isActive 
                        ? 'bg-[var(--color-brand-dark)] text-white shadow-md shadow-brand-dark/20' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'} group-hover:scale-110`} />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 mt-2 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-250 ease-out group"
                >
                  <LogOut className="w-5 h-5 shrink-0 text-red-400 group-hover:text-red-600 transition-colors" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Only render Footer once */}
      <Footer />

      {/* Mobile Bottom Navigation - For quick access */}
      <div 
        className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 z-[90] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" 
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-[68px] px-2">
          {bottomNavItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return item.path ? (
              <Link 
                key={idx} 
                to={item.path} 
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors duration-200 ${isActive ? 'text-[var(--color-brand-dark)]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-gray-100' : ''}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase">{item.name}</span>
              </Link>
            ) : (
              <button 
                key={idx} 
                onClick={item.action} 
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors duration-200 ${mobileMenuOpen ? 'text-[var(--color-brand-dark)]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${mobileMenuOpen ? 'bg-gray-100' : ''}`}>
                  <item.icon className="w-5 h-5 stroke-[2px]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase">{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[110] overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="p-6 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <h2 className="font-bold text-lg">Menu</h2>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-2 -mr-2 bg-gray-50 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 flex-1">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/profile' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-4 rounded-xl text-[15px] font-medium transition-colors ${
                          isActive 
                            ? 'bg-[var(--color-brand-dark)] text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          {item.name}
                        </div>
                        {!isActive && <ChevronRight className="w-4 h-4 text-gray-300" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 mt-auto">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border border-gray-200 rounded-xl text-[15px] font-bold text-red-600 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
