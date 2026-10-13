import { AdminPanel } from "@/components/waka/admin";
import { BooksPanel } from "@/components/waka/books";
import { DrivePanel } from "@/components/waka/drive";
import { GuidePanel } from "@/components/waka/guide";
import { Ledger } from "@/components/waka/ledger";
import { RidePanel } from "@/components/waka/ride";
import { SafetyPanel } from "@/components/waka/safety";
import { Button } from "@/components/waka/ui";
import { WalletPanel } from "@/components/waka/wallet";
import { cn } from "@/lib/cn";
import {
  CITIES,
  naira,
  placeById,
  quoteTrip,
  roadKm,
  tripMinutes,
  type CityId,
} from "@/lib/waka/model";
import { ADMIN_KEY } from "@/lib/waka/safety";
import { useWaka, type Platform, type Tab } from "@/lib/waka/store";
import { BookOpen, CarFront, CircleHelp, Navigation, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const TABS: { id: Tab; label: string; icon: typeof Navigation; platforms: Platform[] }[] = [
  { id: "ride", label: "Ride", icon: Navigation, platforms: ["rider"] },
  { id: "drive", label: "Drive", icon: CarFront, platforms: ["driver"] },
  { id: "wallet", label: "Wallet", icon: Wallet, platforms: ["rider", "driver"] },
  { id: "safety", label: "Safety", icon: ShieldCheck, platforms: ["rider", "driver"] },
  { id: "books", label: "Books", icon: BookOpen, platforms: ["driver"] },
  { id: "guide", label: "Guide", icon: CircleHelp, platforms: ["rider", "driver"] },
];

export function WakaApp() {
  const tab = useWaka((s) => s.tab);
  const setTab = useWaka((s) => s.setTab);
  const platform = useWaka((s) => s.platform);
  const enterPlatform = useWaka((s) => s.enterPlatform);
  const leavePlatform = useWaka((s) => s.leavePlatform);
  const riderAccount = useWaka((s) => s.riderAccount);
  const driverAccount = useWaka((s) => s.driverAccount);
  const city = useWaka((s) => s.city);
  const setCity = useWaka((s) => s.setCity);
  const petrol = useWaka((s) => s.petrol);
  const trip = useWaka((s) => s.trip);
  const ready = useWaka((s) => s.ready);
  const setReady = useWaka((s) => s.setReady);
  const fromId = useWaka((s) => s.fromId);
  const toId = useWaka((s) => s.toId);
  const vehicle = useWaka((s) => s.vehicle);
  const pump = useWaka((s) => s.pump);
  const pass = useWaka((s) => s.pass);
  const hurry = useWaka((s) => s.hurry);
  const trafficPreview = useWaka((s) => s.trafficPreview);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.resolve(useWaka.persist.rehydrate()).then(() => setReady(true));
  }, [setReady]);

  useEffect(() => {
    if (!ready || trip) return;
    if (platform === "rider" && !riderAccount) leavePlatform();
    if (platform === "driver" && !driverAccount) leavePlatform();
  }, [ready, trip, platform, riderAccount, driverAccount, leavePlatform]);

  const traffic = trafficPreview ?? false;
  const tabs = TABS.filter((item) => item.platforms.includes(platform));
  const quote = useMemo(() => {
    if (fromId === toId) return null;
    const from = placeById(city, fromId);
    const to = placeById(city, toId);
    const km = roadKm(from, to);
    return quoteTrip({
      vehicle,
      km,
      minutes: tripMinutes(km, traffic),
      petrol,
      traffic,
      hurry,
      pump,
      pass,
    });
  }, [city, fromId, toId, vehicle, petrol, traffic, hurry, pump, pass]);

  if (platform === "gate") {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8">
          <header>
            <h1 className="font-display text-4xl leading-none tracking-tight">NaijaMove</h1>
            <p className="mt-2 text-sm text-muted">Fair fares. Drivers keep more. Customers and drivers use separate platforms.</p>
          </header>
          <Gate onEnter={enterPlatform} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div
        className={cn(
          "mx-auto grid w-full max-w-5xl gap-8 px-4 pt-6 pb-28 lg:px-6 lg:pt-10 lg:pb-10",
          platform === "rider" && "lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]",
        )}
      >
        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-4xl leading-none tracking-tight">NaijaMove</h1>
              <p className="mt-2 text-sm text-muted">Fair fares. Drivers keep more.</p>
            </div>
            <CitySwitch city={city} locked={Boolean(trip)} onChange={setCity} />
          </header>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {platform === "admin"
                ? "Desk"
                : platform === "driver"
                  ? driverAccount
                    ? `Driver · ${driverAccount.name}`
                    : "Driver platform"
                  : riderAccount
                    ? `Customer · ${riderAccount.name}`
                    : "Customer platform"}{" "}
              · {CITIES[city].name} · fuel {naira(petrol)}/L
            </p>
            <LeaveButton
              onLeave={() => {
                setLeaveError(leavePlatform());
              }}
            />
          </div>
          {leaveError && <p className="text-sm text-bad">{leaveError}</p>}

          {platform !== "admin" && (
            <nav className={cn("hidden gap-2 lg:grid", tabs.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")} aria-label="Sections">
              {tabs.map((item) => (
                <TabButton key={item.id} item={item} current={tab} onSelect={setTab} />
              ))}
            </nav>
          )}

          {platform === "admin" && <AdminPanel />}
          {platform !== "admin" && tab === "ride" && <RidePanel />}
          {platform !== "admin" && tab === "drive" && <DrivePanel />}
          {platform !== "admin" && tab === "wallet" && <WalletPanel />}
          {platform !== "admin" && tab === "safety" && <SafetyPanel />}
          {platform !== "admin" && tab === "books" && <BooksPanel />}
          {platform !== "admin" && tab === "guide" && <GuidePanel platform={platform} />}

          <p className="text-sm text-faint">
            Working preview for Lagos, Abuja, and Port Harcourt. Fares are real math on sample trips, not live cars.
          </p>
        </div>

        {platform === "rider" && (
          <aside className="hidden min-w-0 lg:block">
          <div className="sticky top-6 flex flex-col gap-3">
            {quote ? <Ledger quote={quote} /> : <EmptyLedger />}
            <SideNote />
          </div>
        </aside>
        )}
      </div>

      {platform !== "admin" && (
        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
          aria-label="Sections"
        >
          <div className={cn("mx-auto grid max-w-lg gap-1", tabs.length === 5 ? "grid-cols-5" : "grid-cols-4")}>
            {tabs.map((item) => (
              <TabButton key={item.id} item={item} current={tab} onSelect={setTab} />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

function CitySwitch({
  city,
  locked,
  onChange,
}: {
  city: CityId;
  locked: boolean;
  onChange: (city: CityId) => void;
}) {
  return (
    <label className="shrink-0 text-sm">
      <span className="sr-only">City</span>
      <select
        className="h-11 rounded-md border border-line bg-surface px-3 text-fg disabled:opacity-40"
        value={city}
        disabled={locked}
        onChange={(e) => onChange(e.target.value as CityId)}
      >
        {(Object.keys(CITIES) as CityId[]).map((id) => (
          <option key={id} value={id}>
            {CITIES[id].name}
          </option>
        ))}
      </select>
    </label>
  );
}

function LeaveButton({ onLeave }: { onLeave: () => void }) {
  return (
    <button type="button" onClick={onLeave} className="press shrink-0 text-sm font-medium text-fg">
      Switch platform
    </button>
  );
}

function Gate({ onEnter }: { onEnter: (platform: "rider" | "driver") => void }) {
  const unlockAdmin = useWaka((s) => s.unlockAdmin);
  const riderAccount = useWaka((s) => s.riderAccount);
  const driverAccount = useWaka((s) => s.driverAccount);
  const openAccount = useWaka((s) => s.openAccount);
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <p className="text-sm text-muted">
        Request a ride, reserve a pickup, or send a parcel. Registration is a name, phone, NIN, and home address. Drivers bring their own car. A car under 10 years takes every ride. A clean older car with the air conditioner on takes Hello. Women and men both drive. No store download and no bank charge yet.
      </p>
      <AccountCard
        title="Customer"
        body={
          riderAccount
            ? `${riderAccount.name} · ${riderAccount.phone}`
            : "Name, phone, NIN, and home address. Then you can request a ride and pay NaijaMove."
        }
        role="rider"
        account={riderAccount}
        needsPlate={false}
        openAccount={openAccount}
        onEnter={() => onEnter("rider")}
      />
      <AccountCard
        title="Driver"
        body={
          driverAccount
            ? driverAccount.carYear
              ? `${driverAccount.name} · ${driverAccount.carMake} ${driverAccount.carYear} · ${driverAccount.plate}`
              : `${driverAccount.name} · finish the car and the checks`
            : "Your own car. Under 10 years for every ride, or a clean older car for Hello. Women and men both drive."
        }
        role="driver"
        account={driverAccount}
        needsPlate
        openAccount={openAccount}
        onEnter={() => onEnter("driver")}
      />
      <form
        className="rounded-2xl border border-line bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(unlockAdmin(key));
        }}
      >
        <p className="text-lg font-medium">Desk</p>
        <p className="mt-1 text-sm text-muted">
          Admin key for this preview: {ADMIN_KEY}. It opens the register on this phone. It is not a live-city password.
        </p>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="off"
          aria-label="Admin key"
          className="mt-3 h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
        />
        {error && <p className="mt-2 text-sm text-bad">{error}</p>}
        <Button className="mt-3" type="submit">
          Open desk
        </Button>
      </form>
    </>
  );
}

function Check({ label, on, set }: { label: string; on: boolean; set: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      {label}
    </label>
  );
}

function AccountCard({
  title,
  body,
  role,
  account,
  needsPlate,
  openAccount,
  onEnter,
}: {
  title: string;
  body: string;
  role: "rider" | "driver";
  account: { name: string; phone: string; plate: string } | null;
  needsPlate: boolean;
  openAccount: (
    role: "rider" | "driver",
    input: {
      name: string;
      phone: string;
      nin?: string;
      address?: string;
      gender?: string;
      police?: boolean;
      plate: string;
      carYear?: string;
      carMake?: string;
      ac?: boolean;
      clean?: boolean;
      responsible?: boolean;
    },
  ) => string | null;
  onEnter: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carYear, setCarYear] = useState("");
  const [nin, setNin] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState<"" | "Woman" | "Man">("");
  const [police, setPolice] = useState(false);
  const [ac, setAc] = useState(false);
  const [clean, setClean] = useState(false);
  const [responsible, setResponsible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      {account && (
        <Button className="mt-3" onClick={onEnter}>
          Continue
        </Button>
      )}
      {!open && (
        <Button className="mt-3" variant="secondary" onClick={() => setOpen(true)}>
          {account ? "Update account" : "Create account"}
        </Button>
      )}
      {open && (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const message = openAccount(role, {
              name,
              phone,
              nin,
              address,
              gender,
              police,
              plate,
              carMake,
              carYear,
              ac,
              clean,
              responsible,
            });
            setError(message);
            if (!message) {
              setOpen(false);
              onEnter();
            }
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label={`${title} name`}
            placeholder="Name"
            className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label={`${title} phone`}
            inputMode="tel"
            placeholder="Phone"
            className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
          />
          <input
            value={nin}
            onChange={(e) => setNin(e.target.value)}
            aria-label={`${title} NIN`}
            inputMode="numeric"
            placeholder="NIN, 11 digits"
            className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            aria-label={`${title} home address`}
            placeholder="Home address"
            className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
          />
          {needsPlate && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {(["Woman", "Man"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGender(item)}
                    className={cn("press h-11 rounded-md border text-sm font-medium", gender === item ? "border-ink bg-surface" : "border-transparent bg-sunken text-muted")}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <input
                value={carMake}
                onChange={(e) => setCarMake(e.target.value)}
                aria-label="Car make"
                placeholder="Car, for example Toyota Corolla"
                className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
              />
              <input
                value={carYear}
                onChange={(e) => setCarYear(e.target.value)}
                aria-label="Car year"
                inputMode="numeric"
                placeholder="Year. 2017+ any ride, 2008–2016 Hello"
                className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
              />
              <input
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                aria-label="Vehicle plate"
                placeholder="Plate"
                className="h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none"
              />
              <Check label="Air conditioner works" on={ac} set={setAc} />
              <Check label="Car is clean" on={clean} set={setClean} />
              <Check label="I drive it responsibly" on={responsible} set={setResponsible} />
              <Check label="Submit my NIN, phone, and home address for a police check" on={police} set={setPolice} />
            </>
          )}
          {error && <p className="text-sm text-bad">{error}</p>}
          <Button type="submit">Save and open</Button>
        </form>
      )}
    </div>
  );
}

function TabButton({
  item,
  current,
  onSelect,
}: {
  item: (typeof TABS)[number];
  current: Tab;
  onSelect: (tab: Tab) => void;
}) {
  const Icon = item.icon;
  const on = current === item.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "press flex h-12 flex-col items-center justify-center gap-0.5 rounded-md text-sm font-medium lg:h-11 lg:flex-row lg:gap-2 lg:border",
        on ? "text-fg lg:border-ink lg:bg-surface" : "text-muted lg:border-transparent lg:bg-sunken",
      )}
      aria-current={on ? "page" : undefined}
    >
      <Icon className="size-5" aria-hidden="true" />
      {item.label}
    </button>
  );
}

function EmptyLedger() {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">Pick two different places to see who pays, who keeps, and what NaijaMove earns.</p>
    </section>
  );
}

function SideNote() {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
      <p className="font-medium text-fg">Borrowed from the apps that stalled</p>
      <p className="mt-2">The fare is paid to NaijaMove, then the company pays the driver their share. Upfront price. A lower cut than Bolt. No bid-down race.</p>
      <p className="mt-2">The company is paid by the 7% fee, NaijaMove Plus, fuel and maintenance partners, and business accounts — so the fare can stay under the usual app. Plus discounts come from the subscription, not from the driver.</p>
    </section>
  );
}
