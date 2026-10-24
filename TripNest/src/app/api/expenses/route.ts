import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { badRequest, intOr, json, num, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const rows = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, user.id))
      .orderBy(desc(expenses.spentOn), desc(expenses.id));
    return json({ expenses: rows });
  });
}

export async function POST(request: Request) {
  return withUser(async (user) => {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Invalid request body.");
    }

    const amount = num(body.amount, 0);
    const spentOn = str(body.spentOn);

    const details: Record<string, string> = {};
    if (amount <= 0) details.amount = "Enter an amount greater than zero.";
    if (!spentOn) details.spentOn = "Pick a date.";
    if (Object.keys(details).length > 0) return badRequest("Please fix the highlighted fields.", details);

    const tripIdRaw = body.tripId;
    const tripId = tripIdRaw === null || tripIdRaw === "" || tripIdRaw === undefined ? null : intOr(tripIdRaw, 0) || null;

    const [created] = await db
      .insert(expenses)
      .values({
        userId: user.id,
        tripId,
        category: str(body.category, "Other"),
        description: str(body.description),
        amount,
        currency: str(body.currency, user.currency || "USD"),
        spentOn,
      })
      .returning();

    return json({ expense: created }, 201);
  });
}
