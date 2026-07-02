CREATE TABLE IF NOT EXISTS admins (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW());

-- Support System Tables

CREATE TABLE IF NOT EXISTS support_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, pending, resolved, closed
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    unread_admin_count INT DEFAULT 0,
    unread_customer_count INT DEFAULT 0,
    linked_order_id TEXT
);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    message TEXT,
    attachment_url TEXT,
    attachment_type TEXT, -- 'image', 'pdf', 'product', 'invoice'
    product_id UUID,
    is_internal_note BOOLEAN DEFAULT FALSE,
    seen BOOLEAN DEFAULT FALSE,
    delivered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_quick_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
