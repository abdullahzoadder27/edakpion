/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-[#0F3D2E]" />
  </div>
);

import Layout from './components/layout/Layout';
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
import UserLayout from './components/layout/UserLayout';
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const UserOrders = lazy(() => import('./pages/user/UserOrders'));
const UserOrderDetails = lazy(() => import('./pages/user/UserOrderDetails'));
const UserWishlist = lazy(() => import('./pages/user/UserWishlist'));
const UserAddresses = lazy(() => import('./pages/user/UserAddresses'));
const UserReviews = lazy(() => import('./pages/user/UserReviews'));
const UserCoupons = lazy(() => import('./pages/user/UserCoupons'));
const UserNotifications = lazy(() => import('./pages/user/UserNotifications'));
const UserSupport = lazy(() => import('./pages/user/UserSupport'));
const UserSupportTicket = lazy(() => import('./pages/user/UserSupportTicket'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const UserSecurity = lazy(() => import('./pages/user/UserSecurity'));
const UserRecentlyViewed = lazy(() => import('./pages/user/UserRecentlyViewed'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const About = lazy(() => import('./pages/info/About'));
const OurStory = lazy(() => import('./pages/info/OurStory'));
const Contact = lazy(() => import('./pages/info/Contact'));
const Faqs = lazy(() => import('./pages/info/Faqs'));
const Shipping = lazy(() => import('./pages/info/Shipping'));
const Returns = lazy(() => import('./pages/info/Returns'));
const SizeGuide = lazy(() => import('./pages/info/SizeGuide'));
import AdminLayout from './components/layout/AdminLayout';
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductsManage = lazy(() => import('./pages/admin/ProductsManage'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const CategoriesManage = lazy(() => import('./pages/admin/CategoriesManage'));
const OrdersManage = lazy(() => import('./pages/admin/OrdersManage'));
const OrderDetailAdmin = lazy(() => import('./pages/admin/OrderDetailAdmin'));
const UsersManage = lazy(() => import('./pages/admin/UsersManage'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const AdminBlogForm = lazy(() => import('./pages/admin/AdminBlogForm'));
const CouponsManage = lazy(() => import('./pages/admin/CouponsManage'));
const ReviewsManage = lazy(() => import('./pages/admin/ReviewsManage'));
const SubscribersManage = lazy(() => import('./pages/admin/SubscribersManage'));
const TestimonialsManage = lazy(() => import('./pages/admin/TestimonialsManage'));
const ContentManage = lazy(() => import('./pages/admin/ContentManage'));
const SupportManage = lazy(() => import('./pages/admin/SupportManage'));
const SupportTicketAdmin = lazy(() => import('./pages/admin/SupportTicketAdmin'));
const NotificationsManage = lazy(() => import('./pages/admin/NotificationsManage'));
const DeliveryZonesManage = lazy(() => import('./pages/admin/DeliveryZonesManage'));
const SettingsManage = lazy(() => import('./pages/admin/SettingsManage'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:id" element={<OrderSuccess />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="update-password" element={<UpdatePassword />} />
          <Route path="about" element={<About />} />
          <Route path="our-story" element={<OurStory />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="returns" element={<Returns />} />
          <Route path="size-guide" element={<SizeGuide />} />
          <Route path="account" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="orders/:id" element={<UserOrderDetails />} />
            <Route path="wishlist" element={<UserWishlist />} />
            <Route path="addresses" element={<UserAddresses />} />
            <Route path="reviews" element={<UserReviews />} />
            <Route path="coupons" element={<UserCoupons />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="support" element={<UserSupport />} />
            <Route path="support/:id" element={<UserSupportTicket />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="security" element={<UserSecurity />} />
            <Route path="recently-viewed" element={<UserRecentlyViewed />} />
          </Route>
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsManage />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<CategoriesManage />} />
          <Route path="orders" element={<OrdersManage />} />
          <Route path="orders/:id" element={<OrderDetailAdmin />} />
          <Route path="users" element={<UsersManage />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="blogs/new" element={<AdminBlogForm />} />
          <Route path="blogs/:id/edit" element={<AdminBlogForm />} />
          <Route path="coupons" element={<CouponsManage />} />
          <Route path="reviews" element={<ReviewsManage />} />
          <Route path="subscribers" element={<SubscribersManage />} />
          <Route path="testimonials" element={<TestimonialsManage />} />
          <Route path="content" element={<ContentManage />} />
          <Route path="support" element={<SupportManage />} />
          <Route path="support/:id" element={<SupportTicketAdmin />} />
          <Route path="notifications" element={<NotificationsManage />} />
<Route path="delivery-zones" element={<DeliveryZonesManage />} />
          <Route path="settings" element={<SettingsManage />} />
        </Route>
      </Routes>
          </Suspense>
    </BrowserRouter>
  );
}
