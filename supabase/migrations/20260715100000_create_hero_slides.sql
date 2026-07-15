CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    desktop_image TEXT,
    mobile_image TEXT,
    primary_button_text TEXT,
    primary_button_url TEXT,
    secondary_button_text TEXT,
    secondary_button_url TEXT,
    badge TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.hero_slides;
CREATE POLICY "Enable read access for all users" ON public.hero_slides
    FOR SELECT
    USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "Enable full access for admin users" ON public.hero_slides;
CREATE POLICY "Enable full access for admin users" ON public.hero_slides
    FOR ALL
    USING (is_admin());
