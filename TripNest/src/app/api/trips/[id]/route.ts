import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { badRequest, intOr, json, notFound, num, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const tripId = Number(id);
    if (!Number.isInteger(tripId)) return badRequest("Invalid id.");

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Invalid request body.");
    }

    const [existing] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)))
      .limit(1);
    if (!existing) return notFound("Trip");

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if ("title" in body) patch.title = str(body.title) || existing.title;
    if ("destinationId" in body) {
      const raw = body.destinationId;
      patch.destinationId =
        raw === null || raw === "" || raw === undefined ? null : intOr(raw, 0) || null;
    }
    if ("startDate" in body) patch.startDate = str(body.startDate) || existing.startDate;
    if ("endDate" in body) patch.endDate = str(body.endDate) || existing.endDate;
    if ("travelers" in body) patch.travelers = Math.max(1, intOr(body.travelers, existing.travelers));
    if ("budget" in body) patch.budget = num(body.budget, existing.budget);
    if ("status" in body) patch.status = str(body.status, existing.status);
    if ("notes" in body) patch.notes = str(body.notes);

    const startDate = (patch.startDate as string) ?? existing.startDate;
    const endDate = (patch.endDate as string) ?? existing.endDate;
    if (endDate < startDate) return badRequest("End date must be after the start date.");

    const [updated] = await db
      .update(trips)
      .set(patch)
      .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)))
      .returning();

    return json({ trip: updated });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const tripId = Number(id);
    if (!Number.isInteger(tripId)) return badRequest("Invalid id.");

    const deleted = await db
      .delete(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)))
      .returning({ id: trips.id });

    if (deleted.length === 0) return notFound("Trip");
    return json({ ok: true, id: tripId });
  });
}
