import { Card, FieldLabel, Money } from "@/components/waka/ui";
import { fareSplit, naira, vehicleName, type Quote } from "@/lib/waka/model";
import { useWaka } from "@/lib/waka/store";

export function Ledger({ quote }: { quote: Quote }) {
  const riderWord = quote.riderSaves >= 0 ? "You pay less" : "You pay more";
  const driverWord = quote.driverGains >= 0 ? "Driver keeps more" : "Driver keeps less";
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <FieldLabel>This {vehicleName(quote.vehicle).toLowerCase()} trip</FieldLabel>
        <p className="mt-1 font-display text-4xl leading-none tracking-tight text-fg">
          <Money value={quote.riderPays} />
        </p>
        <p className="mt-2 text-sm text-muted">
          {quote.km.toFixed(1)} km · {quote.minutes} min
          {quote.vehicle === "share" ? " · you pay this, a second rider pays the same seat price" : ""}
        </p>
      </div>
      <MoneyPath quote={quote} />
      <dl className="grid grid-cols-2 gap-3">
        <Compare
          label={riderWord}
          waka={quote.riderPays}
          usual={quote.usualRider}
          note={quote.riderSaves >= 0 ? `${naira(quote.riderSaves)} under usual` : `${naira(Math.abs(quote.riderSaves))} over a frozen fare`}
          good={quote.riderSaves >= 0}
        />
        <Compare
          label={driverWord}
          waka={quote.driverNet}
          usual={quote.usualNet}
          note="after fuel and wear"
          good={quote.driverGains >= 0}
        />
      </dl>
      <div className="flex flex-col gap-2 border-t border-line pt-3 text-sm">
        <Line label="Usual app keeps" value={quote.usualPlatform} />
        <Line label="Fuel" value={-quote.fuelCost} />
        <Line label="Wear" value={-quote.wearCost} />
        <Line label="Driver take-home" value={quote.driverNet} strong />
      </div>
      <p className="text-sm text-muted">
        {quote.traffic
          ? `Traffic window adds ${naira(quote.trafficUplift)}, and the driver keeps all of it. NaijaMove does not commission that slice.`
          : "Off-peak. A weekday traffic window (07:00–09:00, 16:00–19:00) adds 12%, paid entirely to the driver."}
        {quote.pass ? " Plus takes 10% off what you pay. The driver still receives the full fare. The subscription covers the difference." : ""}
        {quote.fuelDelta > 0 ? ` Petrol is above ₦1,000/L, so ${naira(quote.fuelDelta)} of fuel was added. Not a surge.` : ""}
        {quote.fuelDelta < 0 ? ` Petrol is under ₦1,000/L, so the fare fell by ${naira(Math.abs(quote.fuelDelta))}.` : ""}
        {quote.pump ? ` Partner pump saves the driver ₦40/L. The station pays NaijaMove ${naira(quote.pumpPlatform)} on the side.` : ""}
      </p>
    </Card>
  );
}

export function MoneyPath({ quote }: { quote: Quote }) {
  const held = useWaka((s) => s.companyHeld);
  const owed = useWaka((s) => s.driverOwed);
  const split = fareSplit(quote);
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3 text-sm">
      <p className="font-medium text-fg">Where this fare goes</p>
      <Line label="You pay NaijaMove" value={split.youPay} strong />
      {split.seats === 2 && <Line label="Second rider pays NaijaMove" value={split.youPay} />}
      <Line label="Company keeps" value={split.kept} />
      <Line label="Owed to the driver" value={split.driverDue} />
      <Line label="Company balance now" value={held} />
      <Line label="Company balance after this fare" value={held + split.paidIn} />
      <Line label="Still owed to drivers" value={owed} />
    </div>
  );
}

function Compare({
  label,
  waka,
  usual,
  note,
  good,
}: {
  label: string;
  waka: number;
  usual: number;
  note: string;
  good: boolean;
}) {
  return (
    <div className="rounded-md bg-sunken px-3 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl leading-none text-fg">
        <Money value={waka} />
      </p>
      <p className={`mt-2 text-sm ${good ? "text-good" : "text-warn"}`}>{note}</p>
      <p className="mt-1 text-sm text-faint tabular-nums">Usual {naira(usual)}</p>
    </div>
  );
}

function Line({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${strong ? "font-medium text-fg" : "text-muted"}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums text-fg">
        <Money value={value} />
      </dd>
    </div>
  );
}
