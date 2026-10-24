import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations, expenses, trips } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import PageHeader from "@/components/dashboard/PageHeader";
import ExpensesManager, { type ExpenseRow } from "@/components/dashboard/ExpensesManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Travel cost" };

export default async function DashboardExpensesPage() {
  const user = await requireUser();

  const [expenseRows, tripRows, destRows] = await Promise.all([
    db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, user.id))
      .orderBy(desc(expenses.spentOn), desc(expenses.id)),
    db
      .select({ id: trips.id, title: trips.title })
      .from(trips)
      .where(eq(trips.userId, user.id))
      .orderBy(asc(trips.startDate)),
    db
      .select({
        id: destinations.id,
        name: destinations.name,
        country: destinations.country,
        avgDailyCost: destinations.avgDailyCost,
      })
      .from(destinations)
      .where(eq(destinations.userId, user.id))
      .orderBy(asc(destinations.name)),
  ]);

  const plannedBudget = tripRows.reduce(() => 0, 0);

  return (
    <>
      <PageHeader
        eyebrow="Travel cost"
        title="Expense tracker"
        description={`Every dollar of travel spend in one place. Use the quick-log buttons for small purchases and assign bigger items to a trip so your budget pacing stays honest.${plannedBudget ? "" : ""}`}
      />
      <ExpensesManager
        initial={expenseRows as unknown as ExpenseRow[]}
        trips={tripRows}
        destinations={destRows}
        currency={user.currency}
      />
    </>
  );
}
