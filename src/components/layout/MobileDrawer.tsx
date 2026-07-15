import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, ChevronRight, UserCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { user, profile, role, isLoggedIn, isAdmin, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={onClose}
        className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
          isActive ? 'bg-[#0F3D2E] text-white' : 'text-[#1A1A1A] hover:bg-gray-100'
        }`}
      >
        <span className="font-medium">{children}</span>
        {isActive && <ChevronRight className="w-4 h-4" />}
      </Link>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[360px] bg-[#F5F2ED] z-[70] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-[#E8E4DE] bg-white">
              <Link to="/" onClick={onClose} className="text-xl font-serif font-black tracking-tighter text-[#0F3D2E]">
                EDAKPION
              </Link>
              <button 
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-[#1A1A1A]" />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
              
              {/* User Profile Summary */}
              {isLoggedIn ? (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E8E4DE] flex items-center gap-4">
                  {profile?.avatar_url ? (
                    <img loading="lazy" decoding="async" src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-[#0F3D2E] text-white rounded-full flex items-center justify-center text-xl font-bold">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || <UserCircle className="w-6 h-6" />}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-[#0F3D2E] truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <span className="bg-[#0F3D2E]/10 text-[#0F3D2E] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E8E4DE] text-center">
                  <h3 className="font-serif font-bold text-[#0F3D2E] mb-2">Welcome to EDAKPION</h3>
                  <p className="text-sm text-gray-500 mb-4">Sign in to access your wishlist, orders, and more.</p>
                  <div className="flex gap-2">
                    <Link to="/login" onClick={onClose} className="flex-1 bg-[#0F3D2E] text-white py-2 rounded font-bold text-xs uppercase tracking-widest text-center hover:bg-[#154636]">
                      Login
                    </Link>
                    <Link to="/signup" onClick={onClose} className="flex-1 border border-[#0F3D2E] text-[#0F3D2E] py-2 rounded font-bold text-xs uppercase tracking-widest text-center hover:bg-gray-50">
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}

              {/* Main Links */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">Shop</h4>
                <nav className="space-y-1">
                  <NavLink to="/">Home</NavLink>
                  <NavLink to="/shop">Shop</NavLink>
                  <NavLink to="/shop?tag=new-arrival">New Arrival</NavLink>
                  <NavLink to="/shop?tag=best-seller">Best Seller</NavLink>
                  <NavLink to="/shop?tag=trending">Trending</NavLink>
                  <NavLink to="/shop?tag=premium">Premium</NavLink>
                  <NavLink to="/shop?tag=discounted">Discounted</NavLink>
                  <NavLink to="/collections">Collections</NavLink>
                </nav>
              </div>

              {/* Account Links */}
              {isLoggedIn && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">My Account</h4>
                  <nav className="space-y-1">
                    <NavLink to="/account">My Account</NavLink>
                    <NavLink to="/account/orders">My Orders</NavLink>
                    <NavLink to="/account/wishlist">Wishlist</NavLink>
                    <NavLink to="/account/cart">Cart</NavLink>
                    <NavLink to="/account/addresses">Addresses</NavLink>
                    <NavLink to="/account/reviews">Reviews</NavLink>
                    <NavLink to="/account/coupons">Coupons</NavLink>
                    <NavLink to="/account/notifications">Notifications</NavLink>
                    <NavLink to="/account/support">Support</NavLink>
                    <NavLink to="/account/profile">Profile</NavLink>
                    <NavLink to="/account/security">Security</NavLink>
                  </nav>
                </div>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <div>
                  <h4 className="text-xs font-bold text-[#0F3D2E] uppercase tracking-widest mb-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Admin Panel
                  </h4>
                  <nav className="space-y-1 bg-white/50 p-2 rounded-xl border border-red-100">
                    <NavLink to="/admin">Admin Dashboard</NavLink>
                    <NavLink to="/admin/products">Products Management</NavLink>
                    <NavLink to="/admin/categories">Categories Management</NavLink>
                    <NavLink to="/admin/orders">Orders Management</NavLink>
                    <NavLink to="/admin/users">Users Management</NavLink>
                    <NavLink to="/admin/blogs">Blog Management</NavLink>
                    <NavLink to="/admin/coupons">Coupons / Discounts</NavLink>
                    <NavLink to="/admin/subscribers">Subscribers</NavLink>
                    <NavLink to="/admin/testimonials">Testimonials</NavLink>
                    <NavLink to="/admin/content">Content Management</NavLink>
                    <NavLink to="/admin/settings">Settings</NavLink>
                  </nav>
                </div>
              )}

              {/* Company Links */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">Company</h4>
                <nav className="space-y-1">
                  <NavLink to="/blog">Blog</NavLink>
                  <NavLink to="/about">About Us</NavLink>
                  <NavLink to="/contact">Contact</NavLink>
                </nav>
              </div>
              
              {/* Help Links */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">Help</h4>
                <nav className="space-y-1">
                  <NavLink to="/faqs">FAQs</NavLink>
                  <NavLink to="/shipping">Shipping</NavLink>
                  <NavLink to="/returns">Return Policy</NavLink>
                  <NavLink to="/size-guide">Size Guide</NavLink>
                </nav>
              </div>
            </div>

            {/* Footer */}
            {isLoggedIn && (
              <div className="p-4 border-t border-[#E8E4DE] bg-white">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-red-600 font-bold hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
