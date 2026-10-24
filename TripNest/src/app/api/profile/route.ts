import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { badRequest, json, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  return withUser(async (user) => {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Invalid request body.");
    }

    const name = str(body.name, user.name) || user.name;
    if (name.length < 2) return badRequest("Name must be at least 2 characters.");

    const [updated] = await db
      .update(users)
      .set({
        name,
        homeCity: str(body.homeCity),
        bio: str(body.bio),
        currency: str(body.currency, user.currency) || "USD",
        role: str(body.role, user.role) || "Traveler",
      })
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        homeCity: users.homeCity,
        bio: users.bio,
        currency: users.currency,
        role: users.role,
      });

    return json({ user: updated });
  });
}
