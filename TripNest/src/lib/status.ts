/** Shared, server-safe badge tone helpers (no "use client" so both trees can import it). */

export type Tone =
  | "neutral"
  | "lagoon"
  | "amber"
  | "rose"
  | "indigo"
  | "sky"
  | "emerald";

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  lagoon: "bg-lagoon-100 text-lagoon-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  indigo: "bg-indigo-100 text-indigo-700",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

export function toneClass(tone: Tone): string {
  return TONE_CLASSES[tone];
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "visited":
    case "completed":
    case "read":
      return "emerald";
    case "planned":
    case "booked":
      return "indigo";
    case "ongoing":
      return "amber";
    case "planning":
      return "sky";
    case "wishlist":
      return "amber";
    case "archived":
      return "neutral";
    default:
      return "neutral";
  }
}
