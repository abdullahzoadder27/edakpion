ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published';
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS background_color TEXT;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS panel_color TEXT;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS ghost_text TEXT;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS animation_type TEXT;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS autoplay_duration INTEGER;
