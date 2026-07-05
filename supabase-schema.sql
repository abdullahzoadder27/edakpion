-- Supabase Database Schema for EDAKPION eCommerce

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  selected_size TEXT,
  selected_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  division TEXT,
  district TEXT,
  address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  selected_size TEXT,
  selected_color TEXT,
  image_url TEXT
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'percentage' or 'fixed'
  value NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES --
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public read access for products, categories, testimonials, site_content
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for active testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for site_content" ON site_content FOR SELECT USING (true);

-- User profile access
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cart & Wishlist access (Users only)
CREATE POLICY "Users can manage own cart" ON carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- Orders access
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL); -- Allow guest checkout if needed
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL))
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (true);

-- Subscribers
CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

-- Create a helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Full Access Policies (Add these to all tables)
CREATE POLICY "Admin full access products" ON products FOR ALL USING (is_admin());
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (is_admin());
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL USING (is_admin());
CREATE POLICY "Admin full access subscribers" ON subscribers FOR ALL USING (is_admin());
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL USING (is_admin());
CREATE POLICY "Admin full access site_content" ON site_content FOR ALL USING (is_admin());
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (is_admin());

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  status TEXT DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES FOR BLOGS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Public read access for published blogs
CREATE POLICY "Public read access for published blogs" ON blogs FOR SELECT USING (status = 'published');

-- Admin full access blogs
CREATE POLICY "Admin full access blogs" ON blogs FOR ALL USING (is_admin());

-- SEED DATA FOR BLOGS
INSERT INTO blogs (title, slug, excerpt, content, cover_image_url, category, tags, author_name, status, published_at)
VALUES 
  ('How to Style Oversized T-Shirts in 2025', 'how-to-style-oversized-t-shirts-2025', 'Discover simple and modern ways to style oversized t-shirts for everyday comfort and premium streetwear looks.', '# How to Style Oversized T-Shirts in 2025\n\nOversized t-shirts have become a staple in modern streetwear. Here are some tips to style them:\n\n1. **Proportions are Key:** Pair a baggy top with slightly fitted bottoms like straight-leg jeans or tailored shorts.\n2. **Tuck it in:** A french tuck can add shape to your silhouette.\n3. **Layering:** Wear a long-sleeve under your oversized tee for a 90s skater vibe.\n\nExperiment with different textures and colors to make the look your own.', 'https://images.unsplash.com/photo-1529391409740-59f2cea08bc6?q=80&w=1200&auto=format&fit=crop', 'Fashion Tips', ARRAY['style', 'oversized', 'streetwear'], 'Admin', 'published', NOW()),
  
  ('Why Fabric Quality Matters in Premium Clothing', 'why-fabric-quality-matters', 'Learn how premium fabric improves comfort, durability, and the overall feel of your outfit.', '# Why Fabric Quality Matters in Premium Clothing\n\nWhen investing in clothing, the fabric is arguably the most important factor.\n\n* **Comfort:** High-quality cotton or linen feels softer against the skin and breathes better.\n* **Durability:** Premium fabrics resist pilling, tearing, and fading, ensuring your garments last longer.\n* **Drape:** Better fabrics fall naturally, enhancing the fit and look of the clothing.\n\nAlways check the label and opt for natural fibers when possible.', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop', 'Clothing Guide', ARRAY['fabric', 'quality', 'guide'], 'Admin', 'published', NOW()),
  
  ('Summer ’25 Collection: What’s Trending', 'summer-25-collection-whats-trending', 'Explore the latest colors, fits, and outfit ideas from our Summer ’25 collection.', '# Summer ’25 Collection: What’s Trending\n\nThis summer, we are focusing on effortless style and ultimate comfort.\n\n### Key Trends:\n- **Earthy Tones:** Olive greens, warm beiges, and muted terracottas.\n- **Relaxed Fits:** Continuing the oversized trend, focusing on breathability.\n- **Sustainable Materials:** Organic cotton and recycled fabrics are taking center stage.\n\nStay tuned for our upcoming drops!', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop', 'New Collection', ARRAY['summer', 'trends', 'collection'], 'Admin', 'published', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create Storage Bucket for Blog Images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND is_admin());
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND is_admin());
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND is_admin());

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  subject TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_role TEXT,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recently_viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create account_deletion_requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon_usages table
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR NEW TABLES

-- Addresses
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin full access addresses" ON addresses FOR ALL USING (is_admin());

-- Reviews
CREATE POLICY "Users can manage own pending reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL USING (is_admin());

-- Notifications
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin full access notifications" ON notifications FOR ALL USING (is_admin());

-- Support Tickets
CREATE POLICY "Users can manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin full access support_tickets" ON support_tickets FOR ALL USING (is_admin());

-- Support Messages
CREATE POLICY "Users can manage own messages" ON support_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_id AND support_tickets.user_id = auth.uid())
);
CREATE POLICY "Admin full access support_messages" ON support_messages FOR ALL USING (is_admin());

-- Recently Viewed
CREATE POLICY "Users can manage own recently viewed" ON recently_viewed FOR ALL USING (auth.uid() = user_id);

-- Account Deletion Requests
CREATE POLICY "Users can manage own deletion requests" ON account_deletion_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin full access account_deletion_requests" ON account_deletion_requests FOR ALL USING (is_admin());

-- Coupon Usages
CREATE POLICY "Users can read own coupon usages" ON coupon_usages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access coupon_usages" ON coupon_usages FOR ALL USING (is_admin());

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', true) ON CONFLICT (id) DO NOTHING;

-- Avatars Policies
CREATE POLICY "Public access avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users insert avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Review Images Policies
CREATE POLICY "Public access review-images" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
CREATE POLICY "Users insert review-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

-- Support Attachments Policies
CREATE POLICY "Users access own support-attachments" ON storage.objects FOR SELECT USING (bucket_id = 'support-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Users insert support-attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'support-attachments' AND auth.role() = 'authenticated');
