-- 4. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert contact message" ON contact_messages;
CREATE POLICY "Anyone can insert contact message" ON contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can manage contact messages" ON contact_messages;
CREATE POLICY "Admin can manage contact messages" ON contact_messages FOR ALL USING (is_admin());
