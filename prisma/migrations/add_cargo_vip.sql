-- Add cargoVip column to pedidos table
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cargo_vip DECIMAL(10,2) DEFAULT 0 NOT NULL;
