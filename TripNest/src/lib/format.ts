export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"] as const;

export const CONTINENTS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
] as const;

export const TRAVEL_MODES = [
  "Bus",
  "AC Bus",
  "Train",
  "Bus + Boat",
  "Bus + Chander Gari",
  "Bus + Launch",
  "Train / Bus",
  "Bus / Flight",
  "Car",
  "Local transport",
] as const;

/** Administrative divisions of Bangladesh, used as the primary region filter. */
export const DIVISIONS = [
  "Barishal",
  "Bandarban",
  "Bogura",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Moulvibazar",
  "Naogaon",
  "Narayanganj",
  "Netrokona",
  "Patuakhali",
  "Rangamati",
  "Sunamganj",
  "Sylhet",
] as const;

export const DESTINATION_STATUSES = ["wishlist", "planned", "visited"] as const;
export const TRIP_STATUSES = ["planning", "booked", "ongoing", "completed"] as const;
export const EXPENSE_CATEGORIES = [
  "Flights",
  "Lodging",
  "Food",
  "Transport",
  "Activities",
  "Gear",
  "Insurance",
  "Visas",
  "Other",
] as const;
export const MESSAGE_STATUSES = ["new", "read", "archived"] as const;

export function formatMoney(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(`${value}${value.length === 10 ? "T12:00:00Z" : ""}`) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(`${value}${value.length === 10 ? "T12:00:00Z" : ""}`) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function nightsBetween(start: string, end: string): number {
  const a = new Date(`${start}T12:00:00Z`).getTime();
  const b = new Date(`${end}T12:00:00Z`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

export function relativeTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function todayISO(): string {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
