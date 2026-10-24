import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations, expenses, trips } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { statusTone } from "@/lib/status";
import { Badge, Card, EmptyState } from "@/components/ui";
import { formatDate, formatMoney, formatShortDate, nightsBetween, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

const CATEGORY_COLORS: Record<string, string> = {
  Flights: "#0d8371",
  Lodging: "#14a38b",
  Food: "#7ddcc4",
  Transport: "#ff8a6a",
  Activities: "#f7b267",
  Gear: "#6b8bd6",
  Insurance: "#a78bfa",
  Visas: "#f472b6",
  Other: "#94a3b8",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const today = todayISO();

  const [allDestinations, allTrips, allExpenses] = await Promise.all([
    db.select().from(destinations).where(eq(destinations.userId, user.id)).orderBy(desc(destinations.createdAt)),
    db.select().from(trips).where(eq(trips.userId, user.id)).orderBy(asc(trips.startDate)),
    db.select().from(expenses).where(eq(expenses.userId, user.id)).orderBy(desc(expenses.spentOn), desc(expenses.id)),
  ]);

  const tripById = new Map(allTrips.map((t) => [t.id, t]));
  const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = allTrips.reduce((s, t) => s + t.budget, 0);
  const upcoming = allTrips
    .filter((t) => t.endDate >= today && t.status !== "completed")
    .slice(0, 3);
  const visited = allDestinations.filter((d) => d.status === "visited").length;
  const wishlist = allDestinations.filter((d) => d.status === "wishlist").length;

  const byCategory = Object.entries(
    allExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCategory = Math.max(1, ...byCategory.map(([, v]) => v));
  const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const stats = [
    { label: "Destinations", value: String(allDestinations.length), sub: `${visited} visited · ${wishlist} to go`, icon: "📍", href: "/dashboard/destinations" },
    { label: "Trips", value: String(allTrips.length), sub: `${upcoming.length} upcoming`, icon: "🗓️", href: "/dashboard/trips" },
    { label: "Total logged spend", value: formatMoney(Math.round(totalSpent)), sub: `${allExpenses.length} expenses`, icon: "💸", href: "/dashboard/expenses" },
    { label: "Combined budget", value: formatMoney(Math.round(totalBudget)), sub: `${budgetPct}% committed`, icon: "🎯", href: "/dashboard/expenses" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lagoon-600">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Hi {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            {upcoming.length > 0
              ? `Next up: ${upcoming[0].title}, starting ${formatDate(upcoming[0].startDate)}.`
              : "Nothing on the calendar yet — time to plan something."}
          </p>
        </div>
        <Link
          href="/dashboard/expenses"
          className="inline-flex h-11 items-center rounded-xl bg-lagoon-600 px-5 text-sm font-bold text-white shadow-sm shadow-lagoon-600/25 transition hover:bg-lagoon-700"
        >
          + Log an expense
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="card-hover h-full p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-lagoon-50 text-base">
                  {s.icon}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink/30">→</span>
              </div>
              <p className="mt-4 text-2xl font-black tracking-tight text-ink">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-ink/40">{s.label}</p>
              <p className="mt-1 text-xs text-ink/50">{s.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-tight">Budget vs spend</h2>
            <Badge tone={budgetPct > 90 ? "rose" : budgetPct > 70 ? "amber" : "lagoon"}>
              {budgetPct}% committed
            </Badge>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-sand-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lagoon-600 to-lagoon-300 transition-all duration-700"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold text-ink/50">
            <span>{formatMoney(Math.round(totalSpent))} spent</span>
            <span>{formatMoney(Math.round(totalBudget))} budgeted</span>
          </div>

          <div className="mt-7">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/40">
              Spend by category
            </h3>
            {byCategory.length === 0 ? (
              <p className="mt-4 text-sm text-ink/50">No expenses logged yet.</p>
            ) : (
              <ul className="mt-4 space-y-3.5">
                {byCategory.map(([cat, val]) => (
                  <li key={cat}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-ink/70">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: CATEGORY_COLORS[cat] ?? "#94a3b8" }}
                        />
                        {cat}
                      </span>
                      <span className="font-black tabular-nums text-ink">
                        {formatMoney(Math.round(val))}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(val / maxCategory) * 100}%`,
                          background: CATEGORY_COLORS[cat] ?? "#94a3b8",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-tight">Upcoming trips</h2>
            <Link href="/dashboard/trips" className="text-xs font-bold text-lagoon-700 hover:underline">
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon="🗓️"
                title="No trips scheduled"
                description="Turn one of your wishlist destinations into a dated itinerary."
                action={
                  <Link
                    href="/dashboard/trips"
                    className="mt-2 inline-flex h-10 items-center rounded-xl bg-ink px-5 text-sm font-bold text-white"
                  >
                    Plan a trip
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {upcoming.map((t) => {
                const dest = allDestinations.find((d) => d.id === t.destinationId);
                const spent = allExpenses
                  .filter((e) => e.tripId === t.id)
                  .reduce((s, e) => s + e.amount, 0);
                const pct = t.budget > 0 ? Math.min(100, Math.round((spent / t.budget) * 100)) : 0;
                return (
                  <li key={t.id} className="rounded-2xl border border-ink/8 bg-sand-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-ink">{t.title}</p>
                        <p className="text-xs text-ink/50">
                          {dest ? `${dest.name}, ${dest.country} · ` : ""}
                          {formatShortDate(t.startDate)} → {formatShortDate(t.endDate)}
                        </p>
                      </div>
                      <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-lagoon-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 flex justify-between text-[11px] font-semibold text-ink/45">
                      <span>{nightsBetween(t.startDate, t.endDate)} nights · {t.travelers}p</span>
                      <span>
                        {formatMoney(Math.round(spent))} / {formatMoney(Math.round(t.budget))}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/8 px-6 py-4">
          <h2 className="text-base font-black tracking-tight">Recent expenses</h2>
          <Link href="/dashboard/expenses" className="text-xs font-bold text-lagoon-700 hover:underline">
            Manage
          </Link>
        </div>
        {allExpenses.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="🧾"
              title="Nothing logged yet"
              description="Add your first expense — flights, a hotel deposit, or that airport coffee."
            />
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {allExpenses.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-6 py-3.5">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black text-white"
                  style={{ background: CATEGORY_COLORS[e.category] ?? "#94a3b8" }}
                >
                  {e.category.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {e.description || e.category}
                  </p>
                  <p className="text-xs text-ink/45">
                    {formatDate(e.spentOn)}
                    {e.tripId && tripById.get(e.tripId) ? ` · ${tripById.get(e.tripId)!.title}` : " · unassigned"}
                  </p>
                </div>
                <span className="text-sm font-black tabular-nums text-ink">
                  {formatMoney(e.amount, e.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
