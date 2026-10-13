/** Fare math for Waka.
 * Usual apps (Bolt-like, post-Uber Nigeria): ~25% commission, frozen per-km rates.
 * Waka: rider pays about 8% less than that frozen fare, plus only the real fuel
 * change above or below ₦1,000/L. Company keeps 10% of the off-peak fare.
 * Traffic-window uplift and the hurry bonus are not commissioned.
 * Result: rider pays less, driver nets more, company still keeps a fee.
 */

export type CityId = "lagos" | "abuja" | "ph";
export type VehicleId = "keke" | "hello" | "go" | "share" | "comfort";
export type PayMethod = "cash" | "transfer" | "wallet";

export type Place = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
};

export type VehicleSpec = {
  id: Exclude<VehicleId, "share">;
  name: string;
  blurb: string;
  kmPerLitre: number;
  wearPerKm: number;
  usualFlag: number;
  usualPerKm: number;
  usualPerMin: number;
};

export const ANCHOR_PETROL = 1000;
export const WAKA_CUT = 0.07;
export const USUAL_CUT = 0.25;
export const RIDER_OFF = 0.08;
export const PASS_OFF = 0.1;
export const TRAFFIC_RATE = 0.12;
export const PUMP_SAVE_PER_L = 40;
export const PUMP_FEE_PER_L = 15;
export const HURRY_RIDER = 150;
export const HURRY_DRIVER = 120;
export const HURRY_PLATFORM = 30;
export const SHARE_OF_GO = 0.63;
export const HELLO_OF_GO = 0.86;
export const PASS_PRICE = 2500;
export const MONTHLY_RUNNING_COST = 6_800_000;

export const VEHICLES: Record<Exclude<VehicleId, "share">, VehicleSpec> = {
  keke: {
    id: "keke",
    name: "Keke",
    blurb: "Tricycle, short hops",
    kmPerLitre: 30,
    wearPerKm: 16,
    usualFlag: 180,
    usualPerKm: 120,
    usualPerMin: 8,
  },
  hello: {
    id: "hello",
    name: "Hello",
    blurb: "Older car, AC on, clean",
    kmPerLitre: 11,
    wearPerKm: 48,
    usualFlag: 350,
    usualPerKm: 170,
    usualPerMin: 10,
  },
  go: {
    id: "go",
    name: "Go",
    blurb: "Everyday sedan",
    kmPerLitre: 11,
    wearPerKm: 38,
    usualFlag: 400,
    usualPerKm: 200,
    usualPerMin: 12,
  },
  comfort: {
    id: "comfort",
    name: "Comfort",
    blurb: "Quieter car, more boot",
    kmPerLitre: 9,
    wearPerKm: 55,
    usualFlag: 700,
    usualPerKm: 340,
    usualPerMin: 16,
  },
};

export const VEHICLE_ORDER: VehicleId[] = ["keke", "hello", "go", "share", "comfort"];

export function vehicleName(id: VehicleId): string {
  if (id === "share") return "Share";
  return VEHICLES[id].name;
}

export function vehicleBlurb(id: VehicleId): string {
  if (id === "share") return "Two riders, one sedan";
  return VEHICLES[id].blurb;
}

export const CITIES: Record<CityId, { id: CityId; name: string; petrol: number; places: Place[] }> = {
  lagos: {
    id: "lagos",
    name: "Lagos",
    petrol: 1050,
    places: [
      { id: "vi", name: "Victoria Island", area: "Island", lat: 6.4281, lng: 3.4219 },
      { id: "ikoyi", name: "Ikoyi", area: "Island", lat: 6.4541, lng: 3.4356 },
      { id: "lekki", name: "Lekki Phase 1", area: "Lekki", lat: 6.4478, lng: 3.4739 },
      { id: "ajah", name: "Ajah", area: "Lekki", lat: 6.467, lng: 3.6015 },
      { id: "cms", name: "CMS / Marina", area: "Island", lat: 6.4541, lng: 3.3896 },
      { id: "yaba", name: "Yaba", area: "Mainland", lat: 6.5158, lng: 3.3706 },
      { id: "surulere", name: "Surulere", area: "Mainland", lat: 6.5015, lng: 3.3581 },
      { id: "ikeja", name: "Ikeja", area: "Mainland", lat: 6.6018, lng: 3.3515 },
      { id: "airport", name: "MM Airport", area: "Ikeja", lat: 6.5774, lng: 3.3212 },
      { id: "maryland", name: "Maryland", area: "Mainland", lat: 6.5736, lng: 3.3678 },
      { id: "gbagada", name: "Gbagada", area: "Mainland", lat: 6.5447, lng: 3.3915 },
      { id: "festac", name: "Festac", area: "Amuwo", lat: 6.4654, lng: 3.282 },
    ],
  },
  abuja: {
    id: "abuja",
    name: "Abuja",
    petrol: 1020,
    places: [
      { id: "wuse", name: "Wuse 2", area: "Central", lat: 9.0765, lng: 7.476 },
      { id: "maitama", name: "Maitama", area: "Central", lat: 9.082, lng: 7.495 },
      { id: "garki", name: "Garki", area: "Central", lat: 9.04, lng: 7.483 },
      { id: "jabi", name: "Jabi", area: "Jabi", lat: 9.07, lng: 7.425 },
      { id: "wuye", name: "Wuye", area: "Central", lat: 9.065, lng: 7.455 },
      { id: "gwarinpa", name: "Gwarinpa", area: "Gwarinpa", lat: 9.11, lng: 7.41 },
      { id: "airport", name: "Abuja Airport", area: "Airport", lat: 9.0068, lng: 7.2631 },
      { id: "kubwa", name: "Kubwa", area: "Kubwa", lat: 9.15, lng: 7.33 },
    ],
  },
  ph: {
    id: "ph",
    name: "Port Harcourt",
    petrol: 1080,
    places: [
      { id: "gra", name: "GRA Phase 2", area: "GRA", lat: 4.815, lng: 7.0 },
      { id: "trans", name: "Trans Amadi", area: "Trans Amadi", lat: 4.82, lng: 7.05 },
      { id: "rumuola", name: "Rumuola", area: "Rumuola", lat: 4.84, lng: 7.01 },
      { id: "eleme", name: "Eleme Junction", area: "Eleme", lat: 4.81, lng: 7.11 },
      { id: "mile1", name: "Mile 1", area: "Diobu", lat: 4.789, lng: 7.013 },
      { id: "adageorge", name: "Ada George", area: "Ada George", lat: 4.83, lng: 6.97 },
      { id: "rumuokoro", name: "Rumuokoro", area: "Rumuokoro", lat: 4.866, lng: 6.998 },
      { id: "airport", name: "PH Airport", area: "Omagwa", lat: 5.0155, lng: 6.9496 },
    ],
  },
};

export const DEFAULT_ROUTE: Record<CityId, { from: string; to: string }> = {
  lagos: { from: "lekki", to: "vi" },
  abuja: { from: "wuse", to: "garki" },
  ph: { from: "gra", to: "trans" },
};

export type DriverCard = {
  name: string;
  car: string;
  color: string;
  plate: string;
  rating: number;
  trips: number;
  year: number;
  who: "Woman" | "Man";
};

export const DRIVERS: DriverCard[] = [
  { name: "Tunde Bakare", car: "Toyota Corolla", color: "Silver", plate: "LSD 482 KA", rating: 4.92, trips: 1840, year: 2019, who: "Man" },
  { name: "Amaka Eze", car: "Honda Accord", color: "Black", plate: "APP 118 LG", rating: 4.88, trips: 960, year: 2014, who: "Woman" },
  { name: "Ibrahim Sule", car: "Toyota Corolla", color: "White", plate: "FKJ 902 AA", rating: 4.95, trips: 2210, year: 2021, who: "Man" },
  { name: "Chioma Okonkwo", car: "Hyundai Elantra", color: "Grey", plate: "KJA 551 BD", rating: 4.86, trips: 740, year: 2013, who: "Woman" },
  { name: "Seun Adeyemi", car: "Toyota Camry", color: "Blue", plate: "MUS 773 KJ", rating: 4.9, trips: 1322, year: 2018, who: "Man" },
  { name: "Hauwa Bello", car: "Toyota Corolla", color: "Gold", plate: "ABC 240 KT", rating: 4.84, trips: 610, year: 2015, who: "Woman" },
];

export const RIDER_NAMES = ["Adaeze", "Kunle", "Fatima", "Chinedu", "Blessing", "Yusuf", "Ngozi", "Tobi", "Hadiza", "Femi"];

export type Quote = {
  vehicle: VehicleId;
  km: number;
  minutes: number;
  litres: number;
  petrol: number;
  traffic: boolean;
  hurry: boolean;
  pump: boolean;
  pass: boolean;
  floored: boolean;
  riderPays: number;
  collected: number;
  platformFee: number;
  passSubsidy: number;
  platformNet: number;
  driverCash: number;
  fuelCost: number;
  wearCost: number;
  driverNet: number;
  trafficUplift: number;
  fuelDelta: number;
  hurryRider: number;
  pumpPlatform: number;
  usualRider: number;
  usualPlatform: number;
  usualDriverCash: number;
  usualNet: number;
  riderSaves: number;
  driverGains: number;
};

export function naira(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "−" : "";
  return `${sign}₦${Math.abs(rounded).toLocaleString("en-NG")}`;
}

export function placeById(city: CityId, id: string): Place {
  const found = CITIES[city].places.find((p) => p.id === id);
  return found ?? CITIES[city].places[0]!;
}

export function roadKm(a: Place, b: Place): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
  return Math.max(0.8, Math.round(straight * 1.36 * 10) / 10);
}

export function tripMinutes(km: number, traffic: boolean): number {
  const speed = traffic ? 18 : 28;
  return Math.max(5, Math.round((km / speed) * 60));
}

export function inTrafficWindow(date = new Date()): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  const mins = date.getHours() * 60 + date.getMinutes();
  const morning = mins >= 7 * 60 && mins < 9 * 60;
  const evening = mins >= 16 * 60 && mins < 19 * 60;
  return morning || evening;
}

function specFor(vehicle: VehicleId): VehicleSpec {
  return vehicle === "share" ? VEHICLES.go : VEHICLES[vehicle];
}

export function quoteTrip(input: {
  vehicle: VehicleId;
  km: number;
  minutes: number;
  petrol: number;
  traffic: boolean;
  hurry: boolean;
  pump: boolean;
  pass: boolean;
}): Quote {
  if (input.vehicle === "hello") {
    const go = quoteTrip({ ...input, vehicle: "go" });
    const riderPays = Math.max(Math.round(go.riderPays * HELLO_OF_GO), Math.round(go.fuelCost + go.wearCost + 400));
    const delta = riderPays - go.riderPays;
    const extraWear = Math.round(go.wearCost * 0.25);
    return {
      ...go,
      vehicle: "hello",
      riderPays,
      driverCash: go.driverCash + delta,
      driverNet: go.driverNet + delta - extraWear,
      collected: go.collected + delta,
      wearCost: go.wearCost + extraWear,
    };
  }
  const spec = specFor(input.vehicle);
  const litres = input.km / spec.kmPerLitre;
  const streetFuel = litres * input.petrol;
  const wearCost = Math.round(input.km * spec.wearPerKm);
  const fuelDelta = litres * (input.petrol - ANCHOR_PETROL);
  const usualRider = Math.round(spec.usualFlag + spec.usualPerKm * input.km + spec.usualPerMin * input.minutes);
  const usualPlatform = Math.round(usualRider * USUAL_CUT);
  const usualDriverCash = usualRider - usualPlatform;
  const usualNet = usualDriverCash - Math.round(streetFuel) - wearCost;

  const discounted = usualRider * (1 - RIDER_OFF) + fuelDelta;
  const operating = streetFuel + input.km * spec.wearPerKm;
  const minBase = operating / (1 - WAKA_CUT) + input.km * 40;
  const floored = minBase > discounted;
  const goBase = Math.round(Math.max(discounted, minBase));

  const riderBase = input.vehicle === "share" ? Math.round(goBase * SHARE_OF_GO) : goBase;
  const trafficEach = input.traffic ? Math.round(riderBase * TRAFFIC_RATE) : 0;
  const hurryOn = input.hurry;
  const hurryRider = hurryOn && !input.pass ? HURRY_RIDER : 0;
  const hurryCover = hurryOn && input.pass ? HURRY_DRIVER : 0;
  const hurryPlatform = hurryOn && !input.pass ? HURRY_PLATFORM : 0;

  const fullSeat = riderBase + trafficEach;
  const seatDiscount = input.pass ? Math.round(fullSeat * PASS_OFF) : 0;
  const riderPays = fullSeat - seatDiscount + hurryRider;
  const seats = input.vehicle === "share" ? 2 : 1;
  const collected = fullSeat * seats + hurryRider;
  const commissioned = riderBase * seats;
  const platformFee = Math.round(commissioned * WAKA_CUT) + hurryPlatform;
  const passSubsidy = seatDiscount * seats + hurryCover;
  const driverCash = collected - platformFee + hurryCover;
  const platformNet = platformFee - passSubsidy;
  const fuelCost = Math.round(litres * (input.petrol - (input.pump ? PUMP_SAVE_PER_L : 0)));
  const driverNet = driverCash - fuelCost - wearCost;

  return {
    vehicle: input.vehicle,
    km: input.km,
    minutes: input.minutes,
    litres,
    petrol: input.petrol,
    traffic: input.traffic,
    hurry: input.hurry,
    pump: input.pump,
    pass: input.pass,
    floored,
    riderPays,
    collected,
    platformFee,
    passSubsidy,
    platformNet,
    driverCash,
    fuelCost,
    wearCost,
    driverNet,
    trafficUplift: trafficEach * seats,
    fuelDelta: Math.round(fuelDelta),
    hurryRider,
    pumpPlatform: input.pump ? Math.round(litres * PUMP_FEE_PER_L) : 0,
    usualRider,
    usualPlatform,
    usualDriverCash,
    usualNet,
    riderSaves: usualRider - riderPays,
    driverGains: driverNet - usualNet,
  };
}

export type Books = {
  tripRevenue: number;
  passRevenue: number;
  pumpRevenue: number;
  total: number;
  profit: number;
  perTripFee: number;
};

export function monthlyBooks(input: {
  tripsPerDay: number;
  passes: number;
  litresPerDay: number;
  perTripFee: number;
}): Books {
  const tripRevenue = Math.round(input.tripsPerDay * input.perTripFee * 30);
  const passRevenue = input.passes * PASS_PRICE;
  const pumpRevenue = Math.round(input.litresPerDay * PUMP_FEE_PER_L * 30);
  const total = tripRevenue + passRevenue + pumpRevenue;
  return {
    tripRevenue,
    passRevenue,
    pumpRevenue,
    total,
    profit: total - MONTHLY_RUNNING_COST,
    perTripFee: input.perTripFee,
  };
}

export function fareSplit(quote: Quote) {
  const seats = quote.vehicle === "share" ? 2 : 1;
  const youPay = quote.riderPays;
  const paidIn = youPay * seats;
  const driverDue = quote.driverCash;
  const kept = paidIn - driverDue;
  return { seats, youPay, paidIn, driverDue, kept };
}

export function payLabel(pay: PayMethod): string {
  if (pay === "wallet") return "Wallet";
  if (pay === "cash") return "Transfer";
  return "Transfer";
}

export const MODEL_YEAR = 2026;
export const MAX_CAR_AGE = 10;

export function offerBounds(quote: Quote) {
  const keep = Math.max(0, quote.riderPays - quote.driverCash);
  let floor = quote.fuelCost + quote.wearCost + 250 + keep;
  const recommended = quote.riderPays;
  if (floor > recommended) floor = recommended;
  return { floor: Math.round(floor), recommended, ceiling: Math.round(recommended * 1.15) };
}

export function quoteAtFare(quote: Quote, fare: number): Quote {
  const bounds = offerBounds(quote);
  const riderPays = Math.min(bounds.ceiling, Math.max(bounds.floor, Math.round(fare)));
  const delta = riderPays - quote.riderPays;
  return {
    ...quote,
    riderPays,
    driverCash: quote.driverCash + delta,
    driverNet: quote.driverNet + delta,
    collected: quote.collected + delta,
  };
}

export type CarChecks = { ac: boolean; clean: boolean; responsible: boolean };

export function carStanding(year: number | null | undefined, checks: CarChecks | null | undefined) {
  const ready = Boolean(checks?.ac && checks.clean && checks.responsible);
  if (year == null) {
    return { ok: false, helloOnly: false, reason: "Add the car year. A car under 10 years can take every ride. An older decent car can take Hello." };
  }
  if (!Number.isInteger(year) || year < 1990 || year > MODEL_YEAR) {
    return { ok: false, helloOnly: false, reason: `Enter the car year, from 1990 to ${MODEL_YEAR}.` };
  }
  const age = MODEL_YEAR - year;
  if (age < MAX_CAR_AGE) return { ok: true, helloOnly: false, reason: null };
  if (age <= 18 && ready) return { ok: true, helloOnly: true, reason: null };
  if (age <= 18) {
    return {
      ok: false,
      helloOnly: false,
      reason: `A ${year} car is ${age} years old. It can take Hello trips if the air conditioner works, the car is clean, and you confirm you drive it responsibly.`,
    };
  }
  return { ok: false, helloOnly: false, reason: `A ${year} car is ${age} years old. Hello stops at 18 years.` };
}

export function carBlock(year: number | null | undefined, checks?: CarChecks | null): string | null {
  return carStanding(year, checks).reason;
}

export function identityGap(
  account: { phone?: string; nin?: string; address?: string; gender?: string; police?: boolean } | null,
  role: "rider" | "driver",
): string | null {
  if (!account) return "Create an account first.";
  if (!account.phone || account.phone.replace(/\D/g, "").length < 10) return "Add a phone number with at least 10 digits.";
  if (!/^\d{11}$/.test(account.nin ?? "")) return "Add your NIN. It is 11 digits.";
  if ((account.address ?? "").trim().length < 8) return "Add the home address where you can be reached.";
  if (role === "driver" && account.gender !== "Woman" && account.gender !== "Man") {
    return "Say whether you are a woman or a man. Both can drive.";
  }
  if (role === "driver" && !account.police) return "Submit your NIN, phone, and home address for a police criminal-record check.";
  return null;
}
