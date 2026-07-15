ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing profiles with their emails
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update handle_new_user to include email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'user',
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for admin to get all users easily with their emails
DROP VIEW IF EXISTS admin_users_view;
CREATE VIEW admin_users_view AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.avatar_url,
    p.role,
    p.is_active,
    p.created_at,
    (SELECT count(*) FROM orders WHERE user_id = p.id) as total_orders,
    (SELECT COALESCE(sum(total), 0) FROM orders WHERE user_id = p.id) as total_spend
FROM profiles p;
