import { BooksPanel } from "@/components/waka/books";
import { GuidePanel } from "@/components/waka/guide";
import { SafetyPanel } from "@/components/waka/safety";
import { Button, Card, Money } from "@/components/waka/ui";
import { naira, placeById, vehicleName } from "@/lib/waka/model";
import { useWaka } from "@/lib/waka/store";
import { useState } from "react";

export function AdminPanel() {
  const trip = useWaka((s) => s.trip);
  const receipts = useWaka((s) => s.receipts);
  const online = useWaka((s) => s.online);
  const goOffline = useWaka((s) => s.goOffline);
  const city = useWaka((s) => s.city);
  const payments = useWaka((s) => s.payments);
  const companyHeld = useWaka((s) => s.companyHeld);
  const driverOwed = useWaka((s) => s.driverOwed);
  const settleDriver = useWaka((s) => s.settleDriver);
  const driverAccount = useWaka((s) => s.driverAccount);
  const clearChecks = useWaka((s) => s.clearChecks);
  const [checkNote, setCheckNote] = useState<string | null>(null);
  const kept = payments.filter((p) => p.kind === "fare").reduce((sum, p) => sum + p.kept, 0);

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="font-display text-3xl leading-none tracking-tight">Desk</h2>
        <p className="mt-2 text-sm text-muted">
          {online ? "A driver is online on this phone." : "No driver is online on this phone."}{" "}
          {trip ? `Live trip ${trip.code} is in ${trip.phase}.` : "No live trip."}
        </p>
        {online && (
          <Button className="mt-3" variant="secondary" onClick={goOffline}>
            Take driver offline
          </Button>
        )}
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Identity</h2>
        {!driverAccount && <p className="text-sm text-muted">No driver account on this phone yet.</p>}
        {driverAccount && (
          <>
            <p className="text-sm">
              {driverAccount.name} · {driverAccount.gender || "Gender not set"} · {driverAccount.phone}
            </p>
            <p className="text-sm text-muted">NIN {driverAccount.nin || "missing"} · {driverAccount.address || "no address"}</p>
            <p className="text-sm text-muted">
              {driverAccount.carMake} {driverAccount.carYear ?? ""} · {driverAccount.plate}
              {driverAccount.ac ? " · AC" : " · no AC"}
              {driverAccount.clean ? " · clean" : ""}
            </p>
            <p className="text-sm">{driverAccount.checksCleared ? "NIN and police submission cleared on this desk." : "Waiting for a desk clearance. This preview does not call the police."}</p>
            {checkNote && <p className="text-sm text-bad">{checkNote}</p>}
            <Button
              variant="secondary"
              disabled={driverAccount.checksCleared}
              onClick={() => setCheckNote(clearChecks())}
            >
              Clear NIN and police check
            </Button>
          </>
        )}
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Payments</h2>
        <p className="flex justify-between text-sm">
          <span>Held by NaijaMove</span>
          <Money value={companyHeld} />
        </p>
        <p className="flex justify-between text-sm">
          <span>Owed to the driver</span>
          <Money value={driverOwed} />
        </p>
        <p className="flex justify-between text-sm">
          <span>Kept on fares</span>
          <Money value={kept} />
        </p>
        {payments.length === 0 && <p className="text-sm text-muted">No fare has been paid in yet.</p>}
        {payments.slice(0, 8).map((p) => (
          <p key={p.id} className="text-sm">
            {p.kind === "payout" ? `Payout ${naira(p.driverDue)} to ${p.driver}` : `${p.code} · ${p.payer} paid ${naira(p.paidIn)}`}
          </p>
        ))}
        <Button variant="secondary" disabled={driverOwed <= 0} onClick={settleDriver}>
          Pay the driver
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Trips on record</h2>
        {receipts.length === 0 && <p className="text-sm text-muted">None yet.</p>}
        {receipts.slice(0, 8).map((receipt) => {
          const from = placeById(receipt.city, receipt.fromId);
          const to = placeById(receipt.city, receipt.toId);
          return (
            <p key={receipt.id} className="text-sm">
              {from.name} to {to.name} · {vehicleName(receipt.vehicle)} · {receipt.driverName} · {receipt.plate}
              {receipt.rating ? ` · ${receipt.rating} stars` : ""}
            </p>
          );
        })}
        <p className="text-sm text-faint">City filter is {city}. Records stay on this phone.</p>
      </Card>

      <SafetyPanel />
      <BooksPanel />
      <GuidePanel platform="admin" />
    </div>
  );
}
