import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  Star, 
  Ticket, 
  Bell, 
  HelpCircle, 
  Clock, 
  User, 
  Shield, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function UserLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isLoading, isLoggedIn, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate]);

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/account', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { name: 'My Orders', path: '/account/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Wishlist', path: '/account/wishlist', icon: <Heart className="w-5 h-5" /> },
    { name: 'Cart', path: '/account/cart', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Addresses', path: '/account/addresses', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Reviews', path: '/account/reviews', icon: <Star className="w-5 h-5" /> },
    { name: 'Coupons', path: '/account/coupons', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Notifications', path: '/account/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Support', path: '/account/support', icon: <HelpCircle className="w-5 h-5" /> },
    { name: 'Recently Viewed', path: '/account/recently-viewed', icon: <Clock className="w-5 h-5" /> },
    { name: 'Profile', path: '/account/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Security', path: '/account/security', icon: <Shield className="w-5 h-5" /> },
  ];

  if (isLoading) return <div className="min-h-screen bg-[#F5F2ED] pt-24 pb-12 flex items-center justify-center">Loading...</div>;
  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#F5F2ED] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-[24px] border border-[#E8E4DE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center font-bold overflow-hidden">
              {profile?.avatar_url ? (
                <img loading="lazy" decoding="async" src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <p className="font-serif text-[#0F3D2E] text-sm truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#0F3D2E]">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className={`lg:w-72 shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-[32px] border border-[#E8E4DE] p-6 sticky top-24">
              <div className="hidden lg:flex items-center gap-4 mb-8 pb-6 border-b border-[#E8E4DE]">
                <div className="w-12 h-12 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                  {profile?.avatar_url ? (
                    <img loading="lazy" decoding="async" src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-[#0F3D2E] leading-tight truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.exact 
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                        isActive 
                          ? 'bg-[#0F3D2E] text-white' 
                          : 'text-gray-600 hover:bg-[#F5F2ED] hover:text-[#0F3D2E]'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-red-600 hover:bg-red-50 mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet context={{ profile, user }} />
          </main>
        </div>
      </div>
    </div>
  );
}
