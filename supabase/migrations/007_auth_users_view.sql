-- Create a secure view for super admins to see auth.users
CREATE OR REPLACE VIEW admin_auth_users AS
SELECT 
    id,
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at,
    updated_at,
    last_sign_in_at,
    phone,
    banned_until,
    email_confirmed_at,
    phone_confirmed_at
FROM auth.users
WHERE (SELECT role FROM public.profiles WHERE profiles.id = auth.uid()) = 'super_admin';

-- Enable RLS on the view (views don't have RLS in the same way, but it's restricted by the WHERE clause)
