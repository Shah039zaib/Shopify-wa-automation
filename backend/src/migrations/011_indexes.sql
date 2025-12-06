-- =====================================================
-- Additional Indexes and Constraints
-- Performance optimization and data integrity
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_customer_status 
ON conversations(customer_id, status);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp 
ON messages(conversation_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_status 
ON orders(customer_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_logs_provider_timestamp 
ON ai_logs(provider_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ai_logs_success_timestamp 
ON ai_logs(success, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_safety_logs_account_severity 
ON safety_logs(account_id, severity, timestamp DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_customers_name_search 
ON customers USING gin(to_tsvector('english', COALESCE(name, '')));

CREATE INDEX IF NOT EXISTS idx_messages_text_search 
ON messages USING gin(to_tsvector('english', COALESCE(message_text, '')));

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_active_conversations 
ON conversations(customer_id, last_message_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_pending_orders 
ON orders(customer_id, created_at DESC) 
WHERE status IN ('pending', 'payment_pending');

CREATE INDEX IF NOT EXISTS idx_active_packages 
ON packages(display_order, price) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_active_payment_methods 
ON payment_methods(display_order) 
WHERE is_active = true;

-- Add constraints for data validation
ALTER TABLE customers 
ADD CONSTRAINT chk_customers_phone_format 
CHECK (phone_number ~ '^\+?[0-9]{10,15}$');

ALTER TABLE customers 
ADD CONSTRAINT chk_customers_email_format 
CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE orders 
ADD CONSTRAINT chk_orders_amount_positive 
CHECK (amount > 0);

ALTER TABLE packages 
ADD CONSTRAINT chk_packages_price_positive 
CHECK (price >= 0);

-- Add unique constraints
ALTER TABLE whatsapp_accounts 
ADD CONSTRAINT uq_whatsapp_accounts_phone 
UNIQUE (phone_number);

ALTER TABLE ai_providers 
ADD CONSTRAINT uq_ai_providers_name 
UNIQUE (name);

-- Ensure only one primary WhatsApp account
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_whatsapp 
ON whatsapp_accounts(is_primary) 
WHERE is_primary = true;

-- Statistics for query optimization
ANALYZE users;
ANALYZE customers;
ANALYZE conversations;
ANALYZE messages;
ANALYZE whatsapp_accounts;
ANALYZE whatsapp_sessions;
ANALYZE ai_providers;
ANALYZE ai_keys;
ANALYZE ai_prompts;
ANALYZE ai_logs;
ANALYZE payment_methods;
ANALYZE orders;
ANALYZE packages;
ANALYZE templates;
ANALYZE settings;
ANALYZE safety_logs;

-- Add comments
COMMENT ON INDEX idx_conversations_customer_status IS 'Optimizes customer conversation lookup by status';
COMMENT ON INDEX idx_messages_conversation_timestamp IS 'Optimizes message retrieval in chronological order';
COMMENT ON INDEX idx_orders_customer_status IS 'Optimizes order filtering by customer and status';
COMMENT ON INDEX idx_active_conversations IS 'Partial index for active conversations only';
COMMENT ON INDEX idx_pending_orders IS 'Partial index for pending payment orders';
