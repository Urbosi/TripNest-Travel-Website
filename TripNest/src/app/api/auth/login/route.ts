import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { badRequest, json, str } from "@/lib/api";
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

  const email = str(body.email).toLowerCase();
  const password = str(body.password);

  if (!email || !password) {
    return badRequest("Email and password are required.");
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  await createSession(user.id);
  return json({ user: { id: user.id, name: user.name, email: user.email } });
}
