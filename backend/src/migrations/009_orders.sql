-- =====================================================
-- Orders and Packages Tables
-- Customer orders and service packages
-- =====================================================

-- Packages Table
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded')),
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    payment_screenshot_url TEXT,
    store_details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes for packages
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_display_order ON packages(display_order);
CREATE INDEX IF NOT EXISTS idx_packages_price ON packages(price);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_package ON orders(package_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at DESC);

-- Create triggers
DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE packages IS 'Service packages (Shopify store creation tiers)';
COMMENT ON TABLE orders IS 'Customer orders and sales';
COMMENT ON COLUMN packages.features IS 'Package features as JSON array';
COMMENT ON COLUMN orders.store_details IS 'Customer store requirements and details';
COMMENT ON COLUMN orders.payment_screenshot_url IS 'Cloudinary URL for payment proof';
