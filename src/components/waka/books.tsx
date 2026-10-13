import { Card, Money } from "@/components/waka/ui";
import { MONTHLY_RUNNING_COST, monthlyBooks, naira, quoteTrip } from "@/lib/waka/model";
import { useWaka } from "@/lib/waka/store";
import { useState } from "react";

export function BooksPanel() {
  const petrol = useWaka((s) => s.petrol);
  const [trips, setTrips] = useState(1600);
  const [passes, setPasses] = useState(500);
  const [litres, setLitres] = useState(9000);

  const sample = quoteTrip({
    vehicle: "go",
    km: 8,
    minutes: 20,
    petrol,
    traffic: false,
    hurry: false,
    pump: false,
    pass: false,
  });
  const books = monthlyBooks({
    tripsPerDay: trips,
    passes,
    litresPerDay: litres,
    perTripFee: sample.platformNet,
  });

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-sm font-medium text-muted">Why this exists</p>
        <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight">The company has to last, without parking the cars.</h2>
        <p className="mt-3 text-sm text-muted">
          Uber ended Nigerian trips on 2 September 2026. Drivers still on Bolt and inDrive have been logging off: commissions around 25%, fares near ₦200 a kilometre, and petrol above ₦1,000 a litre. One published day of ₦60,000 gross left about ₦800 after commission, fuel, food, and vehicle remittance.
        </p>
      </Card>

      <Card className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">What those apps get wrong</h3>
        <Rule
          title="The cut is the product"
          body="25% to 38% of a thin fare. NaijaMove keeps 7% of the off-peak fare, ring-fenced for running the service. The weekday traffic window is 12% and the driver keeps every naira of it."
        />
        <Rule
          title="Fares froze, or riders bid them down"
          body="inDrive-style bidding races to the bottom. NaijaMove publishes one price. It moves only when the pump moves, by the litres the trip actually burns. No silent surge."
        />
        <Rule
          title="Promos and blind trips land on the driver"
          body="Discounts are not taken from the car. Destination and take-home are shown before accept. Declining is free. The rider pays NaijaMove, and the company pays the driver."
        />
        <Rule
          title="A 7% fee cannot fund the company alone"
          body="Trip fees cover operations. Plus subscriptions, partner fuel, and the same cars carrying a second rider pay for the business. Driver pay is not the margin."
        />
      </Card>

      <Card>
        <p className="text-sm text-muted">A month at today's fuel</p>
        <p className={`mt-1 font-display text-4xl leading-none tracking-tight ${books.profit >= 0 ? "text-fg" : "text-bad"}`}>
          <Money value={books.profit} />
        </p>
        <p className="mt-2 text-sm text-muted">
          Left after {naira(MONTHLY_RUNNING_COST)} for team, support, payouts, and servers. An 8 km Go trip fees NaijaMove {naira(sample.platformNet)} and still leaves the driver {naira(sample.driverGains)} ahead of a 25% app.
        </p>
        <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-3 text-sm">
          <Row label="Trip fees" value={books.tripRevenue} />
          <Row label="NaijaMove Plus" value={books.passRevenue} />
          <Row label="Partner pumps" value={books.pumpRevenue} />
          <Row label="Income" value={books.total} />
        </dl>
      </Card>

      <Card className="flex flex-col gap-4">
        <Slider label="Trips a day" value={trips} min={200} max={4000} step={50} onChange={setTrips} />
        <Slider label="Active passes" value={passes} min={0} max={4000} step={50} onChange={setPasses} />
        <Slider label="Partner litres a day" value={litres} min={0} max={30000} step={500} onChange={setLitres} />
        <p className="text-sm text-muted">
          Drop the trips and the month can go red. That is the point. A 7% company lasts on volume, Plus, and pumps — not by putting the commission back up when fuel rises.
        </p>
      </Card>
    </div>
  );
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-medium text-fg">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums text-fg">
        <Money value={value} />
      </dd>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium tabular-nums text-fg">{value.toLocaleString("en-NG")}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
