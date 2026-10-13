import { MoneyPath } from "@/components/waka/ledger";
import { Button, Card, FieldLabel, Money } from "@/components/waka/ui";
import { payLabel, placeById, vehicleName } from "@/lib/waka/model";
import { COMPLAINT_LABEL, clock, type ComplaintKind } from "@/lib/waka/safety";
import { useWaka, type LiveTrip } from "@/lib/waka/store";
import { useEffect, useState } from "react";

const REPORTS: ComplaintKind[] = ["theft", "damage", "unsafe", "illegal"];

export function TripView({ trip }: { trip: LiveTrip }) {
  const markPickup = useWaka((s) => s.markPickup);
  const startTrip = useWaka((s) => s.startTrip);
  const cancelTrip = useWaka((s) => s.cancelTrip);
  const completeTrip = useWaka((s) => s.completeTrip);
  const shareTrip = useWaka((s) => s.shareTrip);
  const fileReport = useWaka((s) => s.fileReport);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  const [shareError, setShareError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [kind, setKind] = useState<ComplaintKind>("unsafe");
  const [reportNote, setReportNote] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const [confirmPay, setConfirmPay] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const from = placeById(trip.city, trip.fromId);
  const to = placeById(trip.city, trip.toId);

  useEffect(() => {
    if (trip.phase !== "search") return;
    const timer = window.setTimeout(() => markPickup(), 1200);
    return () => window.clearTimeout(timer);
  }, [trip.phase, trip.id, markPickup]);

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-col gap-3">
        <div>
          <p className="text-sm text-muted">{vehicleName(trip.vehicle)} · {payLabel(trip.pay)}</p>
          <h2 className="mt-1 font-display text-3xl leading-none tracking-tight">
            {trip.phase === "search" && (trip.parcel ? "Finding a car for the parcel" : "Finding a car")}
            {trip.phase === "pickup" && (trip.parcel ? "Parcel pickup is on the way" : "Driver is on the way")}
            {trip.phase === "ontrip" && (trip.parcel ? "Parcel is on the way" : "On the trip")}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {from.name} to {to.name}
            {trip.leaveAt ? ` · reserved for ${trip.leaveAt}` : ""}
            {trip.secondRider ? ` · sharing with ${trip.secondRider}` : ""}
          </p>
        </div>
        <div className="rounded-md bg-sunken px-3 py-3 text-sm">
          <p className="font-medium text-fg">
            {trip.driver.who} · {trip.driver.name}
          </p>
          <p className="mt-1 text-muted">
            {trip.driver.year} {trip.driver.color} {trip.driver.car} · {trip.driver.plate}
          </p>
          <p className="mt-1 text-muted">
            {trip.driver.rating.toFixed(2)} · {trip.driver.trips.toLocaleString("en-NG")} trips · licence, vehicle papers, and criminal-record screen in date
          </p>
        </div>
        <p className="text-sm">
          Trip PIN <span className="font-medium tabular-nums">{trip.code}</span>
        </p>
        <p className="font-display text-3xl leading-none">
          <Money value={trip.quote.riderPays} />
        </p>
      </Card>

      {trip.phase === "pickup" && (
        <Card className="flex flex-col gap-2">
          <FieldLabel>The car does not move until this PIN matches</FieldLabel>
          <input
            inputMode="numeric"
            maxLength={4}
            value={pin}
            aria-label="Trip PIN"
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
          />
          {pinError && <p className="text-sm text-bad">{pinError}</p>}
          <Button full disabled={pin.length !== 4} onClick={() => setPinError(startTrip(pin))}>
            Start trip
          </Button>
          <Button full variant="secondary" onClick={cancelTrip}>
            Cancel · no charge
          </Button>
        </Card>
      )}

      {trip.phase !== "search" && (
        <Card className="flex flex-col gap-2">
          <h3 className="text-lg font-medium">Share this trip</h3>
          <p className="text-sm text-muted">This saves a note on the trip. It does not send a text.</p>
          <input
            value={contact}
            aria-label="Trusted contact"
            placeholder="Name of someone you trust"
            onChange={(e) => setContact(e.target.value)}
            className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
          />
          {shareError && <p className="text-sm text-bad">{shareError}</p>}
          {shared && <p className="text-sm text-good">Note saved on this trip.</p>}
          <Button
            variant="secondary"
            onClick={() => {
              const message = shareTrip(contact);
              setShareError(message);
              setShared(!message);
            }}
          >
            Share trip note
          </Button>
          <a className="press inline-flex h-12 items-center justify-center rounded-md border border-line text-sm font-medium" href="tel:112">
            Emergency: call 112
          </a>
          <p className="text-sm text-muted">
            Your security is your responsibility. NaijaMove does not dispatch police. Call 112 yourself, then file what happened. Damage, theft, and illegal acts sit with the driver.
          </p>
          {!reporting && (
            <Button variant="secondary" onClick={() => setReporting(true)}>
              Report an incident
            </Button>
          )}
          {reporting && (
            <>
              <div className="flex flex-wrap gap-2">
                {REPORTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setKind(item)}
                    className={`press h-10 rounded-md border px-3 text-sm ${kind === item ? "border-ink bg-surface" : "border-transparent bg-sunken text-muted"}`}
                  >
                    {COMPLAINT_LABEL[item]}
                  </button>
                ))}
              </div>
              <input
                value={reportNote}
                aria-label="What happened"
                placeholder="What happened"
                onChange={(e) => setReportNote(e.target.value)}
                className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
              />
              {reportError && <p className="text-sm text-bad">{reportError}</p>}
              <Button
                onClick={() => {
                  const message = fileReport(kind, reportNote);
                  setReportError(message);
                  if (!message) setReporting(false);
                }}
              >
                File report
              </Button>
            </>
          )}
        </Card>
      )}

      {trip.events.length > 0 && (
        <Card className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">Trip record</h3>
          {trip.events.map((event) => (
            <p key={event.id} className="text-sm">
              <span className="tabular-nums text-muted">{clock(event.at)}</span> {event.detail}
            </p>
          ))}
        </Card>
      )}

      {trip.phase === "ontrip" && !confirmPay && (
        <Button full onClick={() => setConfirmPay(true)}>
          Pay and end trip
        </Button>
      )}
      {trip.phase === "ontrip" && confirmPay && (
        <Card className="flex flex-col gap-2">
          <h3 className="text-lg font-medium">Pay NaijaMove · {payLabel(trip.pay)}</h3>
          <p className="font-display text-3xl leading-none tabular-nums">
            <Money value={trip.quote.riderPays} />
          </p>
          <MoneyPath quote={trip.quote} />
          <p className="text-sm text-muted">
            {trip.pay === "wallet"
              ? "NaijaMove takes your seat fare from the test wallet. No bank is charged."
              : "This transfer is booked as paid to NaijaMove. No bank is charged in this preview."}
          </p>
          {payError && <p className="text-sm text-bad">{payError}</p>}
          <Button full onClick={() => setPayError(completeTrip())}>
            Confirm payment
          </Button>
          <Button full variant="secondary" onClick={() => setConfirmPay(false)}>
            Back
          </Button>
        </Card>
      )}
      {trip.phase === "search" && (
        <Button full variant="secondary" onClick={cancelTrip}>
          Cancel request
        </Button>
      )}
    </div>
  );
}
