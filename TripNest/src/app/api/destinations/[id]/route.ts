import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { badRequest, bool, json, notFound, num, str, strArray, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const destinationId = Number(id);
    if (!Number.isInteger(destinationId)) return badRequest("Invalid id.");

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Invalid request body.");
    }

    const [existing] = await db
      .select()
      .from(destinations)
      .where(and(eq(destinations.id, destinationId), eq(destinations.userId, user.id)))
      .limit(1);
    if (!existing) return notFound("Destination");

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if ("name" in body) patch.name = str(body.name) || existing.name;
    if ("country" in body) patch.country = str(body.country) || existing.country;
    if ("continent" in body) patch.continent = str(body.continent, existing.continent);
    if ("division" in body) patch.division = str(body.division, existing.division);
    if ("summary" in body) patch.summary = str(body.summary);
    if ("description" in body) patch.description = str(body.description);
    if ("imageUrl" in body) patch.imageUrl = str(body.imageUrl) || existing.imageUrl;
    if ("bestSeason" in body) patch.bestSeason = str(body.bestSeason, existing.bestSeason);
    if ("currency" in body) patch.currency = str(body.currency, existing.currency);
    if ("travelMode" in body) patch.travelMode = str(body.travelMode, existing.travelMode);
    if ("travelTime" in body) patch.travelTime = str(body.travelTime);
    if ("accessNote" in body) patch.accessNote = str(body.accessNote);
    if ("intercityTransport" in body)
      patch.intercityTransport = num(body.intercityTransport, existing.intercityTransport);
    if ("entryFee" in body) patch.entryFee = num(body.entryFee, existing.entryFee);
    if ("distanceFromDhaka" in body)
      patch.distanceFromDhaka = num(body.distanceFromDhaka, existing.distanceFromDhaka);
    if ("rating" in body)
      patch.rating = Math.min(5, Math.max(0, num(body.rating, existing.rating)));
    if ("latitude" in body) patch.latitude = num(body.latitude, existing.latitude);
    if ("longitude" in body) patch.longitude = num(body.longitude, existing.longitude);
    if ("tags" in body) patch.tags = strArray(body.tags);
    if ("status" in body) patch.status = str(body.status, existing.status);
    if ("featured" in body) patch.featured = bool(body.featured, existing.featured);

    // Per-day cost lines — recompute the headline figure from whichever parts were sent.
    const lodgingCost = "lodgingCost" in body ? num(body.lodgingCost, existing.lodgingCost) : existing.lodgingCost;
    const foodCost = "foodCost" in body ? num(body.foodCost, existing.foodCost) : existing.foodCost;
    const localTransportCost =
      "localTransportCost" in body
        ? num(body.localTransportCost, existing.localTransportCost)
        : existing.localTransportCost;
    const activityCost =
      "activityCost" in body ? num(body.activityCost, existing.activityCost) : existing.activityCost;

    if (
      "lodgingCost" in body ||
      "foodCost" in body ||
      "localTransportCost" in body ||
      "activityCost" in body
    ) {
      patch.lodgingCost = lodgingCost;
      patch.foodCost = foodCost;
      patch.localTransportCost = localTransportCost;
      patch.activityCost = activityCost;
      patch.avgDailyCost = lodgingCost + foodCost + localTransportCost + activityCost;
    } else if ("avgDailyCost" in body) {
      patch.avgDailyCost = num(body.avgDailyCost, existing.avgDailyCost);
    }

    const [updated] = await db
      .update(destinations)
      .set(patch)
      .where(and(eq(destinations.id, destinationId), eq(destinations.userId, user.id)))
      .returning();

    return json({ destination: updated });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const destinationId = Number(id);
    if (!Number.isInteger(destinationId)) return badRequest("Invalid id.");

    const deleted = await db
      .delete(destinations)
      .where(and(eq(destinations.id, destinationId), eq(destinations.userId, user.id)))
      .returning({ id: destinations.id });

    if (deleted.length === 0) return notFound("Destination");
    return json({ ok: true, id: destinationId });
  });
}
