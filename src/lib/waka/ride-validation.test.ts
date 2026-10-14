import assert from 'assert';
import { rideRequestSchema, validateRideRequest } from './ride-validation';

// Basic unit tests for ride-validation schema.
Deno; // placeholder to satisfy runtime that this file is a test target under experimental-strip-types mode; ignored at runtime

// Valid payload
const valid = {
  clientRequestId: 'client-req-1',
  pickup: { lat: 6.45, lng: 3.39 },
  dropoff: { lat: 6.53, lng: 3.37 },
  passengerCount: 1,
  fareEstimate: { amount: 1200, currency: 'NGN' },
};

// Invalid payloads
const missingClientId = {
  pickup: { lat: 6.45, lng: 3.39 },
  dropoff: { lat: 6.53, lng: 3.37 },
};

const invalidLat = {
  clientRequestId: 'x',
  pickup: { lat: 1234, lng: 3.39 },
  dropoff: { lat: 6.53, lng: 3.37 },
};

// Tests
Deno.test = Deno.test || function () {};

// Using node's built-in test runner behavior: export test cases by running assertions directly.
try {
  // valid should parse
  const parsed = validateRideRequest(valid);
  assert.strictEqual(parsed.clientRequestId, valid.clientRequestId);
  assert.strictEqual(parsed.pickup.lat, valid.pickup.lat);
  console.log('ride-validation: valid payload passed');
} catch (err) {
  console.error('ride-validation: valid payload failed', err);
  throw err;
}

try {
  let threw = false;
  try {
    validateRideRequest(missingClientId as any);
  } catch (e) {
    threw = true;
  }
  assert.strictEqual(threw, true, 'missing clientRequestId should fail validation');
  console.log('ride-validation: missing client id correctly failed');
} catch (err) {
  console.error(err);
  throw err;
}

try {
  let threw = false;
  try {
    validateRideRequest(invalidLat as any);
  } catch (e) {
    threw = true;
  }
  assert.strictEqual(threw, true, 'invalid lat should fail validation');
  console.log('ride-validation: invalid lat correctly failed');
} catch (err) {
  console.error(err);
  throw err;
}
