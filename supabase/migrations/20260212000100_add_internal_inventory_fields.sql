-- Add compatible_vehicles and part_type to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS compatible_vehicles TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS part_type TEXT DEFAULT 'Genuine';

-- Add comment to clarify these are internal
COMMENT ON COLUMN inventory_items.compatible_vehicles IS 'Internal reference for vehicle compatibility';
COMMENT ON COLUMN inventory_items.part_type IS 'Internal reference for part category (Genuine, Generic, etc.)';
