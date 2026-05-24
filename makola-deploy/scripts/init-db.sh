#!/bin/bash
# Run once on first postgres container start
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" << 'EOSQL'
  -- Enable extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "postgis";
  CREATE EXTENSION IF NOT EXISTS "pg_trgm";

  -- Set timezone
  SET timezone = 'Africa/Accra';
EOSQL

echo "Database initialised with extensions."
