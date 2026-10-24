import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations, expenses, trips } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import PageHeader from "@/components/dashboard/PageHeader";
import TripsManager, { type TripRow } from "@/components/dashboard/TripsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trips" };

export default async function DashboardTripsPage() {
  const user = await requireUser();

  const [tripRows, destRows, expenseRows] = await Promise.all([
    db.select().from(trips).where(eq(trips.userId, user.id)).orderBy(asc(trips.startDate)),
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
    db.select({ tripId: expenses.tripId, amount: expenses.amount }).from(expenses).where(eq(expenses.userId, user.id)),
  ]);

  const spendByTrip: Record<number, number> = {};
  for (const e of expenseRows) {
    if (e.tripId === null) continue;
    spendByTrip[e.tripId] = (spendByTrip[e.tripId] ?? 0) + e.amount;
  }

  return (
    <>
      <PageHeader
        eyebrow="Itineraries"
        title="Trips"
        description="Dated plans with budgets and live spend. Change the status dropdown on any card to move a trip through planning, booked, ongoing and completed."
      />
      <TripsManager
        initial={tripRows as unknown as TripRow[]}
        destinations={destRows}
        spendByTrip={spendByTrip}
        currency={user.currency}
      />
    </>
  );
}
