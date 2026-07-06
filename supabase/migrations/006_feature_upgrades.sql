-- Coupons upgrade
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_categories UUID[];
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_products UUID[];
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS excluded_products UUID[];
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS new_customer_only BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS auto_apply BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Reviews upgrade
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;
-- Status can already be updated, currently it defaults to 'pending'

-- Subscribers upgrade
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS source_page TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'subscribed';

-- Testimonials upgrade
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Support Tickets upgrade
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS internal_notes TEXT;
