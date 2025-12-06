-- =====================================================
-- AI System Tables
-- AI providers, keys, prompts, and logs
-- =====================================================

-- AI Providers Table
CREATE TABLE IF NOT EXISTS ai_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5,
    daily_requests INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 1000,
    success_rate DECIMAL(5, 2) DEFAULT 100.00,
    avg_response_time DECIMAL(10, 2) DEFAULT 0,
    model_name VARCHAR(255),
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Keys Table
CREATE TABLE IF NOT EXISTS ai_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    requests_used INTEGER DEFAULT 0,
    requests_limit INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Prompts Table
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('welcome', 'sales', 'payment', 'followup', 'confirmation', 'support')),
    content TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'urdu',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Logs Table
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    request_text TEXT,
    response_text TEXT,
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for AI tables
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_ai_providers_name ON ai_providers(name);

CREATE INDEX IF NOT EXISTS idx_ai_keys_provider ON ai_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_keys_active ON ai_keys(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_type ON ai_prompts(type);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_language ON ai_prompts(language);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ai_prompts(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_logs_provider ON ai_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_message ON ai_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_timestamp ON ai_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_success ON ai_logs(success);

-- Create triggers
DROP TRIGGER IF EXISTS update_ai_providers_updated_at ON ai_providers;
CREATE TRIGGER update_ai_providers_updated_at
    BEFORE UPDATE ON ai_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_prompts_updated_at ON ai_prompts;
CREATE TRIGGER update_ai_prompts_updated_at
    BEFORE UPDATE ON ai_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE ai_providers IS 'AI service providers (Claude, Gemini, Groq, etc)';
COMMENT ON TABLE ai_keys IS 'Encrypted API keys for AI providers';
COMMENT ON TABLE ai_prompts IS 'Customizable AI prompts for different scenarios';
COMMENT ON TABLE ai_logs IS 'AI request/response logs for monitoring and analytics';
COMMENT ON COLUMN ai_keys.api_key IS 'Encrypted API key';
