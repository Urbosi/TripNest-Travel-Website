import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { badRequest, intOr, json, num, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const rows = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, user.id))
      .orderBy(asc(trips.startDate));
    return json({ trips: rows });
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

    const title = str(body.title);
    const startDate = str(body.startDate);
    const endDate = str(body.endDate);

    const details: Record<string, string> = {};
    if (!title) details.title = "Give the trip a name.";
    if (!startDate) details.startDate = "Pick a start date.";
    if (!endDate) details.endDate = "Pick an end date.";
    if (startDate && endDate && endDate < startDate) {
      details.endDate = "End date must be after the start date.";
    }
    if (Object.keys(details).length > 0) {
      return badRequest("Please fix the highlighted fields.", details);
    }

    const destinationIdRaw = body.destinationId;
    const destinationId =
      destinationIdRaw === null || destinationIdRaw === "" || destinationIdRaw === undefined
        ? null
        : intOr(destinationIdRaw, 0) || null;

    const [created] = await db
      .insert(trips)
      .values({
        userId: user.id,
        destinationId,
        title,
        startDate,
        endDate,
        travelers: Math.max(1, intOr(body.travelers, 1)),
        budget: num(body.budget, 0),
        status: str(body.status, "planning"),
        notes: str(body.notes),
      })
      .returning();

    return json({ trip: created }, 201);
  });
}
