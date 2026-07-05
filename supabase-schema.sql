-- Create extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    address TEXT,
    division TEXT,
    district TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_categories_modtime ON categories;
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    compare_at_price NUMERIC,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[],
    stock INTEGER DEFAULT 0,
    sizes TEXT[],
    colors TEXT[],
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Carts
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_size TEXT,
    selected_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id, selected_size, selected_color)
);
DROP TRIGGER IF EXISTS update_carts_modtime ON carts;
CREATE TRIGGER update_carts_modtime BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    phone TEXT,
    email TEXT,
    division TEXT,
    district TEXT,
    address TEXT,
    notes TEXT,
    subtotal NUMERIC,
    delivery_charge NUMERIC,
    discount NUMERIC DEFAULT 0,
    total NUMERIC,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    status TEXT DEFAULT 'pending',
    coupon_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_orders_modtime ON orders;
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT,
    price NUMERIC,
    quantity INTEGER,
    selected_size TEXT,
    selected_color TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT,
    receiver_name TEXT,
    phone TEXT,
    alternative_phone TEXT,
    division TEXT,
    district TEXT,
    area TEXT,
    postal_code TEXT,
    full_address TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_addresses_modtime ON addresses;
CREATE TRIGGER update_addresses_modtime BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Blogs
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    category TEXT,
    tags TEXT[],
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name TEXT,
    status TEXT DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    seo_title TEXT,
    seo_description TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_blogs_modtime ON blogs;
CREATE TRIGGER update_blogs_modtime BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    message TEXT,
    rating INTEGER,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_testimonials_modtime ON testimonials;
CREATE TRIGGER update_testimonials_modtime BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Site Content
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    button_text TEXT,
    button_link TEXT,
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_site_content_modtime ON site_content;
CREATE TRIGGER update_site_content_modtime BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT,
    value NUMERIC,
    minimum_order_amount NUMERIC DEFAULT 0,
    maximum_discount_amount NUMERIC,
    usage_limit INTEGER,
    per_user_usage_limit INTEGER,
    first_order_only BOOLEAN DEFAULT FALSE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_coupons_modtime ON coupons;
CREATE TRIGGER update_coupons_modtime BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Coupon Usages
CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_image_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_reviews_modtime ON reviews;
CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    related_id UUID,
    related_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_support_tickets_modtime ON support_tickets;
CREATE TRIGGER update_support_tickets_modtime BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. Support Messages
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    sender_role TEXT,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Recently Viewed
CREATE TABLE IF NOT EXISTS recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 20. Store Settings
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_store_settings_modtime ON store_settings;
CREATE TRIGGER update_store_settings_modtime BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 21. Account Deletion Requests
CREATE TABLE IF NOT EXISTS account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Admin Activity Logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to create order with items, reduce stock, clear cart, and create notification
CREATE OR REPLACE FUNCTION create_order_with_items(
  order_data JSON,
  order_items_data JSON
)
RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  item JSON;
BEGIN
  -- Insert the order
  INSERT INTO orders (
    user_id,
    customer_name,
    phone,
    email,
    division,
    district,
    address,
    notes,
    subtotal,
    delivery_charge,
    discount,
    total,
    payment_method,
    coupon_code
  ) VALUES (
    (order_data->>'user_id')::UUID,
    order_data->>'customer_name',
    order_data->>'phone',
    order_data->>'email',
    order_data->>'division',
    order_data->>'district',
    order_data->>'address',
    order_data->>'notes',
    COALESCE((order_data->>'subtotal')::NUMERIC, 0),
    COALESCE((order_data->>'delivery_charge')::NUMERIC, 0),
    COALESCE((order_data->>'discount')::NUMERIC, 0),
    COALESCE((order_data->>'total')::NUMERIC, 0),
    order_data->>'payment_method',
    order_data->>'coupon_code'
  ) RETURNING id INTO new_order_id;

  -- Insert the items and update stock
  FOR item IN SELECT * FROM json_array_elements(order_items_data)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      price,
      quantity,
      selected_size,
      selected_color,
      image_url
    ) VALUES (
      new_order_id,
      (item->>'product_id')::UUID,
      item->>'product_name',
      COALESCE((item->>'price')::NUMERIC, 0),
      COALESCE((item->>'quantity')::INTEGER, 1),
      item->>'selected_size',
      item->>'selected_color',
      item->>'image_url'
    );

    -- Reduce stock
    UPDATE products
    SET stock = stock - COALESCE((item->>'quantity')::INTEGER, 1)
    WHERE id = (item->>'product_id')::UUID;
  END LOOP;

  -- Clear cart
  IF order_data->>'user_id' IS NOT NULL THEN
    DELETE FROM carts WHERE user_id = (order_data->>'user_id')::UUID;
  END IF;

  -- Create notification
  IF order_data->>'user_id' IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      related_type
    ) VALUES (
      (order_data->>'user_id')::UUID,
      'Order Placed successfully',
      'Your order has been placed successfully.',
      'order',
      new_order_id,
      'orders'
    );
  END IF;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function and Trigger to restore stock on order cancellation
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id
    LOOP
      UPDATE products
      SET stock = stock + item.quantity
      WHERE id = item.product_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;
CREATE TRIGGER trigger_restore_stock_on_cancel
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_cancel();


-- Missing Indexes added for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
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
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
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
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
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
CREATE POLICY "Users can insert own coupon usages" ON coupon_usages FOR INSERT WITH CHECK (auth.uid() = user_id);
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
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('category-images', 'category-images', true),
('blog-images', 'blog-images', true),
('avatars', 'avatars', true),
('review-images', 'review-images', true),
('testimonial-images', 'testimonial-images', true),
('site-content', 'site-content', true),
('support-attachments', 'support-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Public website images
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Public read category images" ON storage.objects;
CREATE POLICY "Public read category images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
DROP POLICY IF EXISTS "Public read avatar images" ON storage.objects;
CREATE POLICY "Public read avatar images" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Public read review images" ON storage.objects;
CREATE POLICY "Public read review images" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
DROP POLICY IF EXISTS "Public read testimonial images" ON storage.objects;
CREATE POLICY "Public read testimonial images" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-images');
DROP POLICY IF EXISTS "Public read site content" ON storage.objects;
CREATE POLICY "Public read site content" ON storage.objects FOR SELECT USING (bucket_id = 'site-content');

-- Admin can manage all
DROP POLICY IF EXISTS "Admin can manage all objects" ON storage.objects;
CREATE POLICY "Admin can manage all objects" ON storage.objects FOR ALL USING (public.is_admin());

-- Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Users can upload review images
DROP POLICY IF EXISTS "Users can upload review images" ON storage.objects;
CREATE POLICY "Users can upload review images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update own review images" ON storage.objects;
CREATE POLICY "Users can update own review images" ON storage.objects FOR UPDATE USING (bucket_id = 'review-images' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can delete own review images" ON storage.objects;
CREATE POLICY "Users can delete own review images" ON storage.objects FOR DELETE USING (bucket_id = 'review-images' AND owner = auth.uid());

-- Users can upload support attachments
DROP POLICY IF EXISTS "Users can read own support attachments" ON storage.objects;
CREATE POLICY "Users can read own support attachments" ON storage.objects FOR SELECT USING (bucket_id = 'support-attachments' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can upload support attachments" ON storage.objects;
CREATE POLICY "Users can upload support attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'support-attachments' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update own support attachments" ON storage.objects;
CREATE POLICY "Users can update own support attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'support-attachments' AND owner = auth.uid());
DROP POLICY IF EXISTS "Users can delete own support attachments" ON storage.objects;
CREATE POLICY "Users can delete own support attachments" ON storage.objects FOR DELETE USING (bucket_id = 'support-attachments' AND owner = auth.uid());
-- 4. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert contact message" ON contact_messages;
CREATE POLICY "Anyone can insert contact message" ON contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can manage contact messages" ON contact_messages;
CREATE POLICY "Admin can manage contact messages" ON contact_messages FOR ALL USING (is_admin());

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for roles" ON public.roles;
CREATE POLICY "Public read access for roles" ON public.roles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin full access roles" ON public.roles;
CREATE POLICY "Admin full access roles" ON public.roles FOR ALL USING (is_admin());

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read own record" ON public.admins;
CREATE POLICY "Admin read own record" ON public.admins FOR SELECT USING (auth.uid() = auth_user_id);
DROP POLICY IF EXISTS "Admin full access admins" ON public.admins;
CREATE POLICY "Admin full access admins" ON public.admins FOR ALL USING (is_admin());

-- Insert default roles
INSERT INTO public.roles (role_name, description, permissions)
VALUES 
  ('Super Admin', 'Full access to all systems', '{"all": true}'::jsonb),
  ('Admin', 'Standard administrative access', '{"all": false}'::jsonb),
  ('Manager', 'Management access', '{"all": false}'::jsonb),
  ('Inventory Manager', 'Manage products and stock', '{"all": false}'::jsonb),
  ('Order Manager', 'Manage customer orders', '{"all": false}'::jsonb),
  ('Content Editor', 'Manage blogs and site content', '{"all": false}'::jsonb),
  ('Customer Support', 'Manage support tickets', '{"all": false}'::jsonb)
ON CONFLICT (role_name) DO NOTHING;


-- Update is_admin function to also check the new admins table
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

