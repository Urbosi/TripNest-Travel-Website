import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { badRequest, isEmail, json, str } from "@/lib/api";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeeded();
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return badRequest("Invalid request body.");
  }

  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const password = str(body.password);
  const homeCity = str(body.homeCity);

  const details: Record<string, string> = {};
  if (name.length < 2) details.name = "Tell us your name (2+ characters).";
  if (!isEmail(email)) details.email = "That email doesn't look right.";
  if (password.length < 6) details.password = "Use at least 6 characters.";
  if (Object.keys(details).length > 0) return badRequest("Please fix the highlighted fields.", details);

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return badRequest("An account with that email already exists.", {
      email: "Already registered — try signing in.",
    });
  }

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: await hashPassword(password),
      homeCity,
      role: "Traveler",
      bio: "New around here — building my first TripNest board.",
    })
    .returning({ id: users.id, name: users.name, email: users.email });

  await createSession(created.id);
  return json({ user: created }, 201);
}
