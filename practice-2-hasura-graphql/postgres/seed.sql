-- Seed sample data for local development

INSERT INTO parts (name, sku) VALUES
  ('Heat Shield', 'HS-001'),
  ('Fuel Injector', 'FI-002'),
  ('Combustion Chamber', 'CC-003'),
  ('Nozzle Assembly', 'NA-004'),
  ('Pressure Valve', 'PV-005')
ON CONFLICT (sku) DO NOTHING;

-- Insert inventory for each part
INSERT INTO inventory (part_id, quantity, location)
SELECT id, 50, 'Warehouse A' FROM parts WHERE sku = 'HS-001'
ON CONFLICT (part_id, location) DO NOTHING;

INSERT INTO inventory (part_id, quantity, location)
SELECT id, 100, 'Warehouse B' FROM parts WHERE sku = 'FI-002'
ON CONFLICT (part_id, location) DO NOTHING;

INSERT INTO inventory (part_id, quantity, location)
SELECT id, 75, 'Warehouse A' FROM parts WHERE sku = 'CC-003'
ON CONFLICT (part_id, location) DO NOTHING;

INSERT INTO inventory (part_id, quantity, location)
SELECT id, 25, 'Warehouse C' FROM parts WHERE sku = 'NA-004'
ON CONFLICT (part_id, location) DO NOTHING;

INSERT INTO inventory (part_id, quantity, location)
SELECT id, 120, 'Warehouse B' FROM parts WHERE sku = 'PV-005'
ON CONFLICT (part_id, location) DO NOTHING;

-- Insert some sample orders
INSERT INTO orders (part_id, quantity, status) VALUES
  ((SELECT id FROM parts WHERE sku = 'HS-001'), 5, 'PENDING'),
  ((SELECT id FROM parts WHERE sku = 'FI-002'), 10, 'CONFIRMED'),
  ((SELECT id FROM parts WHERE sku = 'CC-003'), 3, 'SHIPPED')
ON CONFLICT DO NOTHING;
