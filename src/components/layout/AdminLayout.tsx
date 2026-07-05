import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Ticket, 
  Star, Mail, MessageSquare, LayoutTemplate, HelpCircle, Bell, 
  Settings, LogOut, Menu, X, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { isLoading, isAdmin, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  if (!isAdmin) return null;

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Categories', path: '/admin/categories', icon: <LayoutTemplate className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Blogs', path: '/admin/blogs', icon: <FileText className="w-5 h-5" /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <Star className="w-5 h-5" /> },
    { name: 'Subscribers', path: '/admin/subscribers', icon: <Mail className="w-5 h-5" /> },
    { name: 'Testimonials', path: '/admin/testimonials', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Homepage Content', path: '/admin/content', icon: <LayoutTemplate className="w-5 h-5" /> },
    { name: 'Support Tickets', path: '/admin/support', icon: <HelpCircle className="w-5 h-5" /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-[#F5F2ED]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-[#E8E4DE] flex flex-col shrink-0 z-30 transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-[#E8E4DE] flex items-center justify-between">
          <div>
            <Link to="/admin" className="text-xl font-bold tracking-widest text-[#0F3D2E]">
              EDAKPION
            </Link>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Admin Panel</p>
          </div>
          <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link 
                key={item.path}
                to={item.path} 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive ? 'bg-[#0F3D2E] text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#E8E4DE] space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium w-full">
            <ExternalLink className="w-5 h-5" /> View Website
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 w-full text-left transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E8E4DE] h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#0F3D2E] hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/products/new" className="hidden sm:flex items-center gap-2 bg-[#0F3D2E] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#154636] transition-colors">
              Quick Add Product
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-[#E8E4DE]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#0F3D2E]">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{profile?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center font-bold overflow-hidden border-2 border-white shadow-sm">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (profile?.full_name?.charAt(0) || 'A').toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
