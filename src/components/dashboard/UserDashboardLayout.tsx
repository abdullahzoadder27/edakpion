import React, { useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, User, Package, Heart, ShoppingCart, 
  MapPin, Bell, Ticket, Clock, MessageSquare, 
  Settings, LogOut, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut();
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/profile', icon: Home },
    { name: 'My Profile', path: '/profile/edit', icon: User },
    { name: 'My Orders', path: '/orders', icon: Package },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Shopping Cart', path: '/cart', icon: ShoppingCart },
    { name: 'Saved Addresses', path: '/profile/addresses', icon: MapPin },
    { name: 'Notifications', path: '/profile/notifications', icon: Bell },
    { name: 'Coupons', path: '/profile/coupons', icon: Ticket },
    { name: 'Recently Viewed', path: '/profile/recently-viewed', icon: Clock },
    { name: 'Support Center', path: '/profile/support', icon: MessageSquare },
    { name: 'Settings & Security', path: '/profile/settings', icon: Settings },
  ];

  const bottomNavItems = [
    { name: 'Dashboard', path: '/profile', icon: Home },
    { name: 'Orders', path: '/orders', icon: Package },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Cart', path: '/cart', icon: ShoppingCart },
    { name: 'Menu', action: () => setMobileMenuOpen(true), icon: Menu },
  ];

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow flex w-full max-w-7xl mx-auto py-8 px-4 md:px-8 gap-8 relative pb-24 md:pb-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="sticky top-8 premium-card p-6 overflow-hidden">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Welcome back</p>
                <p className="font-bold text-gray-900 truncate max-w-[150px]">{user?.email?.split('@')[0] || 'User'}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Mobile Header for Dashboard (if needed, otherwise bottom nav suffices) */}
          <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-gray-500 font-medium">My Account</p>
                </div>
             </div>
             <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100">
               <Menu className="w-5 h-5" />
             </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-[100]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map((item, idx) => (
            item.path ? (
              <Link key={idx} to={item.path} className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${location.pathname === item.path ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
                <item.icon className={`w-[22px] h-[22px] ${location.pathname === item.path ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className="text-[9px] font-bold tracking-wider uppercase">{item.name}</span>
              </Link>
            ) : (
              <button key={idx} onClick={item.action} className="flex flex-col items-center justify-center w-full h-full gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                <item.icon className="w-[22px] h-[22px] stroke-[2px]" />
                <span className="text-[9px] font-bold tracking-wider uppercase">{item.name}</span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Mobile Slide-out Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-50 overflow-y-auto"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <h2 className="font-bold tracking-widest uppercase">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-gray-50 text-gray-900 font-bold' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full mt-4 flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-red-400" />
                    Logout
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
