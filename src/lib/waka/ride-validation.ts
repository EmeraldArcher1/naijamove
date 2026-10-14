import { z } from 'zod';

// Ride request payload validation used by server-side handlers.
export const rideRequestSchema = z.object({
  clientRequestId: z.string().min(1),
  pickup: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  dropoff: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  passengerCount: z.number().int().positive().optional(),
  fareEstimate: z
    .object({ amount: z.number().nonnegative(), currency: z.string().min(1) })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export type RideRequestInput = z.infer<typeof rideRequestSchema>;

export function validateRideRequest(data: unknown): RideRequestInput {
  return rideRequestSchema.parse(data);
}
