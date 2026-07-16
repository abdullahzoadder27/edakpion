CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  verified_buyer BOOLEAN DEFAULT false,
  customer_location TEXT,
  customer_designation TEXT,
  profile_image TEXT,
  review_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Hidden')),
  sort_order INTEGER DEFAULT 0,
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON public.product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_date ON public.product_reviews(review_date);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.product_reviews;
CREATE POLICY "Public reviews are viewable by everyone" ON public.product_reviews FOR SELECT USING (status = 'Published');
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.product_reviews;
CREATE POLICY "Admins can manage all reviews" ON public.product_reviews FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;
