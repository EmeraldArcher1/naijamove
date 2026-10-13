import { Button, Card, Money } from "@/components/waka/ui";
import { naira, PASS_PRICE, payLabel, placeById, PUMP_SAVE_PER_L, vehicleName } from "@/lib/waka/model";
import { useWaka } from "@/lib/waka/store";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function WalletPanel() {
  const role = useWaka((s) => s.role);
  const wallet = useWaka((s) => s.wallet);
  const pass = useWaka((s) => s.pass);
  const pump = useWaka((s) => s.pump);
  const petrol = useWaka((s) => s.petrol);
  const receipts = useWaka((s) => s.receipts);
  const prior = useWaka((s) => s.priorDays);
  const buyPass = useWaka((s) => s.buyPass);
  const topUp = useWaka((s) => s.topUp);
  const setPump = useWaka((s) => s.setPump);
  const setPetrol = useWaka((s) => s.setPetrol);
  const resetDemo = useWaka((s) => s.resetDemo);
  const companyHeld = useWaka((s) => s.companyHeld);
  const driverOwed = useWaka((s) => s.driverOwed);
  const driverPaid = useWaka((s) => s.driverPaid);
  const payments = useWaka((s) => s.payments);

  const todayNet = receipts.filter((r) => r.as === "driver" && sameDay(r.at)).reduce((sum, r) => sum + r.quote.driverNet, 0);
  const chart = prior.map((day, i) => ({
    label: day.label,
    net: i === prior.length - 1 ? day.net + todayNet : day.net,
  }));
  const kept = payments.filter((p) => p.kind === "fare").reduce((sum, p) => sum + p.kept, 0);

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-sm text-muted">{role === "driver" ? "Paid to you by NaijaMove" : "Rider wallet"}</p>
        <p className="mt-1 font-display text-4xl leading-none tracking-tight">
          <Money value={role === "driver" ? driverPaid : wallet} />
        </p>
        {role === "rider" && (
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={topUp}>
              Add ₦5,000
            </Button>
          </div>
        )}
        <p className="mt-3 text-sm text-muted">
          {role === "rider"
            ? "Test naira on this phone, so you can pay NaijaMove before a bank is connected. Adding ₦5,000 does not charge a card. The driver never collects this fare."
            : `NaijaMove still owes you ${naira(driverOwed)} from fares the company has collected. The desk sends that payout.`}
        </p>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Company book</h2>
        <p className="flex justify-between text-sm">
          <span>Held by NaijaMove</span>
          <Money value={companyHeld} />
        </p>
        <p className="flex justify-between text-sm">
          <span>Owed to the driver</span>
          <Money value={driverOwed} />
        </p>
        <p className="flex justify-between text-sm">
          <span>Kept after driver pay</span>
          <Money value={kept} />
        </p>
        {payments.length === 0 && <p className="text-sm text-muted">A finished trip writes the first line.</p>}
        {payments.slice(0, 6).map((p) => (
          <p key={p.id} className="border-t border-line pt-2 text-sm">
            {p.kind === "payout"
              ? `Payout to ${p.driver}`
              : `${p.code} · ${p.payer} paid ${payLabel(p.method)} · driver due ${naira(p.driverDue)}`}
          </p>
        ))}
      </Card>

      {role === "driver" && (
        <Card>
          <p className="text-sm text-muted">Take-home this week</p>
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barCategoryGap="28%">
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
                <YAxis hide />
                <Bar dataKey="net" fill="var(--color-steel)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted">Earlier days are a sample week. Today includes trips you finish while driving.</p>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">NaijaMove Plus</h2>
            <p className="mt-1 text-sm text-muted">
              {naira(PASS_PRICE)} a month. Rides are 10% off, and the driver is still paid the full fare. The discount comes from Plus, not from the car. Hurry matching is included.
            </p>
          </div>
        </div>
        {pass ? (
          <p className="text-sm font-medium text-good">Plus is active on this phone.</p>
        ) : (
          <Button onClick={buyPass} disabled={wallet < PASS_PRICE}>
            Get Plus · {naira(PASS_PRICE)}
          </Button>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Partner pump</h2>
          <span className="text-sm tabular-nums text-muted">{naira(petrol)}/L street</span>
        </div>
        <p className="text-sm text-muted">
          Drivers who fuel at a partner station save ₦{PUMP_SAVE_PER_L}/L. The station pays NaijaMove ₦15/L. The rider's fare does not drop, so the saving stays with the car.
        </p>
        <input
          aria-label="Street petrol price"
          type="range"
          min={850}
          max={1500}
          step={10}
          value={petrol}
          onChange={(e) => setPetrol(Number(e.target.value))}
        />
        <Button variant={pump ? "primary" : "secondary"} onClick={() => setPump(!pump)}>
          {pump ? "Fueling at a partner pump" : "Use street price only"}
        </Button>
      </Card>

      <Card>
        <h2 className="text-lg font-medium">Recent trips</h2>
        {receipts.length === 0 && <p className="mt-2 text-sm text-muted">Completed trips will show here.</p>}
        <ul className="mt-2 flex flex-col">
          {receipts.slice(0, 6).map((r) => {
            const from = placeById(r.city, r.fromId);
            const to = placeById(r.city, r.toId);
            return (
              <li key={r.id} className="flex items-baseline justify-between gap-3 border-t border-line py-3 text-sm first:border-t-0">
                <span className="min-w-0">
                  <span className="block truncate text-fg">
                    {from.name} to {to.name}
                  </span>
                  <span className="text-muted">
                    {vehicleName(r.vehicle)} · {payLabel(r.pay)} · {r.as === "driver" ? "drove" : "rode"}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  <Money value={r.as === "driver" ? r.quote.driverNet : r.quote.riderPays} />
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <button type="button" className="h-11 text-sm text-muted underline-offset-2 hover:underline" onClick={resetDemo}>
        Reset this preview
      </button>
    </div>
  );
}

function sameDay(at: number): boolean {
  const a = new Date(at);
  const b = new Date();
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
