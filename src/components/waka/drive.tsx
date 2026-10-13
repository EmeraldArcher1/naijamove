import { ReceiptCard } from "@/components/waka/receipt";
import { DriverRules } from "@/components/waka/rules";
import { TripView } from "@/components/waka/trip";
import { Button, Card, Money } from "@/components/waka/ui";
import { naira, payLabel, placeById, vehicleName, carStanding, identityGap } from "@/lib/waka/model";
import { cannotDrive, docsReport, longDate, TERMS_VERSION } from "@/lib/waka/safety";
import { useWaka } from "@/lib/waka/store";

export function DrivePanel() {
  const trip = useWaka((s) => s.trip);
  const last = useWaka((s) => s.lastReceipt);
  const online = useWaka((s) => s.online);
  const requests = useWaka((s) => s.requests);
  const city = useWaka((s) => s.city);
  const goOnline = useWaka((s) => s.goOnline);
  const goOffline = useWaka((s) => s.goOffline);
  const refresh = useWaka((s) => s.refreshRequests);
  const accept = useWaka((s) => s.accept);
  const decline = useWaka((s) => s.decline);
  const receipts = useWaka((s) => s.receipts);
  const prior = useWaka((s) => s.priorDays);
  const driverTerms = useWaka((s) => s.driverTerms);
  const setDriverRules = useWaka((s) => s.setDriverRules);
  const docs = useWaka((s) => s.docs);
  const driverAccount = useWaka((s) => s.driverAccount);
  const suspended = useWaka((s) => s.suspended);
  const standing = carStanding(driverAccount?.carYear, {
    ac: Boolean(driverAccount?.ac),
    clean: Boolean(driverAccount?.clean),
    responsible: Boolean(driverAccount?.responsible),
  });
  const ageBlock = standing.reason ?? identityGap(driverAccount, "driver");
  const waitCheck = driverAccount && !driverAccount.checksCleared ? "The desk has not cleared the NIN, phone, address, and police submission yet." : null;
  const block = cannotDrive({ termsVersion: driverTerms, docs, suspended }) ?? ageBlock ?? waitCheck;
  const papers = docsReport(docs);

  const today = receipts.filter((r) => r.as === "driver" && sameDay(r.at)).reduce((sum, r) => sum + r.quote.driverNet, 0);
  const todayWithSeed = today + (prior[prior.length - 1]?.net ?? 0);

  if (trip?.startedAs === "rider") {
    return (
      <Card>
        <h2 className="font-display text-3xl leading-none tracking-tight">You are on a ride</h2>
        <p className="mt-2 text-sm text-muted">Finish or cancel it on the Ride tab before taking a request. One car, one trip.</p>
      </Card>
    );
  }
  if (trip?.startedAs === "driver") return <TripView trip={trip} />;
  if (last?.as === "driver") return <ReceiptCard receipt={last} />;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-sm text-muted">Today's take-home</p>
        <p className="mt-1 font-display text-4xl leading-none tracking-tight">
          <Money value={todayWithSeed} />
        </p>
        <p className="mt-2 text-sm text-muted">After fuel and wear. Declining a request is free. You see the destination before you accept.</p>
        <div className="mt-4 flex gap-2">
          {online ? (
            <>
              <Button variant="secondary" onClick={goOffline}>
                Go offline
              </Button>
              <Button variant="secondary" onClick={refresh}>
                New requests
              </Button>
            </>
          ) : (
            <Button onClick={goOnline} disabled={Boolean(block)}>
              Go online
            </Button>
          )}
        </div>
      </Card>

      {!online && (
        <Card className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Checks on this car</h2>
          {papers.rows.map((row) => (
            <p key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
              <span>{row.label}</span>
              <span className={row.ok ? "text-good" : "text-bad"}>
                {row.ok ? "In date" : "Expired"} · {longDate(row.until)}
              </span>
            </p>
          ))}
          {standing.helloOnly && (
            <p className="text-sm text-muted">This car takes Hello only. Women and men both drive. Go, Share, and Comfort stay with cars under 10 years.</p>
          )}
          {ageBlock && <p className="text-sm text-bad">{ageBlock}</p>}
          {block && block !== ageBlock && <p className="text-sm text-bad">{block}</p>}
        </Card>
      )}

      {!online && <DriverRules accepted={driverTerms === TERMS_VERSION} onChange={setDriverRules} />}

      {!online && (
        <p className="text-sm text-muted">Go online to see trips priced so the car can still fuel. Commission is 7% of the off-peak fare, not 25%.</p>
      )}

      {online &&
        requests.map((req) => {
          const from = placeById(city, req.fromId);
          const to = placeById(city, req.toId);
          return (
            <Card key={req.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted">
                    {req.rider} · {vehicleName(req.vehicle)} · {payLabel(req.pay)}
                  </p>
                  <h3 className="mt-1 text-lg font-medium leading-snug">
                    {from.name} to {to.name}
                  </h3>
                  <p className="text-sm text-muted">
                    Pickup {req.pickupMin} min · {req.quote.km.toFixed(1)} km · {req.quote.minutes} min
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted">You take home</p>
                <p className="font-display text-4xl leading-none tracking-tight">
                  <Money value={req.quote.driverNet} />
                </p>
                <p className={`mt-2 text-sm ${req.quote.driverGains >= 0 ? "text-good" : "text-warn"}`}>
                  {naira(Math.abs(req.quote.driverGains))} {req.quote.driverGains >= 0 ? "more" : "less"} than a 25% commission on this route
                </p>
              </div>
              <p className="text-sm text-muted">
                Collected <Money value={req.quote.collected} /> · NaijaMove <Money value={req.quote.platformNet} /> · fuel <Money value={req.quote.fuelCost} /> · wear <Money value={req.quote.wearCost} />
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => decline(req.id)}>
                  Decline
                </Button>
                <Button onClick={() => accept(req.id)}>Accept</Button>
              </div>
            </Card>
          );
        })}
    </div>
  );
}

function sameDay(at: number): boolean {
  const a = new Date(at);
  const b = new Date();
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
