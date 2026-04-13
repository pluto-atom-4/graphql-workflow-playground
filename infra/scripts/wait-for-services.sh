#!/bin/bash

# Health check for all services
# Used in CI/CD pipelines to ensure services are ready

set -e

echo "Waiting for services to be ready..."

# Wait for Postgres (application)
echo "Checking PostgreSQL (application)..."
while ! pg_isready -h localhost -p 5432 -U boltline > /dev/null 2>&1; do
  sleep 1
done
echo "✓ PostgreSQL (application) is ready"

# Wait for Postgres (Temporal)
echo "Checking PostgreSQL (Temporal)..."
while ! pg_isready -h localhost -p 5433 -U temporal > /dev/null 2>&1; do
  sleep 1
done
echo "✓ PostgreSQL (Temporal) is ready"

# Wait for Hasura
echo "Checking Hasura GraphQL..."
while ! curl -s http://localhost:8080/healthz > /dev/null 2>&1; do
  sleep 1
done
echo "✓ Hasura GraphQL is ready"

# Wait for Temporal
echo "Checking Temporal Server..."
while ! curl -s http://localhost:7233 > /dev/null 2>&1; do
  sleep 1
done
echo "✓ Temporal Server is ready"

# Wait for Kafka
echo "Checking Kafka..."
while ! nc -z localhost 9092 > /dev/null 2>&1; do
  sleep 1
done
echo "✓ Kafka is ready"

echo ""
echo "All services are ready!"
echo ""
echo "Access points:"
echo "  - Hasura GraphQL: http://localhost:8080/console"
echo "  - Temporal UI: http://localhost:8088"
echo "  - Kafka (localhost:9092)"
echo "  - PostgreSQL (localhost:5432)"
