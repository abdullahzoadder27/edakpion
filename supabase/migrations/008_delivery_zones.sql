CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name TEXT NOT NULL,
    zone_type TEXT NOT NULL DEFAULT 'inside', -- 'inside' or 'outside'
    delivery_charge NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_delivery_zones_modtime ON delivery_zones;
CREATE TRIGGER update_delivery_zones_modtime BEFORE UPDATE ON delivery_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "delivery_zones_read_policy" ON delivery_zones;
CREATE POLICY "delivery_zones_read_policy" ON delivery_zones
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "delivery_zones_insert_policy" ON delivery_zones;
CREATE POLICY "delivery_zones_insert_policy" ON delivery_zones
    FOR INSERT WITH CHECK (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'manager')
    );

DROP POLICY IF EXISTS "delivery_zones_update_policy" ON delivery_zones;
CREATE POLICY "delivery_zones_update_policy" ON delivery_zones
    FOR UPDATE USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'manager')
    );

DROP POLICY IF EXISTS "delivery_zones_delete_policy" ON delivery_zones;
CREATE POLICY "delivery_zones_delete_policy" ON delivery_zones
    FOR DELETE USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'manager')
    );

-- Insert defaults
INSERT INTO delivery_zones (city_name, zone_type, delivery_charge, sort_order) VALUES
('Outside Selected Cities', 'outside', 150, 9999),
('Dhaka', 'inside', 60, 1),
('Chattogram', 'inside', 100, 2),
('Khulna', 'inside', 80, 3)
ON CONFLICT DO NOTHING;
