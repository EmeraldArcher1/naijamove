import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rideRequestSchema, validateRideRequest } from "./ride-validation.ts";

const valid = {
  clientRequestId: "client-req-1",
  pickup: { lat: 6.45, lng: 3.39 },
  dropoff: { lat: 6.53, lng: 3.37 },
  passengerCount: 1,
  fareEstimate: { amount: 1200, currency: "NGN" },
};

describe("ride request validation", () => {
  it("accepts a valid ride request and preserves its values", () => {
    const parsed = validateRideRequest(valid);
    assert.equal(parsed.clientRequestId, valid.clientRequestId);
    assert.deepEqual(parsed.pickup, valid.pickup);
    assert.deepEqual(parsed.dropoff, valid.dropoff);
    assert.equal(parsed.passengerCount, 1);
    assert.deepEqual(parsed.fareEstimate, { amount: 1200, currency: "NGN" });
  });

  it("rejects a missing client request ID", () => {
    const { clientRequestId: _clientRequestId, ...missingClientId } = valid;
    assert.throws(() => validateRideRequest(missingClientId));
  });

  it("rejects coordinates outside valid latitude/longitude ranges", () => {
    assert.throws(() =>
      validateRideRequest({
        ...valid,
        pickup: { lat: 1234, lng: 3.39 },
      }),
    );
  });

  it("exposes the underlying schema for direct validation", () => {
    assert.equal(rideRequestSchema.safeParse(valid).success, true);
    assert.equal(
      rideRequestSchema.safeParse({
        ...valid,
        dropoff: { lat: 6.53, lng: 200 },
      }).success,
      false,
    );
  });
});
