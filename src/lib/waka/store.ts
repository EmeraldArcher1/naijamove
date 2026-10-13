import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CITIES,
  DEFAULT_ROUTE,
  DRIVERS,
  PASS_PRICE,
  RIDER_NAMES,
  type CityId,
  type DriverCard,
  type PayMethod,
  type Quote,
  type VehicleId,
  placeById,
  quoteTrip,
  roadKm,
  tripMinutes,
  fareSplit,
  carStanding,
  carBlock,
  identityGap,
  quoteAtFare,
  MODEL_YEAR,
} from "./model";
import {
  ADMIN_KEY,
  DEFAULT_DOCS,
  TERMS_VERSION,
  cannotDrive,
  suspendsDriver,
  todayKey,
  type AuditEntry,
  type Complaint,
  type ComplaintKind,
  type DocSet,
  type TripEvent,
} from "./safety";

export type Role = "rider" | "driver";
export type Account = {
  name: string;
  phone: string;
  nin: string;
  address: string;
  gender: "Woman" | "Man" | "";
  police: boolean;
  checksCleared: boolean;
  plate: string;
  carYear: number | null;
  carMake: string;
  ac: boolean;
  clean: boolean;
  responsible: boolean;
};

export type CompanyPayment = {
  id: string;
  at: number;
  code: string;
  method: "wallet" | "transfer";
  payer: string;
  driver: string;
  paidIn: number;
  kept: number;
  driverDue: number;
  kind: "fare" | "payout";
};
export type Tab = "ride" | "drive" | "wallet" | "safety" | "books" | "guide";
export type Platform = "gate" | "rider" | "driver" | "admin";
export type Phase = "search" | "pickup" | "ontrip";

export type Receipt = {
  id: string;
  at: number;
  city: CityId;
  fromId: string;
  toId: string;
  vehicle: VehicleId;
  pay: PayMethod;
  quote: Quote;
  driverName: string;
  plate: string;
  as: Role;
  rating: number | null;
  secondRider: string | null;
  code: string;
  parcel: boolean;
  leaveAt: string | null;
  events: TripEvent[];
};

export type LiveTrip = {
  id: string;
  city: CityId;
  fromId: string;
  toId: string;
  vehicle: VehicleId;
  pay: PayMethod;
  quote: Quote;
  phase: Phase;
  driver: DriverCard;
  startedAs: Role;
  at: number;
  code: string;
  secondRider: string | null;
  riderName: string;
  pickupMin: number;
  parcel: boolean;
  leaveAt: string | null;
  events: TripEvent[];
};

export type OpenRequest = {
  id: string;
  fromId: string;
  toId: string;
  vehicle: VehicleId;
  pay: PayMethod;
  quote: Quote;
  rider: string;
  pickupMin: number;
};

type DayBar = { label: string; net: number };

type WakaState = {
  ready: boolean;
  tab: Tab;
  role: Role;
  platform: Platform;
  city: CityId;
  petrol: number;
  pump: boolean;
  pass: boolean;
  trafficPreview: boolean | null;
  hurry: boolean;
  parcel: boolean;
  leaveAt: string | null;
  fromId: string;
  toId: string;
  vehicle: VehicleId;
  pay: PayMethod;
  offer: number | null;
  wallet: number;
  cashOwed: number;
  companyHeld: number;
  driverOwed: number;
  driverPaid: number;
  payments: CompanyPayment[];
  online: boolean;
  requests: OpenRequest[];
  trip: LiveTrip | null;
  lastReceipt: Receipt | null;
  receipts: Receipt[];
  priorDays: DayBar[];
  riderRules: boolean;
  driverRules: boolean;
  riderTerms: string | null;
  driverTerms: string | null;
  riderAccount: Account | null;
  driverAccount: Account | null;
  docs: DocSet;
  suspended: boolean;
  appeal: "none" | "filed" | "refused";
  blockedPlates: string[];
  complaints: Complaint[];
  audit: AuditEntry[];
  setReady: (ready: boolean) => void;
  setTab: (tab: Tab) => void;
  setRole: (role: Role) => void;
  enterPlatform: (platform: "rider" | "driver") => void;
  unlockAdmin: (key: string) => string | null;
  leavePlatform: () => string | null;
  setCity: (city: CityId) => void;
  setPetrol: (petrol: number) => void;
  setPump: (pump: boolean) => void;
  setHurry: (hurry: boolean) => void;
  setParcel: (parcel: boolean) => void;
  setLeaveAt: (leaveAt: string | null) => void;
  setTrafficPreview: (value: boolean | null) => void;
  setFrom: (id: string) => void;
  setTo: (id: string) => void;
  setVehicle: (vehicle: VehicleId) => void;
  setPay: (pay: PayMethod) => void;
  setOffer: (offer: number | null) => void;
  setRiderRules: (accepted: boolean) => void;
  setDriverRules: (accepted: boolean) => void;
  openAccount: (
    role: Role,
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
  settleDriver: () => void;
  clearChecks: () => string | null;
  buyPass: () => void;
  topUp: () => void;
  goOnline: () => void;
  goOffline: () => void;
  refreshRequests: () => void;
  requestRide: () => string | null;
  markPickup: () => void;
  startTrip: (pin: string) => string | null;
  cancelTrip: () => void;
  completeTrip: () => string | null;
  shareTrip: (contact: string) => string | null;
  fileReport: (kind: ComplaintKind, note: string) => string | null;
  resolveComplaint: (id: string) => void;
  fileAppeal: (note: string) => string | null;
  decideAppeal: (reinstate: boolean) => void;
  expireVehiclePapers: () => void;
  renewVehiclePapers: () => void;
  dismissReceipt: () => void;
  rate: (id: string, rating: number) => void;
  accept: (id: string) => void;
  decline: (id: string) => void;
  resetDemo: () => void;
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function four(): string {
  return String(1000 + Math.floor(Math.random() * 9000));
}

function note(kind: TripEvent["kind"], detail: string): TripEvent {
  return { id: uid(), at: Date.now(), kind, detail };
}

function log(actor: AuditEntry["actor"], action: string, detail: string): AuditEntry {
  return { id: uid(), at: Date.now(), actor, action, detail };
}

function checksOf(account: Account | null) {
  return { ac: Boolean(account?.ac), clean: Boolean(account?.clean), responsible: Boolean(account?.responsible) };
}

function laneOf(account: Account | null): "all" | "hello" {
  return carStanding(account?.carYear, checksOf(account)).helloOnly ? "hello" : "all";
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function seedWeek(): DayBar[] {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const samples = [16840, 14220, 17610, 15330, 18940, 12180];
  const out: DayBar[] = [];
  for (let ago = 6; ago >= 0; ago -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - ago);
    out.push({ label: labels[d.getDay()]!, net: ago === 0 ? 0 : samples[5 - ago]! });
  }
  return out;
}

function buildRequests(city: CityId, petrol: number, pump: boolean, traffic: boolean, lane: "all" | "hello" = "all"): OpenRequest[] {
  const places = CITIES[city].places;
  const vehicles: VehicleId[] = lane === "hello" ? ["hello", "hello", "hello"] : ["go", "hello", "share", "keke", "comfort", "go"];
  const pays: PayMethod[] = ["transfer", "wallet", "transfer", "wallet"];
  const used = new Set<string>();
  const out: OpenRequest[] = [];
  let guard = 0;
  while (out.length < 3 && guard < 20) {
    guard += 1;
    const from = pick(places);
    const to = pick(places);
    if (from.id === to.id) continue;
    const key = `${from.id}-${to.id}`;
    if (used.has(key)) continue;
    used.add(key);
    const vehicle = pick(vehicles);
    const km = roadKm(from, to);
    const trafficOn = traffic;
    const quote = quoteTrip({
      vehicle,
      km,
      minutes: tripMinutes(km, trafficOn),
      petrol,
      traffic: trafficOn,
      hurry: false,
      pump,
      pass: false,
    });
    out.push({
      id: uid(),
      fromId: from.id,
      toId: to.id,
      vehicle,
      pay: pick(pays),
      quote,
      rider: pick(RIDER_NAMES),
      pickupMin: 3 + Math.floor(Math.random() * 5),
    });
  }
  return out;
}

function toReceipt(trip: LiveTrip): Receipt {
  return {
    id: trip.id,
    at: Date.now(),
    city: trip.city,
    fromId: trip.fromId,
    toId: trip.toId,
    vehicle: trip.vehicle,
    pay: trip.pay,
    quote: trip.quote,
    driverName: trip.driver.name,
    plate: trip.driver.plate,
    as: trip.startedAs,
    rating: null,
    secondRider: trip.secondRider,
    code: trip.code,
    parcel: trip.parcel,
    leaveAt: trip.leaveAt,
    events: [...trip.events, note("ended", "Trip ended. The fare is booked as paid to NaijaMove.")],
  };
}

const initialCity: CityId = "lagos";

export const useWaka = create<WakaState>()(
  persist(
    (set, get) => ({
      ready: false,
      tab: "ride",
      role: "rider",
      platform: "gate",
      city: initialCity,
      petrol: CITIES[initialCity].petrol,
      pump: true,
      pass: false,
      trafficPreview: null,
      hurry: false,
      parcel: false,
      leaveAt: null,
      fromId: DEFAULT_ROUTE[initialCity].from,
      toId: DEFAULT_ROUTE[initialCity].to,
      vehicle: "go",
      pay: "transfer",
      offer: null,
      wallet: 20000,
      cashOwed: 0,
      companyHeld: 0,
      driverOwed: 0,
      driverPaid: 0,
      payments: [],
      online: false,
      requests: [],
      trip: null,
      lastReceipt: null,
      receipts: [],
      priorDays: seedWeek(),
      riderRules: false,
      driverRules: false,
      riderTerms: null,
      driverTerms: null,
      riderAccount: null,
      driverAccount: null,
      docs: DEFAULT_DOCS,
      suspended: false,
      appeal: "none",
      blockedPlates: [],
      complaints: [],
      audit: [],
      setReady: (ready) => set({ ready }),
      setTab: (tab) => set({ tab }),
      setRole: (role) => set({ role, tab: role === "driver" ? "drive" : "ride" }),
      enterPlatform: (platform) => {
        const s = get();
        if (platform === "rider" && !s.riderAccount) return;
        if (platform === "driver" && !s.driverAccount) return;
        set({ platform, role: platform, tab: platform === "rider" ? "ride" : "drive" });
      },
      unlockAdmin: (key) => {
        if (key.trim() !== ADMIN_KEY) return "That key does not open the desk.";
        set({ platform: "admin", tab: "safety" });
        return null;
      },
      leavePlatform: () => {
        if (get().trip) return "Finish or cancel the trip before you leave this platform.";
        set({ platform: "gate", online: false, requests: [] });
        return null;
      },
      setCity: (city) => {
        if (get().trip) return;
        set({
          city,
          petrol: CITIES[city].petrol,
          fromId: DEFAULT_ROUTE[city].from,
          toId: DEFAULT_ROUTE[city].to,
          requests: [],
          online: false,
        });
      },
      setPetrol: (petrol) => set({ petrol }),
      setPump: (pump) => set({ pump }),
      setHurry: (hurry) => set({ hurry }),
      setParcel: (parcel) => set({ parcel, vehicle: parcel ? "go" : get().vehicle }),
      setLeaveAt: (leaveAt) => set({ leaveAt }),
      setTrafficPreview: (trafficPreview) => set({ trafficPreview }),
      setFrom: (fromId) => set({ fromId }),
      setTo: (toId) => set({ toId }),
      setVehicle: (vehicle) => set({ vehicle }),
      setPay: (pay) => set({ pay }),
      setOffer: (offer) => set({ offer }),
      setRiderRules: (accepted) =>
        set((s) => ({
          riderRules: accepted,
          riderTerms: accepted ? TERMS_VERSION : null,
          audit: accepted
            ? [log("rider", "Terms accepted", `Safety notice and terms ${TERMS_VERSION}.`), ...s.audit].slice(0, 40)
            : s.audit,
        })),
      setDriverRules: (accepted) =>
        set((s) => ({
          driverRules: accepted,
          driverTerms: accepted ? TERMS_VERSION : null,
          audit: accepted
            ? [log("driver", "Charter accepted", `Driver charter and terms ${TERMS_VERSION}.`), ...s.audit].slice(0, 40)
            : s.audit,
        })),
      openAccount: (role, input) => {
        const name = input.name.trim().replace(/\s+/g, " ");
        const phone = input.phone.replace(/[^\d+]/g, "");
        const nin = (input.nin ?? "").replace(/\D/g, "");
        const address = (input.address ?? "").trim().replace(/\s+/g, " ");
        const gender = input.gender === "Woman" || input.gender === "Man" ? input.gender : "";
        const police = Boolean(input.police);
        const base = {
          name,
          phone,
          nin,
          address,
          gender: gender as Account["gender"],
          police,
          checksCleared: false,
          plate: "",
          carYear: null as number | null,
          carMake: "",
          ac: Boolean(input.ac),
          clean: Boolean(input.clean),
          responsible: Boolean(input.responsible),
        };
        if (name.length < 2) return "Enter the name on the account.";
        const gap = identityGap(base, role);
        if (gap) return gap;
        if (role === "rider") {
          set({ riderAccount: base });
          return null;
        }
        const make = (input.carMake ?? "").trim().replace(/\s+/g, " ");
        const year = Number(input.carYear);
        const plate = input.plate.trim().toUpperCase().replace(/\s+/g, " ");
        const checks = { ac: base.ac, clean: base.clean, responsible: base.responsible };
        if (make.length < 2) return "Enter the car you drive, for example Toyota Corolla.";
        if (plate.length < 5) return "Enter the vehicle registration plate.";
        const standing = carStanding(year, checks);
        if (standing.reason) return standing.reason;
        set({
          driverAccount: { ...base, plate, carYear: year, carMake: make },
        });
        return null;
      },
      clearChecks: () => {
        const s = get();
        const driver = s.driverAccount;
        if (!driver) return "Create the driver account first.";
        const gap = identityGap(driver, "driver");
        if (gap) return gap;
        set({
          driverAccount: { ...driver, checksCleared: true },
          audit: [
            log(
              "desk",
              "Checks cleared",
              "NIN, phone, home address, and the police submission were recorded. This preview does not call the police.",
            ),
            ...s.audit,
          ].slice(0, 40),
        });
        return null;
      },
      settleDriver: () => {
        const s = get();
        if (s.driverOwed <= 0) return;
        const due = s.driverOwed;
        const line: CompanyPayment = {
          id: uid(),
          at: Date.now(),
          code: "payout",
          method: "transfer",
          payer: "NaijaMove",
          driver: s.driverAccount?.name ?? "Driver",
          paidIn: 0,
          kept: 0,
          driverDue: due,
          kind: "payout",
        };
        set({
          driverOwed: 0,
          driverPaid: s.driverPaid + due,
          companyHeld: s.companyHeld - due,
          payments: [line, ...s.payments].slice(0, 40),
          audit: [log("desk", "Driver paid", `₦${due.toLocaleString("en-NG")} sent from the company to the driver.`), ...s.audit].slice(0, 40),
        });
      },
      buyPass: () => {
        const s = get();
        if (s.pass || s.wallet < PASS_PRICE) return;
        set({ pass: true, wallet: s.wallet - PASS_PRICE });
      },
      topUp: () => set((s) => ({ wallet: s.wallet + 5000 })),
      goOnline: () => {
        const s = get();
        if (cannotDrive({ termsVersion: s.driverTerms, docs: s.docs, suspended: s.suspended })) return;
        if (!s.driverAccount) return;
        if (identityGap(s.driverAccount, "driver")) return;
        if (!s.driverAccount.checksCleared) return;
        if (carBlock(s.driverAccount.carYear, checksOf(s.driverAccount))) return;
        const traffic = s.trafficPreview ?? false;
        set({
          online: true,
          requests: buildRequests(s.city, s.petrol, s.pump, traffic, laneOf(s.driverAccount)),
          audit: [log("driver", "Went online", "Licence, vehicle papers, and criminal-record screen were in date."), ...s.audit].slice(0, 40),
        });
      },
      goOffline: () => set({ online: false, requests: [] }),
      refreshRequests: () => {
        const s = get();
        if (!s.online) return;
        set({ requests: buildRequests(s.city, s.petrol, s.pump, s.trafficPreview ?? false, laneOf(s.driverAccount)) });
      },
      requestRide: () => {
        const s = get();
        if (s.trip) return "Finish or cancel the trip already on the road.";
        if (!s.riderAccount) return "Create a customer account before you request.";
        const who = identityGap(s.riderAccount, "rider");
        if (who) return who;
        if (!s.riderRules || s.riderTerms !== TERMS_VERSION) return "Accept the current safety notice before you request.";
        if (s.fromId === s.toId) return "Choose two different places.";
        if (s.leaveAt && !/^\d{2}:\d{2}$/.test(s.leaveAt)) return "Choose a pickup time.";
        const from = placeById(s.city, s.fromId);
        const to = placeById(s.city, s.toId);
        const km = roadKm(from, to);
        const traffic = s.trafficPreview ?? false;
        let quote = quoteTrip({
          vehicle: s.vehicle,
          km,
          minutes: tripMinutes(km, traffic),
          petrol: s.petrol,
          traffic,
          hurry: s.hurry,
          pump: s.pump,
          pass: s.pass,
        });
        if (s.offer != null) quote = quoteAtFare(quote, s.offer);
        const method = s.pay === "wallet" ? "wallet" : "transfer";
        if (method === "wallet" && s.wallet < quote.riderPays) {
          return `Wallet is short by ₦${Math.round(quote.riderPays - s.wallet).toLocaleString("en-NG")}. Add money, then pay NaijaMove.`;
        }
        const pool = DRIVERS.filter((d) => !s.blockedPlates.includes(d.plate));
        const older = pool.filter((d) => MODEL_YEAR - d.year >= 10);
        const newer = pool.filter((d) => MODEL_YEAR - d.year < 10);
        const fit = s.vehicle === "hello" ? (older.length ? older : pool) : newer.length ? newer : pool;
        if (fit.length === 0) return "No driver with approved checks is free.";
        const driver = pick(fit);
        const trip: LiveTrip = {
          id: uid(),
          city: s.city,
          fromId: s.fromId,
          toId: s.toId,
          vehicle: s.vehicle,
          pay: method,
          quote,
          phase: "search",
          driver,
          startedAs: "rider",
          at: Date.now(),
          code: four(),
          secondRider: s.vehicle === "share" ? pick(RIDER_NAMES.filter((n) => n !== "You")) : null,
          riderName: s.riderAccount.name,
          pickupMin: 3 + Math.floor(Math.random() * 4),
          parcel: s.parcel,
          leaveAt: s.leaveAt,
          events: [
            note(
              "matched",
              `${driver.name} matched. Licence, vehicle papers, and criminal-record screen are in date.${s.parcel ? " This is a parcel, not a passenger." : ""}${s.leaveAt ? ` Reserved for ${s.leaveAt}.` : ""}`,
            ),
          ],
        };
        set({ trip, lastReceipt: null, tab: "ride" });
        return null;
      },
      markPickup: () =>
        set((s) => (s.trip && s.trip.phase === "search" ? { trip: { ...s.trip, phase: "pickup" } } : {})),
      startTrip: (pin) => {
        const s = get();
        const trip = s.trip;
        if (!trip || trip.phase !== "pickup") return "The car is not at pickup.";
        if (pin.trim() !== trip.code) return "That PIN does not match. The trip stays parked.";
        set({
          trip: {
            ...trip,
            phase: "ontrip",
            events: [...trip.events, note("pin", "PIN matched."), note("started", "Journey started.")],
          },
        });
        return null;
      },
      cancelTrip: () => {
        const trip = get().trip;
        if (!trip || trip.phase === "ontrip") return;
        set((s) => ({
          trip: null,
          audit: [log(trip.startedAs, "Trip cancelled", `Trip ${trip.code} cancelled before the journey.`), ...s.audit].slice(0, 40),
        }));
      },
      shareTrip: (contact) => {
        const name = contact.trim();
        if (name.length < 2) return "Name the person you are sharing this trip with.";
        const trip = get().trip;
        if (!trip || trip.phase === "search") return "Wait until a driver is assigned.";
        set({
          trip: {
            ...trip,
            events: [...trip.events, note("shared", `Live trip note shared with ${name}.`)],
          },
        });
        return null;
      },
      fileReport: (kind, noteText) => {
        const text = noteText.trim();
        if (text.length < 3) return "Write what happened.";
        const s = get();
        const trip = s.trip;
        if (!trip || trip.phase === "search") return "A report needs an assigned trip.";
        const complaint: Complaint = {
          id: uid(),
          at: Date.now(),
          tripCode: trip.code,
          driverName: trip.driver.name,
          plate: trip.driver.plate,
          kind,
          note: text,
          status: "open",
          resolution: null,
        };
        const mine = trip.driver.name === "You";
        const suspend = suspendsDriver(kind) && mine;
        const blockPlate = suspendsDriver(kind) && !mine ? trip.driver.plate : null;
        set({
          trip: {
            ...trip,
            events: [...trip.events, note("incident", `${kind} reported. ${text}`)],
          },
          complaints: [complaint, ...s.complaints].slice(0, 40),
          suspended: suspend ? true : s.suspended,
          appeal: suspend ? "none" : s.appeal,
          online: suspend ? false : s.online,
          requests: suspend ? [] : s.requests,
          blockedPlates: blockPlate && !s.blockedPlates.includes(blockPlate) ? [...s.blockedPlates, blockPlate] : s.blockedPlates,
          audit: [
            log(trip.startedAs, "Incident filed", `${kind} on trip ${trip.code}. ${trip.driver.name}, ${trip.driver.plate}.`),
            ...(suspend ? [log("desk", "Driver suspended", "Theft or an illegal act suspends the driver until appeal.")] : []),
            ...(blockPlate ? [log("desk", "Driver blocked", `${trip.driver.name} cannot be matched until the register is reviewed.`)] : []),
            ...s.audit,
          ].slice(0, 40),
        });
        return null;
      },
      resolveComplaint: (id) =>
        set((s) => ({
          complaints: s.complaints.map((c) =>
            c.id === id && c.status === "open"
              ? { ...c, status: "resolved", resolution: "Closed on the register. Any loss stays with the driver named on the trip." }
              : c,
          ),
          audit: [log("desk", "Complaint closed", `Complaint ${id} marked resolved.`), ...s.audit].slice(0, 40),
        })),
      fileAppeal: (text) => {
        const noteText = text.trim();
        if (noteText.length < 3) return "Write the appeal.";
        const s = get();
        if (!s.suspended) return "You are not suspended.";
        if (s.appeal === "filed") return "An appeal is already on the record.";
        set({
          appeal: "filed",
          audit: [log("driver", "Appeal filed", noteText), ...s.audit].slice(0, 40),
        });
        return null;
      },
      decideAppeal: (reinstate) => {
        const s = get();
        if (!s.suspended || s.appeal !== "filed") return;
        set({
          suspended: reinstate ? false : true,
          appeal: reinstate ? "none" : "refused",
          audit: [
            log("desk", reinstate ? "Reinstated" : "Appeal refused", reinstate ? "Suspension lifted after appeal." : "Suspension stands."),
            ...s.audit,
          ].slice(0, 40),
        });
      },
      expireVehiclePapers: () => {
        const s = get();
        const day = new Date();
        day.setDate(day.getDate() - 1);
        set({
          docs: { ...s.docs, vehicleExpiry: todayKey(day) },
          online: false,
          requests: [],
          audit: [log("desk", "Papers expired", "Vehicle papers are out of date. Driver taken offline."), ...s.audit].slice(0, 40),
        });
      },
      renewVehiclePapers: () =>
        set((s) => ({
          docs: { ...s.docs, vehicleExpiry: "2027-03-15" },
          audit: [log("desk", "Papers renewed", "Vehicle papers valid through 15 Mar 2027."), ...s.audit].slice(0, 40),
        })),
      completeTrip: () => {
        const s = get();
        if (!s.trip || s.trip.phase !== "ontrip") return "The trip has not started.";
        const split = fareSplit(s.trip.quote);
        const method = s.trip.pay === "wallet" ? "wallet" : "transfer";
        const charge = s.trip.startedAs === "rider" && method === "wallet" ? split.youPay : 0;
        if (charge > s.wallet) return "Wallet is short. Add test money before NaijaMove can take this fare.";
        const line: CompanyPayment = {
          id: uid(),
          at: Date.now(),
          code: s.trip.code,
          method,
          payer: s.trip.riderName,
          driver: s.trip.driver.name,
          paidIn: split.paidIn,
          kept: split.kept,
          driverDue: split.driverDue,
          kind: "fare",
        };
        const receipt = toReceipt(s.trip);
        set({
          trip: null,
          lastReceipt: receipt,
          receipts: [receipt, ...s.receipts].slice(0, 40),
          wallet: s.wallet - charge,
          companyHeld: s.companyHeld + split.paidIn,
          driverOwed: s.driverOwed + split.driverDue,
          payments: [line, ...s.payments].slice(0, 40),
          audit: [
            log("desk", "Fare received", `Trip ${s.trip.code}: ₦${Math.round(split.paidIn).toLocaleString("en-NG")} paid to NaijaMove.`),
            ...s.audit,
          ].slice(0, 40),
        });
        return null;
      },
      dismissReceipt: () => set({ lastReceipt: null }),
      rate: (id, rating) =>
        set((s) => ({
          receipts: s.receipts.map((r) => (r.id === id ? { ...r, rating } : r)),
          lastReceipt: s.lastReceipt && s.lastReceipt.id === id ? { ...s.lastReceipt, rating } : s.lastReceipt,
        })),
      accept: (id) => {
        const s = get();
        if (s.trip) return;
        if (cannotDrive({ termsVersion: s.driverTerms, docs: s.docs, suspended: s.suspended }) || carBlock(s.driverAccount?.carYear, checksOf(s.driverAccount)) || identityGap(s.driverAccount, "driver") || !s.driverAccount?.checksCleared) {
          set({ online: false, requests: [] });
          return;
        }
        const req = s.requests.find((r) => r.id === id);
        if (!req) return;
        if (laneOf(s.driverAccount) === "hello" && req.vehicle !== "hello") return;
        const driver = {
          name: s.driverAccount?.name ?? "You",
          car: s.driverAccount?.carMake || "Own car",
          color: "Silver",
          plate: s.driverAccount?.plate || "LSD 204 WKA",
          rating: 4.9,
          trips: s.receipts.filter((r) => r.as === "driver").length + 128,
          year: s.driverAccount?.carYear ?? MODEL_YEAR,
          who: (s.driverAccount?.gender === "Woman" ? "Woman" : "Man") as DriverCard["who"],
        };
        const trip: LiveTrip = {
          id: req.id,
          city: s.city,
          fromId: req.fromId,
          toId: req.toId,
          vehicle: req.vehicle,
          pay: req.pay,
          quote: req.quote,
          phase: "pickup",
          driver: { ...driver, name: "You" },
          startedAs: "driver",
          at: Date.now(),
          code: four(),
          secondRider: req.vehicle === "share" ? pick(RIDER_NAMES.filter((n) => n !== req.rider)) : null,
          riderName: req.rider,
          pickupMin: req.pickupMin,
          parcel: false,
          leaveAt: null,
          events: [note("matched", "You accepted. Your licence, vehicle papers, and criminal-record screen are in date.")],
        };
        set({
          trip,
          requests: s.requests.filter((r) => r.id !== id),
          lastReceipt: null,
          tab: "drive",
        });
      },
      decline: (id) => {
        const s = get();
        const rest = s.requests.filter((r) => r.id !== id);
        const traffic = s.trafficPreview ?? false;
        const [fresh] = buildRequests(s.city, s.petrol, s.pump, traffic, laneOf(s.driverAccount));
        set({ requests: fresh ? [...rest, fresh] : rest });
      },
      resetDemo: () =>
        set({
          pass: false,
          wallet: 20000,
          cashOwed: 0,
          companyHeld: 0,
          driverOwed: 0,
          driverPaid: 0,
          payments: [],
          online: false,
          requests: [],
          trip: null,
          lastReceipt: null,
          receipts: [],
          priorDays: seedWeek(),
          hurry: false,
          parcel: false,
          leaveAt: null,
          pump: true,
          vehicle: "go",
          pay: "transfer",
          offer: null,
          tab: "ride",
          role: "rider",
          platform: "gate",
          riderRules: false,
          driverRules: false,
          riderTerms: null,
          driverTerms: null,
          riderAccount: null,
          driverAccount: null,
          docs: DEFAULT_DOCS,
          suspended: false,
          appeal: "none",
          blockedPlates: [],
          complaints: [],
          audit: [],
        }),
    }),
    {
      name: "waka-preview",
      skipHydration: true,
      partialize: (s) => ({
        tab: s.tab,
        role: s.role,
        platform: s.platform,
        city: s.city,
        petrol: s.petrol,
        pump: s.pump,
        pass: s.pass,
        trafficPreview: s.trafficPreview,
        hurry: s.hurry,
        parcel: s.parcel,
        leaveAt: s.leaveAt,
        fromId: s.fromId,
        toId: s.toId,
        vehicle: s.vehicle,
        pay: s.pay,
        offer: s.offer,
        wallet: s.wallet,
        cashOwed: s.cashOwed,
        companyHeld: s.companyHeld,
        driverOwed: s.driverOwed,
        driverPaid: s.driverPaid,
        payments: s.payments,
        receipts: s.receipts,
        priorDays: s.priorDays,
        riderRules: s.riderRules,
        driverRules: s.driverRules,
        riderTerms: s.riderTerms,
        driverTerms: s.driverTerms,
        riderAccount: s.riderAccount,
        driverAccount: s.driverAccount,
        docs: s.docs,
        suspended: s.suspended,
        appeal: s.appeal,
        blockedPlates: s.blockedPlates,
        complaints: s.complaints,
        audit: s.audit,
      }),
    },
  ),
);

export function useTrafficOn(): boolean {
  const preview = useWaka((s) => s.trafficPreview);
  return preview ?? false;
}
