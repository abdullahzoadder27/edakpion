-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admin can manage profiles" ON profiles;
CREATE POLICY "Admin can manage profiles" ON profiles FOR ALL USING (is_admin());

-- Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (is_active = true OR is_admin());
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
CREATE POLICY "Admin can manage categories" ON categories FOR ALL USING (is_admin());

-- Products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true OR is_admin());
DROP POLICY IF EXISTS "Admin can manage products" ON products;
CREATE POLICY "Admin can manage products" ON products FOR ALL USING (is_admin());

-- Carts
DROP POLICY IF EXISTS "Users can view own cart" ON carts;
CREATE POLICY "Users can view own cart" ON carts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own cart" ON carts;
CREATE POLICY "Users can insert own cart" ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own cart" ON carts;
CREATE POLICY "Users can update own cart" ON carts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own cart" ON carts;
CREATE POLICY "Users can delete own cart" ON carts FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin can view all carts" ON carts;
CREATE POLICY "Admin can view all carts" ON carts FOR SELECT USING (is_admin());

-- Wishlists
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlists;
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own wishlist" ON wishlists;
CREATE POLICY "Users can insert own wishlist" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlists;
CREATE POLICY "Users can delete own wishlist" ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL));
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin can manage all orders" ON orders;
CREATE POLICY "Admin can manage all orders" ON orders FOR ALL USING (is_admin());

-- Order Items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid() OR (auth.uid() IS NULL AND user_id IS NULL))
);
DROP POLICY IF EXISTS "Admin can manage all order items" ON order_items;
CREATE POLICY "Admin can manage all order items" ON order_items FOR ALL USING (is_admin());

-- Addresses
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Blogs
DROP POLICY IF EXISTS "Blogs are viewable by everyone" ON blogs;
CREATE POLICY "Blogs are viewable by everyone" ON blogs FOR SELECT USING (status = 'published' OR is_admin());
DROP POLICY IF EXISTS "Admin can manage blogs" ON blogs;
CREATE POLICY "Admin can manage blogs" ON blogs FOR ALL USING (is_admin());

-- Subscribers
DROP POLICY IF EXISTS "Anyone can insert subscriber" ON subscribers;
CREATE POLICY "Anyone can insert subscriber" ON subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can manage subscribers" ON subscribers;
CREATE POLICY "Admin can manage subscribers" ON subscribers FOR ALL USING (is_admin());

-- Testimonials
DROP POLICY IF EXISTS "Testimonials viewable by everyone" ON testimonials;
CREATE POLICY "Testimonials viewable by everyone" ON testimonials FOR SELECT USING (is_active = true OR is_admin());
DROP POLICY IF EXISTS "Admin can manage testimonials" ON testimonials;
CREATE POLICY "Admin can manage testimonials" ON testimonials FOR ALL USING (is_admin());

-- Site Content
DROP POLICY IF EXISTS "Site content viewable by everyone" ON site_content;
CREATE POLICY "Site content viewable by everyone" ON site_content FOR SELECT USING (is_active = true OR is_admin());
DROP POLICY IF EXISTS "Admin can manage site content" ON site_content;
CREATE POLICY "Admin can manage site content" ON site_content FOR ALL USING (is_admin());

-- Coupons
DROP POLICY IF EXISTS "Coupons viewable by everyone" ON coupons;
CREATE POLICY "Coupons viewable by everyone" ON coupons FOR SELECT USING (is_active = true OR is_admin());
DROP POLICY IF EXISTS "Admin can manage coupons" ON coupons;
CREATE POLICY "Admin can manage coupons" ON coupons FOR ALL USING (is_admin());

-- Coupon Usages
DROP POLICY IF EXISTS "Users can view own coupon usages" ON coupon_usages;
CREATE POLICY "Users can view own coupon usages" ON coupon_usages FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own coupon usages" ON coupon_usages;
CREATE POLICY "Users can insert own coupon usages" ON coupon_usages FOR INSERT WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL));
DROP POLICY IF EXISTS "Admin can manage coupon usages" ON coupon_usages;
CREATE POLICY "Admin can manage coupon usages" ON coupon_usages FOR ALL USING (is_admin());

-- Reviews
DROP POLICY IF EXISTS "Approved reviews viewable by everyone" ON reviews;
CREATE POLICY "Approved reviews viewable by everyone" ON reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Users can insert own review" ON reviews;
CREATE POLICY "Users can insert own review" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own pending review" ON reviews;
CREATE POLICY "Users can update own pending review" ON reviews FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
DROP POLICY IF EXISTS "Users can delete own review" ON reviews;
CREATE POLICY "Users can delete own review" ON reviews FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin can manage reviews" ON reviews;
CREATE POLICY "Admin can manage reviews" ON reviews FOR ALL USING (is_admin());

-- Notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin can view all notifications" ON notifications;
CREATE POLICY "Admin can view all notifications" ON notifications FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admin can insert notifications" ON notifications;
CREATE POLICY "Admin can insert notifications" ON notifications FOR INSERT WITH CHECK (is_admin());

-- Support Tickets
DROP POLICY IF EXISTS "Users can manage own tickets" ON support_tickets;
CREATE POLICY "Users can manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin can manage tickets" ON support_tickets;
CREATE POLICY "Admin can manage tickets" ON support_tickets FOR ALL USING (is_admin());

-- Support Messages
DROP POLICY IF EXISTS "Users can view own ticket messages" ON support_messages;
CREATE POLICY "Users can view own ticket messages" ON support_messages FOR SELECT USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid()) OR is_admin()
);
DROP POLICY IF EXISTS "Users can insert own ticket messages" ON support_messages;
CREATE POLICY "Users can insert own ticket messages" ON support_messages FOR INSERT WITH CHECK (
    (ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid()) AND sender_id = auth.uid()) OR is_admin()
);
DROP POLICY IF EXISTS "Admin can manage ticket messages" ON support_messages;
CREATE POLICY "Admin can manage ticket messages" ON support_messages FOR ALL USING (is_admin());

-- Recently Viewed
DROP POLICY IF EXISTS "Users can manage own recently viewed" ON recently_viewed;
CREATE POLICY "Users can manage own recently viewed" ON recently_viewed FOR ALL USING (auth.uid() = user_id);

-- Store Settings
DROP POLICY IF EXISTS "Settings viewable by everyone" ON store_settings;
CREATE POLICY "Settings viewable by everyone" ON store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage settings" ON store_settings;
CREATE POLICY "Admin can manage settings" ON store_settings FOR ALL USING (is_admin());

-- Account Deletion Requests
DROP POLICY IF EXISTS "Users can manage own deletion requests" ON account_deletion_requests;
CREATE POLICY "Users can manage own deletion requests" ON account_deletion_requests FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin can manage deletion requests" ON account_deletion_requests;
CREATE POLICY "Admin can manage deletion requests" ON account_deletion_requests FOR ALL USING (is_admin());

-- Admin Activity Logs
DROP POLICY IF EXISTS "Admin can manage activity logs" ON admin_activity_logs;
CREATE POLICY "Admin can manage activity logs" ON admin_activity_logs FOR ALL USING (is_admin());
