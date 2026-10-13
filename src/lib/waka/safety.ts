export const TERMS_VERSION = "2026-10-13";
export const ADMIN_KEY = "NAIJA-DESK";

export type DocSet = {
  licenceExpiry: string;
  vehicleExpiry: string;
  criminalOn: string;
};

export type TripEvent = {
  id: string;
  at: number;
  kind: "matched" | "pin" | "started" | "shared" | "incident" | "ended" | "cancelled";
  detail: string;
};

export type ComplaintKind = "theft" | "damage" | "unsafe" | "illegal";

export type Complaint = {
  id: string;
  at: number;
  tripCode: string;
  driverName: string;
  plate: string;
  kind: ComplaintKind;
  note: string;
  status: "open" | "resolved";
  resolution: string | null;
};

export type AuditEntry = {
  id: string;
  at: number;
  actor: "rider" | "driver" | "desk";
  action: string;
  detail: string;
};

export const DEFAULT_DOCS: DocSet = {
  licenceExpiry: "2027-06-30",
  vehicleExpiry: "2027-03-15",
  criminalOn: "2026-08-04",
};

export const COMPLAINT_LABEL: Record<ComplaintKind, string> = {
  theft: "Theft",
  damage: "Damage",
  unsafe: "Unsafe driving",
  illegal: "Illegal act",
};

export function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function plusYears(iso: string, years: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${(y ?? 2026) + years}-${String(m ?? 1).padStart(2, "0")}-${String(d ?? 1).padStart(2, "0")}`;
}

export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[(m ?? 1) - 1]} ${y}`;
}

export function clock(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function docsReport(docs: DocSet, now = new Date()) {
  const today = todayKey(now);
  const criminalUntil = plusYears(docs.criminalOn, 1);
  const rows = [
    { label: "Driver's licence", until: docs.licenceExpiry, ok: docs.licenceExpiry >= today },
    { label: "Vehicle papers", until: docs.vehicleExpiry, ok: docs.vehicleExpiry >= today },
    { label: "Criminal-record screen", until: criminalUntil, ok: criminalUntil >= today },
  ];
  return { ok: rows.every((row) => row.ok), rows };
}

export function cannotDrive(input: {
  termsVersion: string | null;
  docs: DocSet;
  suspended: boolean;
  now?: Date;
}): string | null {
  if (input.suspended) return "Suspended. You cannot take a trip until an appeal is filed and the desk reinstates you.";
  if (input.termsVersion !== TERMS_VERSION) return "Accept the current driver charter before you go online.";
  if (!docsReport(input.docs, input.now).ok) return "A required document is out of date. Renew it on Safety before you go online.";
  return null;
}

export function suspendsDriver(kind: ComplaintKind): boolean {
  return kind === "theft" || kind === "illegal";
}
