-- =====================================================
-- Analytics and Utility Tables
-- Settings, templates, and safety logs
-- =====================================================

-- Settings Table (Key-Value Store)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    language VARCHAR(50) DEFAULT 'urdu',
    category VARCHAR(100) DEFAULT 'general',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Safety Logs Table
CREATE TABLE IF NOT EXISTS safety_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Create indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_language ON templates(language);
CREATE INDEX IF NOT EXISTS idx_templates_usage ON templates(usage_count DESC);

-- Create indexes for safety logs
CREATE INDEX IF NOT EXISTS idx_safety_logs_account ON safety_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_safety_logs_severity ON safety_logs(severity);
CREATE INDEX IF NOT EXISTS idx_safety_logs_event_type ON safety_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_safety_logs_timestamp ON safety_logs(timestamp DESC);

-- Create triggers
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE settings IS 'System-wide settings (key-value store)';
COMMENT ON TABLE templates IS 'Message templates with variable substitution';
COMMENT ON TABLE safety_logs IS 'WhatsApp safety and rate limit monitoring logs';
COMMENT ON COLUMN templates.variables IS 'Template variables as JSON array';
COMMENT ON COLUMN safety_logs.metadata IS 'Additional event metadata';
