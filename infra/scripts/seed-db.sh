#!/bin/bash

# Seed sample data into the application database
# Run after docker compose up and postgres is healthy

set -e

DB_USER="boltline"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="boltline_dev"

echo "Waiting for database to be ready..."
until PGPASSWORD=boltline psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; do
  sleep 1
done

echo "Database is ready. Seeding data..."

# Insert sample parts
PGPASSWORD=boltline psql -h $DB_HOST -U $DB_USER -d $DB_NAME << EOF
INSERT INTO parts (name, sku) VALUES
  ('Heat Shield', 'HS-001'),
  ('Fuel Injector', 'FI-002'),
  ('Combustion Chamber', 'CC-003')
ON CONFLICT DO NOTHING;

INSERT INTO inventory (part_id, quantity, location)
SELECT id, 50, 'Warehouse A' FROM parts WHERE sku = 'HS-001'
ON CONFLICT DO NOTHING;

INSERT INTO inventory (part_id, quantity, location)
SELECT id, 100, 'Warehouse B' FROM parts WHERE sku = 'FI-002'
ON CONFLICT DO NOTHING;

INSERT INTO inventory (part_id, quantity, location)
SELECT id, 75, 'Warehouse A' FROM parts WHERE sku = 'CC-003'
ON CONFLICT DO NOTHING;
EOF

echo "Seeding complete!"
