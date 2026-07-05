
-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for roles" ON public.roles FOR SELECT USING (true);
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
CREATE POLICY "Admin read own record" ON public.admins FOR SELECT USING (auth.uid() = auth_user_id);
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

