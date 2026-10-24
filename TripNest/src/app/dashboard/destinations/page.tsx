import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import PageHeader from "@/components/dashboard/PageHeader";
import DestinationsManager, { type DestinationRow } from "@/components/dashboard/DestinationsManager";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Destinations" };

export default async function DashboardDestinationsPage() {
  const user = await requireUser();

  const rows = await db
    .select()
    .from(destinations)
    .where(eq(destinations.userId, user.id))
    .orderBy(desc(destinations.featured), desc(destinations.createdAt));

  const avg = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.avgDailyCost, 0) / rows.length)
    : 0;
  const cheapest = rows.length ? Math.min(...rows.map((r) => r.avgDailyCost)) : 0;
  const dearest = rows.length ? Math.max(...rows.map((r) => r.avgDailyCost)) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Destinations"
        description={`${rows.length} places across Bangladesh. Average daily cost ${formatMoney(avg, user.currency)}, ranging ${formatMoney(Math.round(cheapest), user.currency)} to ${formatMoney(Math.round(dearest), user.currency)}. Click a status pill to move a place from wishlist to visited, or tap the map button to open it in Google Maps.`}
      />
      <DestinationsManager initial={rows as unknown as DestinationRow[]} />
    </>
  );
}
