-- Add missing columns to products table if they are needed in the future
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS features TEXT[],
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
