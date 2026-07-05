/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserLayout from './components/layout/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserOrders from './pages/user/UserOrders';
import UserOrderDetails from './pages/user/UserOrderDetails';
import UserWishlist from './pages/user/UserWishlist';
import UserAddresses from './pages/user/UserAddresses';
import UserReviews from './pages/user/UserReviews';
import UserCoupons from './pages/user/UserCoupons';
import UserNotifications from './pages/user/UserNotifications';
import UserSupport from './pages/user/UserSupport';
import UserSupportTicket from './pages/user/UserSupportTicket';
import UserProfile from './pages/user/UserProfile';
import UserSecurity from './pages/user/UserSecurity';
import UserRecentlyViewed from './pages/user/UserRecentlyViewed';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import About from './pages/info/About';
import OurStory from './pages/info/OurStory';
import Contact from './pages/info/Contact';
import Faqs from './pages/info/Faqs';
import Shipping from './pages/info/Shipping';
import Returns from './pages/info/Returns';
import SizeGuide from './pages/info/SizeGuide';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsManage from './pages/admin/ProductsManage';
import AdminProductForm from './pages/admin/AdminProductForm';
import CategoriesManage from './pages/admin/CategoriesManage';
import OrdersManage from './pages/admin/OrdersManage';
import OrderDetailAdmin from './pages/admin/OrderDetailAdmin';
import UsersManage from './pages/admin/UsersManage';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminBlogForm from './pages/admin/AdminBlogForm';
import CouponsManage from './pages/admin/CouponsManage';
import ReviewsManage from './pages/admin/ReviewsManage';
import SubscribersManage from './pages/admin/SubscribersManage';
import TestimonialsManage from './pages/admin/TestimonialsManage';
import ContentManage from './pages/admin/ContentManage';
import SupportManage from './pages/admin/SupportManage';
import SupportTicketAdmin from './pages/admin/SupportTicketAdmin';
import NotificationsManage from './pages/admin/NotificationsManage';
import SettingsManage from './pages/admin/SettingsManage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:id" element={<OrderSuccess />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
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
          <Route path="settings" element={<SettingsManage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
