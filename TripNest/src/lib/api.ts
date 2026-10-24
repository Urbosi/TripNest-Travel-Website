import { getCurrentUser, type SafeUser } from "@/lib/auth";

export function json(data: unknown, status = 200) {
  return Response.json(data as Record<string, unknown>, { status });
}

export function badRequest(message: string, details?: Record<string, string>) {
  return Response.json({ error: message, details: details ?? {} }, { status: 400 });
}

export function unauthorized() {
  return Response.json({ error: "You need to sign in to do that." }, { status: 401 });
}

export function notFound(what = "Resource") {
  return Response.json({ error: `${what} not found.` }, { status: 404 });
}

export async function withUser<T>(
  handler: (user: SafeUser) => Promise<T>,
): Promise<T | Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return handler(user);
}

export function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export function num(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number.parseFloat(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function intOr(value: unknown, fallback: number): number {
  const n = Math.round(num(value, fallback));
  return Number.isFinite(n) ? n : fallback;
}

export function strArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean).slice(0, 8);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 8);
  }
  return [];
}

export function bool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
