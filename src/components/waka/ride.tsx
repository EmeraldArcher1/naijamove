import { Ledger } from "@/components/waka/ledger";
import { ReceiptCard } from "@/components/waka/receipt";
import { RideRules } from "@/components/waka/rules";
import { TripView } from "@/components/waka/trip";
import { Button, Card, FieldLabel } from "@/components/waka/ui";
import { cn } from "@/lib/cn";
import {
  CITIES,
  naira,
  placeById,
  quoteTrip,
  roadKm,
  tripMinutes,
  offerBounds,
  VEHICLE_ORDER,
  vehicleBlurb,
  vehicleName,
  type VehicleId,
} from "@/lib/waka/model";
import { TERMS_VERSION } from "@/lib/waka/safety";
import { useWaka } from "@/lib/waka/store";
import { useMemo, useState } from "react";

export function RidePanel() {
  const trip = useWaka((s) => s.trip);
  const last = useWaka((s) => s.lastReceipt);
  const city = useWaka((s) => s.city);
  const fromId = useWaka((s) => s.fromId);
  const toId = useWaka((s) => s.toId);
  const vehicle = useWaka((s) => s.vehicle);
  const petrol = useWaka((s) => s.petrol);
  const pump = useWaka((s) => s.pump);
  const pass = useWaka((s) => s.pass);
  const hurry = useWaka((s) => s.hurry);
  const trafficPreview = useWaka((s) => s.trafficPreview);
  const pay = useWaka((s) => s.pay);
  const wallet = useWaka((s) => s.wallet);
  const setFrom = useWaka((s) => s.setFrom);
  const setTo = useWaka((s) => s.setTo);
  const setVehicle = useWaka((s) => s.setVehicle);
  const setPetrol = useWaka((s) => s.setPetrol);
  const setHurry = useWaka((s) => s.setHurry);
  const setTrafficPreview = useWaka((s) => s.setTrafficPreview);
  const setPay = useWaka((s) => s.setPay);
  const offer = useWaka((s) => s.offer);
  const setOffer = useWaka((s) => s.setOffer);
  const parcel = useWaka((s) => s.parcel);
  const leaveAt = useWaka((s) => s.leaveAt);
  const setParcel = useWaka((s) => s.setParcel);
  const setLeaveAt = useWaka((s) => s.setLeaveAt);
  const requestRide = useWaka((s) => s.requestRide);
  const riderTerms = useWaka((s) => s.riderTerms);
  const setRiderRules = useWaka((s) => s.setRiderRules);
  const rulesOn = riderTerms === TERMS_VERSION;
  const [error, setError] = useState<string | null>(null);

  const traffic = trafficPreview ?? false;
  const places = CITIES[city].places;
  const from = placeById(city, fromId);
  const to = placeById(city, toId);
  const same = fromId === toId;
  const km = same ? 0 : roadKm(from, to);
  const minutes = same ? 0 : tripMinutes(km, traffic);

  const quotes = useMemo(() => {
    if (same) return null;
    return Object.fromEntries(
      VEHICLE_ORDER.map((id) => [
        id,
        quoteTrip({ vehicle: id, km, minutes, petrol, traffic, hurry, pump, pass }),
      ]),
    ) as Record<VehicleId, ReturnType<typeof quoteTrip>>;
  }, [same, km, minutes, petrol, traffic, hurry, pump, pass]);

  const quote = quotes?.[vehicle] ?? null;

  if (trip && trip.startedAs === "rider") return <TripView trip={trip} />;
  if (last && last.as === "rider") return <ReceiptCard receipt={last} />;

  return (
    <div className="flex flex-col gap-3">
      <Card className="overflow-hidden p-0">
        <div className="flex gap-3 px-4 pt-4">
          <div className="flex w-3 flex-col items-center pt-4" aria-hidden="true">
            <span className="size-2.5 rounded-full border-2 border-ink bg-surface" />
            <span className="w-px flex-1 bg-line" />
            <span className="size-2.5 bg-ink" />
          </div>
          <div className="min-w-0 flex-1">
            <PlaceField label="Pickup" value={fromId} places={places} onChange={setFrom} />
            <div className="my-1 h-px bg-line" />
            <PlaceField label="Where to" value={toId} places={places} onChange={setTo} />
          </div>
        </div>
        <p className="px-4 py-3 text-sm text-muted">
          {same ? "Choose a pickup and a different destination." : `${km.toFixed(1)} km · about ${minutes} min`}
        </p>
        <div className="grid grid-cols-2 border-t border-line">
          <button
            type="button"
            className={cn("press h-12 text-sm font-medium", !leaveAt ? "bg-ink text-ink-fg" : "text-muted")}
            onClick={() => setLeaveAt(null)}
          >
            Pickup now
          </button>
          <button
            type="button"
            className={cn("press h-12 text-sm font-medium", leaveAt ? "bg-ink text-ink-fg" : "text-muted")}
            onClick={() => setLeaveAt(leaveAt ?? "18:00")}
          >
            Leave later
          </button>
        </div>
        {leaveAt && (
          <label className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
            Pickup time
            <input
              type="time"
              value={leaveAt}
              aria-label="Pickup time"
              onChange={(e) => setLeaveAt(e.target.value || null)}
              className="h-11 rounded-md border border-line bg-bg px-3 text-base text-fg"
            />
          </label>
        )}
        <div className="grid grid-cols-2 border-t border-line">
          <button
            type="button"
            className={cn("press h-12 text-sm font-medium", !parcel ? "text-fg" : "text-muted")}
            onClick={() => setParcel(false)}
          >
            Ride
          </button>
          <button
            type="button"
            className={cn("press h-12 text-sm font-medium", parcel ? "text-fg" : "text-muted")}
            onClick={() => setParcel(true)}
          >
            Parcel
          </button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel>Fuel index</FieldLabel>
          <span className="text-sm font-medium tabular-nums text-fg">{naira(petrol)}/L</span>
        </div>
        <input
          aria-label="Petrol price per litre"
          type="range"
          min={850}
          max={1500}
          step={10}
          value={petrol}
          onChange={(e) => setPetrol(Number(e.target.value))}
        />
        <p className="text-sm text-muted">The fare moves only with the litres this trip burns. It is not a surge.</p>
      </Card>

      {quotes && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {VEHICLE_ORDER.map((id) => {
            const q = quotes[id];
            const on = id === vehicle;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setVehicle(id)}
                className={cn(
                  "press flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0",
                  on && "bg-sunken",
                )}
              >
                <span className={cn("size-2.5 shrink-0 rounded-full border-2", on ? "border-ink bg-ink" : "border-line")} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-fg">{vehicleName(id)}</span>
                  <span className="block text-sm text-muted">
                    {vehicleBlurb(id)} · about {q.minutes} min
                  </span>
                </span>
                <span className="shrink-0 text-base font-medium tabular-nums">{naira(q.riderPays)}</span>
              </button>
            );
          })}
        </div>
      )}

      {quote && vehicle === "keke" && quote.km > 8 && (
        <p className="text-sm text-warn">Keke is built for hops under 8 km, and only where the local council allows it.</p>
      )}
      {quote && parcel && (
        <p className="text-sm text-muted">A parcel uses the same locked fare. The driver carries it. You still pay NaijaMove, not the driver.</p>
      )}
      {quote && vehicle === "hello" && (
        <p className="text-sm text-muted">
          Hello is a clean car older than 10 years, with the air conditioner on. Women and men both drive it. The fare stays under a newer Go.
        </p>
      )}
      {quote && vehicle === "share" && (
        <p className="text-sm text-muted">
          Share is 63% of a Go fare, each. Two seats pay the car more than a solo trip, and each rider still pays less than the usual app.
        </p>
      )}

      {quote && (
        <Card className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel>Fair fare</FieldLabel>
            <span className="text-sm font-medium tabular-nums">{naira(offer == null ? quote.riderPays : Math.min(offerBounds(quote).ceiling, Math.max(offerBounds(quote).floor, offer)))}</span>
          </div>
          <input
            aria-label="Fare offer"
            type="range"
            min={offerBounds(quote).floor}
            max={offerBounds(quote).ceiling}
            step={50}
            value={offer == null ? quote.riderPays : Math.min(offerBounds(quote).ceiling, Math.max(offerBounds(quote).floor, offer))}
            onChange={(e) => setOffer(Number(e.target.value))}
          />
          <p className="text-sm text-muted">
            The recommended fare is locked before you request. You can add up to 15% for a faster match. You cannot bid the driver down below {naira(offerBounds(quote).floor)}.
          </p>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Toggle on={traffic} onClick={() => setTrafficPreview(traffic ? false : true)}>
          {traffic ? "Traffic window on" : "Traffic window off"}
        </Toggle>
        <Toggle on={hurry} onClick={() => setHurry(!hurry)}>
          {pass && hurry ? "Hurry included with Plus" : hurry ? "Hurry · ₦150" : "Add hurry"}
        </Toggle>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["wallet", "transfer"] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPay(method)}
            className={cn(
              "press h-11 rounded-md border text-sm font-medium",
              (pay === "wallet" ? "wallet" : "transfer") === method
                ? "border-ink bg-surface text-fg"
                : "border-transparent bg-sunken text-muted",
            )}
          >
            {method === "transfer" ? "Transfer" : "Wallet"}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">
        {pay === "wallet"
          ? `Paid to NaijaMove from your wallet. Balance ${naira(wallet)}.`
          : "Paid to NaijaMove by transfer when the trip ends. The driver is paid by the company, not by you."}
      </p>

      {error && <p className="text-sm text-bad">{error}</p>}

      <RideRules accepted={rulesOn} onChange={setRiderRules} />

      <div className="pt-1">
        <Button
          full
          disabled={!quote || !rulesOn}
          onClick={() => {
            const message = requestRide();
            setError(message);
          }}
        >
          {quote
            ? `${parcel ? "Send" : "Request"} ${vehicleName(vehicle)} · ${naira(offer == null ? quote.riderPays : Math.min(offerBounds(quote).ceiling, Math.max(offerBounds(quote).floor, offer)))}`
            : "Pick a route"}
        </Button>
      </div>

      {quote && (
        <div className="lg:hidden">
          <Ledger quote={quote} />
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press h-11 rounded-full border px-4 text-sm font-medium",
        on ? "border-ink bg-ink text-ink-fg" : "border-line bg-surface text-fg",
      )}
      aria-pressed={on}
    >
      {children}
    </button>
  );
}

function PlaceField({
  label,
  value,
  places,
  onChange,
}: {
  label: string;
  value: string;
  places: { id: string; name: string; area: string }[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = places.find((p) => p.id === value);
  const filtered = places.filter((p) => `${p.name} ${p.area}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <button
        type="button"
        className="press mt-1 flex h-12 w-full items-center justify-between rounded-md border border-line bg-bg px-3 text-left text-base text-fg"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="truncate">{current ? current.name : "Choose"}</span>
        <span className="shrink-0 text-sm text-muted">{current?.area}</span>
      </button>
      {open && (
        <div className="mt-2 rounded-md border border-line bg-surface p-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-11 w-full rounded-sm border border-line bg-bg px-3 text-base text-fg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel"
            aria-label={`Search ${label.toLowerCase()}`}
          />
          <ul className="mt-2 max-h-52 overflow-auto">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between rounded-sm px-2 text-left hover:bg-sunken"
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span>{p.name}</span>
                  <span className="text-sm text-muted">{p.area}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-2 py-3 text-sm text-muted">No match in this city.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
