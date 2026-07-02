/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SuperAdminRoute } from './components/SuperAdminRoute';
import { PageTransition } from './components/PageTransition';

import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { ProfileEdit } from './pages/dashboard/ProfileEdit';
import { Addresses } from './pages/dashboard/Addresses';
import { Notifications } from './pages/dashboard/Notifications';
import { Coupons } from './pages/dashboard/Coupons';
import { RecentlyViewed } from './pages/dashboard/RecentlyViewed';
import { Support } from './pages/dashboard/Support';
import { Settings } from './pages/dashboard/Settings';
import { Checkout } from './pages/Checkout';
import { ProductDetails } from './pages/ProductDetails';
import { Wishlist } from './pages/Wishlist';
import { Orders } from './pages/Orders';
import { Collections } from './pages/Collections';
import { FashionJournal } from './pages/FashionJournal';
import { FashionArticle } from './pages/FashionArticle';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout, AdminDashboard, AdminPlaceholder } from './pages/admin/AdminDashboard';
import { AdminMediaLibrary } from './pages/admin/AdminMediaLibrary';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { UserDashboardLayout } from './components/dashboard/UserDashboardLayout';
import { Home as HomeIcon, Grid3X3, Heart, ShoppingBag, User } from 'lucide-react';
import { Link } from 'react-router-dom';

function MobileBottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  
  if (pathname.startsWith('/edakpion-control-panel') || pathname.startsWith('/profile') || pathname.startsWith('/product')) return null;

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-[100]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${pathname === '/' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
          <HomeIcon className={`w-[22px] h-[22px] ${pathname === '/' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Home</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${pathname === '/shop' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
          <Grid3X3 className={`w-[22px] h-[22px] ${pathname === '/shop' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Shop</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${pathname === '/cart' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
          <ShoppingBag className={`w-[22px] h-[22px] ${pathname === '/cart' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Cart</span>
        </Link>
        <Link to="/wishlist" className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${pathname === '/wishlist' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
          <Heart className={`w-[22px] h-[22px] ${pathname === '/wishlist' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Wishlist</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${pathname.startsWith('/profile') || pathname === '/login' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
          <User className={`w-[22px] h-[22px] ${pathname.startsWith('/profile') || pathname === '/login' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Account</span>
        </Link>
      </div>
    </div>
  );
}

import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminDelivery } from './pages/admin/AdminDelivery';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
        <Route path="/collections" element={<PageTransition><Collections /></PageTransition>} />
        <Route path="/fashion-journal" element={<PageTransition><FashionJournal /></PageTransition>} />
        <Route path="/fashion-journal/:slug" element={<PageTransition><FashionArticle /></PageTransition>} />
        <Route path="/about" element={<PageTransition><div className="p-20 text-center">About Page Placeholder</div></PageTransition>} />
        <Route path="/contact" element={<PageTransition><div className="p-20 text-center">Contact Page Placeholder</div></PageTransition>} />
        <Route path="/faq" element={<PageTransition><div className="p-20 text-center">FAQ Page Placeholder</div></PageTransition>} />
        <Route path="/policy" element={<PageTransition><div className="p-20 text-center">Policy Page Placeholder</div></PageTransition>} />
        
        {/* Protected Routes (Dashboard) */}
        <Route path="/profile" element={<ProtectedRoute><PageTransition><DashboardOverview /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><PageTransition><ProfileEdit /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/addresses" element={<ProtectedRoute><PageTransition><Addresses /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/notifications" element={<ProtectedRoute><PageTransition><Notifications /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/coupons" element={<ProtectedRoute><PageTransition><Coupons /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/recently-viewed" element={<ProtectedRoute><PageTransition><RecentlyViewed /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/support" element={<ProtectedRoute><PageTransition><Support /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
        
        <Route path="/checkout" element={<ProtectedRoute><PageTransition><Checkout /></PageTransition></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><PageTransition><Wishlist /></PageTransition></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><PageTransition><Orders /></PageTransition></ProtectedRoute>} />

        {/* Super Admin Hidden Routes */}
        <Route path="/edakpion-control-panel" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route 
          path="/edakpion-control-panel/*" 
          element={
            <SuperAdminRoute>
              <PageTransition>
                <AdminLayout />
              </PageTransition>
            </SuperAdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="media" element={<AdminMediaLibrary />} />
          <Route path="cms" element={<AdminPlaceholder title="Homepage CMS" />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="coupons" element={<AdminPlaceholder title="Coupons" />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminPlaceholder title="Settings" />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
        <MobileBottomNav />
      </BrowserRouter>
    </AuthProvider>
  );
}
