-- Supabase Content Cleanup Query
-- This query identifies and deletes "dummy" or "placeholder" entries with random characters.

-- 1. Identify and delete entries with specific known dummy strings (e.g. "Ghjjjjb", "Wshhdd")
DELETE FROM products
WHERE name ILIKE '%Ghjjjjb%' OR name ILIKE '%Wshhdd%';

DELETE FROM blogs
WHERE title ILIKE '%Ghjjjjb%' OR title ILIKE '%Wshhdd%';

-- 2. Identify and delete entries with unnatural consonant sequences (4 or more consonants in a row)
-- This is a strong indicator of keyboard mashing like "asdfgh"
DELETE FROM products
WHERE name ~* '[bcdfghjklmnpqrstvwxyz]{4,}';

DELETE FROM blogs
WHERE title ~* '[bcdfghjklmnpqrstvwxyz]{4,}';

-- 3. (Optional / Caution) Delete entries shorter than 3 characters if they are known to be tests
-- DELETE FROM products WHERE length(name) < 3;

-- Note: To preview what will be deleted BEFORE deleting, run these as SELECT queries first:
-- SELECT id, name FROM products WHERE name ~* '[bcdfghjklmnpqrstvwxyz]{4,}';
