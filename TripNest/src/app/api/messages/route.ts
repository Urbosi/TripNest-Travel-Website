import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { badRequest, isEmail, json, str, withUser } from "@/lib/api";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

/** Public endpoint — anyone can send a contact message. */
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
  const subject = str(body.subject, "General enquiry") || "General enquiry";
  const message = str(body.message);

  const details: Record<string, string> = {};
  if (name.length < 2) details.name = "Tell us who you are.";
  if (!isEmail(email)) details.email = "We need a valid email to reply.";
  if (message.length < 10) details.message = "Add a little more detail (10+ characters).";
  if (Object.keys(details).length > 0) return badRequest("Please fix the highlighted fields.", details);

  const [created] = await db
    .insert(messages)
    .values({ name, email, subject, message })
    .returning();

  return json({ message: created }, 201);
}

/** Authenticated inbox read. */
export async function GET() {
  return withUser(async () => {
    const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
    return json({ messages: rows });
  });
}
