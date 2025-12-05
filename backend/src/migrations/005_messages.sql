-- =====================================================
-- Messages Table
-- Individual messages in conversations
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL CHECK (sender IN ('customer', 'bot', 'admin')),
    message_text TEXT,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact')),
    media_url TEXT,
    ai_used VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_ai_used ON messages(ai_used);

-- Add comments
COMMENT ON TABLE messages IS 'Individual messages in conversations';
COMMENT ON COLUMN messages.ai_used IS 'Which AI provider generated this message';
