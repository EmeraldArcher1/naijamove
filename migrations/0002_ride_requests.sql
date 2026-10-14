-- migrations/0002_ride_requests.sql
-- Creates persistent ride_requests and ride_status_events tables.
-- Notes:
-- - Requires a Postgres environment. If using pgcrypto for gen_random_uuid(), ensure the extension is available.
-- - Enforces uniqueness on (rider_user_id, client_request_id) to allow idempotent client submissions.

-- Optional: enable extension if available (uncomment if your environment supports it)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_user_id text NOT NULL,
  client_request_id text NOT NULL,
  pickup_lat numeric NOT NULL,
  pickup_lng numeric NOT NULL,
  dropoff_lat numeric NOT NULL,
  dropoff_lng numeric NOT NULL,
  passenger_count integer NOT NULL DEFAULT 1,
  fare_amount bigint NULL,
  fare_currency text NULL,
  fare_quote_status text NOT NULL DEFAULT 'unverified',
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ride_requests_unique_rider_client_request UNIQUE (rider_user_id, client_request_id)
);

CREATE INDEX IF NOT EXISTS idx_ride_requests_rider_user_id ON ride_requests (rider_user_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_created_at ON ride_requests (created_at);

CREATE TABLE IF NOT EXISTS ride_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_request_id uuid NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
  status text NOT NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ride_status_events_ride_request_id ON ride_status_events (ride_request_id);
CREATE INDEX IF NOT EXISTS idx_ride_status_events_created_at ON ride_status_events (created_at);
