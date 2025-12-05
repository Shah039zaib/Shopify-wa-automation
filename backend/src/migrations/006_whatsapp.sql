-- =====================================================
-- WhatsApp Tables
-- WhatsApp accounts and session management
-- =====================================================

-- WhatsApp Accounts Table
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'ready', 'timeout')),
    daily_message_count INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 500,
    last_reset_time TIMESTAMP DEFAULT NOW(),
    risk_level VARCHAR(50) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp Sessions Table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
    session_data TEXT,
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wa_accounts_status ON whatsapp_accounts(status);
CREATE INDEX IF NOT EXISTS idx_wa_accounts_primary ON whatsapp_accounts(is_primary);
CREATE INDEX IF NOT EXISTS idx_wa_sessions_account ON whatsapp_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_wa_sessions_expires ON whatsapp_sessions(expires_at);

-- Add foreign key to conversations
ALTER TABLE conversations
ADD CONSTRAINT fk_conversations_whatsapp_account
FOREIGN KEY (whatsapp_account_id) REFERENCES whatsapp_accounts(id) ON DELETE SET NULL;

-- Create triggers
DROP TRIGGER IF EXISTS update_wa_accounts_updated_at ON whatsapp_accounts;
CREATE TRIGGER update_wa_accounts_updated_at
    BEFORE UPDATE ON whatsapp_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE whatsapp_accounts IS 'WhatsApp business accounts for multi-account support';
COMMENT ON TABLE whatsapp_sessions IS 'Encrypted WhatsApp session data for persistence';
COMMENT ON COLUMN whatsapp_sessions.session_data IS 'Encrypted session data';
