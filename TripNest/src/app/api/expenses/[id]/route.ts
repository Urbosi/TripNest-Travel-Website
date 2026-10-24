import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { badRequest, intOr, json, notFound, num, str, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const expenseId = Number(id);
    if (!Number.isInteger(expenseId)) return badRequest("Invalid id.");

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Invalid request body.");
    }

    const [existing] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, user.id)))
      .limit(1);
    if (!existing) return notFound("Expense");

    const patch: Record<string, unknown> = {};
    if ("category" in body) patch.category = str(body.category, existing.category);
    if ("description" in body) patch.description = str(body.description);
    if ("amount" in body) {
      const amount = num(body.amount, existing.amount);
      if (amount <= 0) return badRequest("Amount must be greater than zero.");
      patch.amount = amount;
    }
    if ("currency" in body) patch.currency = str(body.currency, existing.currency);
    if ("spentOn" in body) patch.spentOn = str(body.spentOn) || existing.spentOn;
    if ("tripId" in body) {
      const raw = body.tripId;
      patch.tripId = raw === null || raw === "" || raw === undefined ? null : intOr(raw, 0) || null;
    }

    const [updated] = await db
      .update(expenses)
      .set(patch)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, user.id)))
      .returning();

    return json({ expense: updated });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withUser(async (user) => {
    const { id } = await params;
    const expenseId = Number(id);
    if (!Number.isInteger(expenseId)) return badRequest("Invalid id.");

    const deleted = await db
      .delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, user.id)))
      .returning({ id: expenses.id });

    if (deleted.length === 0) return notFound("Expense");
    return json({ ok: true, id: expenseId });
  });
}
