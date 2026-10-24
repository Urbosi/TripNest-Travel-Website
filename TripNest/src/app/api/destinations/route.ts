import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { badRequest, bool, json, num, str, strArray, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withUser(async (user) => {
    const url = new URL(request.url);
    const q = str(url.searchParams.get("q"));
    const status = str(url.searchParams.get("status"));

    const filters = [eq(destinations.userId, user.id)];
    if (q) {
      const like = `%${q}%`;
      const search = or(
        ilike(destinations.name, like),
        ilike(destinations.country, like),
        ilike(destinations.division, like),
      );
      if (search) filters.push(search);
    }
    if (status && status !== "all") filters.push(eq(destinations.status, status));

    const rows = await db
      .select()
      .from(destinations)
      .where(and(...filters))
      .orderBy(desc(destinations.featured), desc(destinations.createdAt));

    return json({ destinations: rows });
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

    const name = str(body.name);
    const country = str(body.country);
    if (!name) return badRequest("Destination name is required.", { name: "Required" });
    if (!country) return badRequest("Country is required.", { country: "Required" });

    const lodgingCost = num(body.lodgingCost, 0);
    const foodCost = num(body.foodCost, 0);
    const localTransportCost = num(body.localTransportCost, 0);
    const activityCost = num(body.activityCost, 0);

    // Derive the headline figure from the individual lines when they are supplied.
    const computedDaily = lodgingCost + foodCost + localTransportCost + activityCost;
    const avgDailyCost =
      "avgDailyCost" in body && !computedDaily ? num(body.avgDailyCost, 0) : computedDaily;

    const [created] = await db
      .insert(destinations)
      .values({
        userId: user.id,
        name,
        country,
        continent: str(body.continent, "Asia"),
        division: str(body.division, "Dhaka"),
        summary: str(body.summary),
        description: str(body.description),
        imageUrl: str(body.imageUrl),
        bestSeason: str(body.bestSeason, "Year-round"),
        avgDailyCost,
        currency: str(body.currency, user.currency || "BDT"),
        lodgingCost,
        foodCost,
        localTransportCost,
        activityCost,
        intercityTransport: num(body.intercityTransport, 0),
        entryFee: num(body.entryFee, 0),
        distanceFromDhaka: num(body.distanceFromDhaka, 0),
        travelMode: str(body.travelMode, "Bus"),
        travelTime: str(body.travelTime),
        accessNote: str(body.accessNote),
        rating: Math.min(5, Math.max(0, num(body.rating, 4.5))),
        latitude: num(body.latitude, 0),
        longitude: num(body.longitude, 0),
        tags: strArray(body.tags),
        status: str(body.status, "wishlist"),
        featured: bool(body.featured, false),
      })
      .returning();

    return json({ destination: created }, 201);
  });
}
