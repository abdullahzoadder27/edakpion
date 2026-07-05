-- Categories Seed
INSERT INTO categories (id, name, slug, description, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'T-Shirts', 't-shirts', 'Comfortable and stylish t-shirts.', true),
('22222222-2222-2222-2222-222222222222', 'Shirts', 'shirts', 'Casual and formal shirts.', true),
('33333333-3333-3333-3333-333333333333', 'Jackets', 'jackets', 'Warm and trendy jackets.', true),
('44444444-4444-4444-4444-444444444444', 'Vests', 'vests', 'Functional and stylish vests.', true),
('55555555-5555-5555-5555-555555555555', 'Windbreakers', 'windbreakers', 'Lightweight windbreakers.', true)
ON CONFLICT (id) DO NOTHING;

-- Products Seed
INSERT INTO products (name, slug, description, price, compare_at_price, category_id, images, stock, sizes, colors, tags, is_active) VALUES
('Oversized T-Shirt', 'oversized-t-shirt', 'A comfortable oversized t-shirt made from 100% cotton.', 790.00, 990.00, '11111111-1111-1111-1111-111111111111', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 50, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Olive'], ARRAY['new-arrival'], true),
('Casual Shirt', 'casual-shirt', 'A premium casual shirt for everyday wear.', 1390.00, 1590.00, '22222222-2222-2222-2222-222222222222', ARRAY['https://images.unsplash.com/photo-1596755094514-f87e32f85e98?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 30, ARRAY['M', 'L', 'XL'], ARRAY['Navy', 'White'], ARRAY['best-seller'], true),
('Varsity Jacket', 'varsity-jacket', 'Classic varsity jacket with premium embroidery.', 2490.00, 2990.00, '33333333-3333-3333-3333-333333333333', ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 15, ARRAY['M', 'L'], ARRAY['Black/White', 'Green/White'], ARRAY['trending'], true),
('Printed Shirt', 'printed-shirt', 'Stylish printed shirt for summer.', 1190.00, 1490.00, '22222222-2222-2222-2222-222222222222', ARRAY['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 40, ARRAY['S', 'M', 'L'], ARRAY['Blue Pattern'], ARRAY['premium'], true),
('Cargo Vest', 'cargo-vest', 'Utility cargo vest with multiple pockets.', 1890.00, 2190.00, '44444444-4444-4444-4444-444444444444', ARRAY['https://images.unsplash.com/photo-1588147285149-14a0f44e1d51?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 20, ARRAY['M', 'L', 'XL'], ARRAY['Khaki', 'Black'], ARRAY['premium'], true),
('Windbreaker', 'windbreaker', 'Lightweight and water-resistant windbreaker.', 1590.00, 1990.00, '55555555-5555-5555-5555-555555555555', ARRAY['https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 25, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Grey', 'Navy'], ARRAY['discounted'], true)
ON CONFLICT (slug) DO NOTHING;

-- Blogs Seed
INSERT INTO blogs (title, slug, excerpt, content, status, published_at, cover_image_url) VALUES
('How to Style Oversized T-Shirts in 2025', 'how-to-style-oversized-t-shirts-in-2025', 'Discover the best ways to style your oversized t-shirts for a modern, relaxed look.', 'Full content goes here...', 'published', NOW(), 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Why Fabric Quality Matters in Premium Clothing', 'why-fabric-quality-matters', 'Learn why investing in high-quality fabrics is essential for longevity and comfort.', 'Full content goes here...', 'published', NOW(), 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Summer 25 Collection: What''s Trending', 'summer-25-collection-whats-trending', 'A sneak peek into the hottest trends for the upcoming summer season.', 'Full content goes here...', 'published', NOW(), 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')
ON CONFLICT (slug) DO NOTHING;

-- Testimonials Seed
INSERT INTO testimonials (name, message, rating, is_active) VALUES
('Rifat Hasan', 'Amazing quality! The oversized t-shirt fits perfectly and the fabric is incredibly soft. Highly recommended.', 5, true),
('Mahin Ahmed', 'EDAKPION has the best collection of casual wear. Delivery was fast and the packaging was premium.', 5, true);

-- Site Content Seed
INSERT INTO site_content (section, title, subtitle, description, button_text, button_link, is_active) VALUES
('hero', 'New Arrivals', 'Summer 2025 Collection', 'Discover the latest trends in men''s fashion with our new summer collection.', 'Shop Now', '/shop', true),
('feature_bar', 'Free Shipping', NULL, 'On all orders over ৳2000', NULL, NULL, true),
('collection_banner', 'Premium Essentials', NULL, 'Elevate your everyday wardrobe.', 'Explore', '/shop?tag=premium', true),
('discount_banner', 'Flash Sale', 'Up to 50% Off', 'Limited time offer on selected items.', 'Shop Sale', '/shop?tag=discounted', true),
('why_choose_us', 'Premium Quality', NULL, 'We use only the finest materials for our clothing.', NULL, NULL, true),
('subscribe', 'Join Our Newsletter', NULL, 'Get 10% off your first order.', 'Subscribe', NULL, true),
('footer', 'About Us', NULL, 'EDAKPION is a premium fashion brand dedicated to providing high-quality clothing for men.', NULL, NULL, true);

-- Store Settings Seed
INSERT INTO store_settings (key, value) VALUES
('store_name', '"EDAKPION"'),
('currency', '"৳"'),
('delivery_charge', '80'),
('phone', '"+8801234567890"'),
('email', '"support@edakpion.com"'),
('social_links', '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "twitter": "https://twitter.com"}')
ON CONFLICT (key) DO NOTHING;
