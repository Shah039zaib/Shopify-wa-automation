-- =====================================================
-- Payment Methods Table
-- EasyPaisa, JazzCash, Bank Transfer configurations
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('easypaisa', 'jazzcash', 'bank_transfer')),
    account_title VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    iban VARCHAR(100),
    bank_name VARCHAR(255),
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_display_order ON payment_methods(display_order);

-- Create trigger
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE payment_methods IS 'Payment method configurations';
COMMENT ON COLUMN payment_methods.type IS 'Payment method type: easypaisa, jazzcash, or bank_transfer';
COMMENT ON COLUMN payment_methods.qr_code_url IS 'Cloudinary URL for payment QR code';
