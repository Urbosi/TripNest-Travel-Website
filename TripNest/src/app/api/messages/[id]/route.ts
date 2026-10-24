import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { badRequest, json, notFound, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async () => {
    const { id } = await params;
    const messageId = Number(id);
    if (!Number.isInteger(messageId)) return badRequest("Invalid id.");

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Invalid request body.");
    }

    const status = str(body.status);
    if (!["new", "read", "archived"].includes(status)) {
      return badRequest("Status must be new, read or archived.");
    }

    const [updated] = await db
      .update(messages)
      .set({ status })
      .where(eq(messages.id, messageId))
      .returning();

    if (!updated) return notFound("Message");
    return json({ message: updated });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async () => {
    const { id } = await params;
    const messageId = Number(id);
    if (!Number.isInteger(messageId)) return badRequest("Invalid id.");

    const deleted = await db
      .delete(messages)
      .where(eq(messages.id, messageId))
      .returning({ id: messages.id });

    if (deleted.length === 0) return notFound("Message");
    return json({ ok: true, id: messageId });
  });
}
