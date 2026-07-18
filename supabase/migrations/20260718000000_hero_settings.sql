CREATE TABLE IF NOT EXISTS public.hero_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  
  -- General Settings
  is_enabled BOOLEAN DEFAULT true,
  desktop_layout TEXT DEFAULT 'split',
  tablet_layout TEXT DEFAULT 'split',
  mobile_layout TEXT DEFAULT 'stacked',
  desktop_height TEXT DEFAULT '70vh',
  tablet_height TEXT DEFAULT '60vh',
  mobile_height TEXT DEFAULT 'auto',
  container_width TEXT DEFAULT 'max-w-[1180px]',
  content_alignment TEXT DEFAULT 'left',
  character_position TEXT DEFAULT 'right',
  character_size TEXT DEFAULT '80%',
  section_padding TEXT DEFAULT 'px-4 sm:px-6 md:px-8',
  gap_text_character TEXT DEFAULT 'gap-0',

  -- Background
  bg_image_url TEXT,
  bg_mobile_image_url TEXT,
  bg_color TEXT DEFAULT '#0F0F10',
  overlay_color TEXT DEFAULT '#0F0F10',
  overlay_opacity INTEGER DEFAULT 80,
  gradient_style TEXT DEFAULT 'bg-gradient-to-br from-[#0F0F10] via-[#0F0F10] to-[#1B1B1D]',
  enable_spotlight BOOLEAN DEFAULT true,
  enable_jamdani BOOLEAN DEFAULT true,

  -- Colors
  color_primary TEXT DEFAULT '#E7B74C',
  color_secondary TEXT DEFAULT '#C89A2B',
  color_accent TEXT DEFAULT '#F0C75A',
  color_button_bg TEXT DEFAULT '#E7B74C',
  color_button_text TEXT DEFAULT '#0F0F10',
  color_button_hover TEXT DEFAULT '#F0C75A',
  color_text_primary TEXT DEFAULT '#F8F5EF',
  color_text_secondary TEXT DEFAULT '#D9D2C7',

  -- Typography
  font_family TEXT DEFAULT 'font-serif',
  heading_size_desktop TEXT DEFAULT 'text-[3.75rem] xl:text-[4.25rem]',
  heading_size_tablet TEXT DEFAULT 'text-4xl md:text-5xl',
  heading_size_mobile TEXT DEFAULT 'text-[2.25rem]',
  desc_size_desktop TEXT DEFAULT 'text-sm',
  desc_size_mobile TEXT DEFAULT 'text-[13px]',
  font_weight_heading TEXT DEFAULT 'font-bold',
  letter_spacing TEXT DEFAULT 'tracking-tight',
  line_height TEXT DEFAULT 'leading-[1.05]',

  -- Animations
  anim_floating BOOLEAN DEFAULT true,
  anim_mouse_parallax BOOLEAN DEFAULT true,
  anim_fade BOOLEAN DEFAULT true,
  anim_slide BOOLEAN DEFAULT true,
  anim_character_scale BOOLEAN DEFAULT true,
  anim_speed TEXT DEFAULT '800ms',
  anim_duration TEXT DEFAULT '0.5s',

  -- Responsive Controls
  desktop_char_width TEXT DEFAULT 'lg:w-[85%] xl:w-[80%]',
  tablet_char_width TEXT DEFAULT 'md:w-[55%]',
  mobile_char_width TEXT DEFAULT 'w-[75%] sm:w-[65%]',
  desktop_text_width TEXT DEFAULT 'max-w-none',
  mobile_text_align TEXT DEFAULT 'text-center',
  mobile_char_align TEXT DEFAULT 'justify-center',
  mobile_gap_headline_char TEXT DEFAULT 'mb-2 mt-[-5px]',
  mobile_gap_char_desc TEXT DEFAULT 'mb-3',
  mobile_btn_width TEXT DEFAULT 'w-full',

  -- SEO
  seo_h1 TEXT DEFAULT 'Premium Streetwear Made to Stand Out',
  seo_meta_title TEXT,
  seo_meta_desc TEXT,
  seo_image_alt TEXT,
  seo_og_image TEXT,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.hero_settings;
CREATE POLICY "Enable read access for all users" ON public.hero_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable full access for admin users" ON public.hero_settings;
CREATE POLICY "Enable full access for admin users" ON public.hero_settings
    FOR ALL
    USING (
      auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
      )
    )
    WITH CHECK (
      auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
      )
    );

INSERT INTO public.hero_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
