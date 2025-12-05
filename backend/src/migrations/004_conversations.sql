-- =====================================================
-- Conversations Table
-- Chat sessions between customers and bot
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    whatsapp_account_id UUID,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
    context_summary TEXT,
    last_message_at TIMESTAMP DEFAULT NOW(),
    messages_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_account ON conversations(whatsapp_account_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE conversations IS 'Chat conversations between customers and bot';
COMMENT ON COLUMN conversations.context_summary IS 'Summary of conversation context for AI';
