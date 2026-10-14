import { Pool } from 'pg';
import type { RideRequestInput } from './ride-validation';
import { validateRideRequest } from './ride-validation';

// Simple singleton PG pool. In tests you can pass a pool instance to the exported
// functions to avoid creating pools repeatedly.
let _pool: Pool | null = null;
function getPool(): Pool {
  if (_pool) return _pool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not configured');
  _pool = new Pool({ connectionString: databaseUrl });
  return _pool;
}

export type RideRequestRow = {
  id: string;
  rider_user_id: string;
  client_request_id: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  passenger_count: number;
  fare_amount: number | null;
  fare_currency: string | null;
  fare_quote_status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
};

// Create a ride request idempotently for the authenticated rider.
// - riderUserId: authenticated rider id (string)
// - input: validated ride request payload (will be validated if not already)
// - opts.pool: optional pg Pool for testing/injection
export async function createRideRequest(
  riderUserId: string,
  input: unknown,
  opts?: { pool?: Pool }
): Promise<RideRequestRow> {
  if (!riderUserId) throw new Error('Authentication required: riderUserId');
  const payload: RideRequestInput = validateRideRequest(input);
  const pool = opts?.pool ?? getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Try to insert. If a conflict occurs on (rider_user_id, client_request_id) then do nothing.
    const insertText = `
      INSERT INTO ride_requests
        (rider_user_id, client_request_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, passenger_count, fare_amount, fare_currency, fare_quote_status, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'unverified',$10)
      ON CONFLICT (rider_user_id, client_request_id)
      DO NOTHING
      RETURNING *;
    `;
    const insertValues = [
      riderUserId,
      payload.clientRequestId,
      payload.pickup.lat,
      payload.pickup.lng,
      payload.dropoff.lat,
      payload.dropoff.lng,
      payload.passengerCount ?? 1,
      payload.fareEstimate?.amount ?? null,
      payload.fareEstimate?.currency ?? null,
      payload.metadata ? JSON.stringify(payload.metadata) : null,
    ];
    const insertRes = await client.query(insertText, insertValues);

    let rideRow;
    if (insertRes.rowCount > 0) {
      // newly created - create initial status event
      rideRow = insertRes.rows[0];
      const eventText = `
        INSERT INTO ride_status_events (ride_request_id, status, metadata)
        VALUES ($1, $2, $3);
      `;
      await client.query(eventText, [rideRow.id, 'requested', null]);
    } else {
      // already exists - fetch existing row
      const selectText = `
        SELECT * FROM ride_requests WHERE rider_user_id = $1 AND client_request_id = $2 LIMIT 1;
      `;
      const selectRes = await client.query(selectText, [riderUserId, payload.clientRequestId]);
      if (selectRes.rowCount === 0) {
        throw new Error('Failed to insert or read existing ride request');
      }
      rideRow = selectRes.rows[0];
    }

    await client.query('COMMIT');

    // Normalize fields for consumers
    return {
      id: rideRow.id,
      rider_user_id: rideRow.rider_user_id,
      client_request_id: rideRow.client_request_id,
      pickup_lat: Number(rideRow.pickup_lat),
      pickup_lng: Number(rideRow.pickup_lng),
      dropoff_lat: Number(rideRow.dropoff_lat),
      dropoff_lng: Number(rideRow.dropoff_lng),
      passenger_count: Number(rideRow.passenger_count),
      fare_amount: rideRow.fare_amount === null ? null : Number(rideRow.fare_amount),
      fare_currency: rideRow.fare_currency,
      fare_quote_status: rideRow.fare_quote_status,
      metadata: rideRow.metadata,
      created_at: rideRow.created_at,
      updated_at: rideRow.updated_at,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// List ride requests belonging to the authenticated rider only.
export async function listMyRideRequests(
  riderUserId: string,
  opts?: { pool?: Pool; limit?: number }
): Promise<RideRequestRow[]> {
  if (!riderUserId) throw new Error('Authentication required: riderUserId');
  const pool = opts?.pool ?? getPool();
  const limit = opts?.limit ?? 100;
  const res = await pool.query(
    `SELECT * FROM ride_requests WHERE rider_user_id = $1 ORDER BY created_at DESC LIMIT $2;`,
    [riderUserId, limit]
  );
  return res.rows.map((r: any) => ({
    id: r.id,
    rider_user_id: r.rider_user_id,
    client_request_id: r.client_request_id,
    pickup_lat: Number(r.pickup_lat),
    pickup_lng: Number(r.pickup_lng),
    dropoff_lat: Number(r.dropoff_lat),
    dropoff_lng: Number(r.dropoff_lng),
    passenger_count: Number(r.passenger_count),
    fare_amount: r.fare_amount === null ? null : Number(r.fare_amount),
    fare_currency: r.fare_currency,
    fare_quote_status: r.fare_quote_status,
    metadata: r.metadata,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}
