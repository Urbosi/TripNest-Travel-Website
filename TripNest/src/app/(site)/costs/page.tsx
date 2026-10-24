import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import CostCalculator from "@/components/site/CostCalculator";
import CostBreakdownTable from "@/components/site/CostBreakdownTable";
import { Card } from "@/components/ui";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Travel Cost" };

const DIVISION_COLORS: Record<string, string> = {
  Chattogram: "#0d8371",
  Sylhet: "#14a38b",
  Rangamati: "#7ddcc4",
  Bandarban: "#4fb8a0",
  Dhaka: "#6b8bd6",
  Khulna: "#ff8a6a",
  Barishal: "#f7b267",
  Moulvibazar: "#a78bfa",
  Sunamganj: "#f472b6",
  Naogaon: "#94a3b8",
  Bogura: "#c4b5fd",
  Narayanganj: "#5eead4",
  Netrokona: "#fda4af",
  Patuakhali: "#fbbf24",
};

export default async function CostsPage() {
  const rows = await db
    .select({
      id: destinations.id,
      name: destinations.name,
      division: destinations.division,
      avgDailyCost: destinations.avgDailyCost,
      lodgingCost: destinations.lodgingCost,
      foodCost: destinations.foodCost,
      localTransportCost: destinations.localTransportCost,
      activityCost: destinations.activityCost,
      intercityTransport: destinations.intercityTransport,
      entryFee: destinations.entryFee,
      currency: destinations.currency,
      latitude: destinations.latitude,
      longitude: destinations.longitude,
      travelMode: destinations.travelMode,
      travelTime: destinations.travelTime,
      distanceFromDhaka: destinations.distanceFromDhaka,
    })
    .from(destinations)
    .orderBy(asc(destinations.avgDailyCost));

  const calculatorOptions = rows.map((r) => ({
    id: r.id,
    name: r.name,
    division: r.division,
    avgDailyCost: r.avgDailyCost,
    intercityTransport: r.intercityTransport,
    currency: r.currency,
  }));

  const byDivision = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const e = byDivision.get(r.division) ?? { total: 0, count: 0 };
    e.total += r.avgDailyCost;
    e.count += 1;
    byDivision.set(r.division, e);
  }
  const divisionAverages = [...byDivision.entries()]
    .map(([name, v]) => ({ name, avg: Math.round(v.total / v.count) }))
    .sort((a, b) => b.avg - a.avg);
  const maxAvg = Math.max(1, ...divisionAverages.map((c) => c.avg));

  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];
  const avgIntercity = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.intercityTransport, 0) / rows.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">Travel cost</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          What a day out in Bangladesh really costs
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Every figure below is in <strong className="text-ink/80">BDT (৳)</strong> and broken down
          per person — lodging for a night, three meals plus cha, local rickshaw and CNG fare, and
          boat or entry fees. Intercity transport from Dhaka is always listed separately, because
          that&apos;s the part every plan forgets.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Index coverage</p>
          <p className="mt-2 text-3xl font-black text-ink">{rows.length}</p>
          <p className="text-xs text-ink/50">destinations priced</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Most affordable</p>
          <p className="mt-2 text-3xl font-black text-lagoon-700">
            {cheapest ? formatMoney(Math.round(cheapest.avgDailyCost), cheapest.currency) : "—"}
          </p>
          <p className="text-xs text-ink/50">{cheapest ? `${cheapest.name}, ${cheapest.division}` : "—"}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Priciest</p>
          <p className="mt-2 text-3xl font-black text-coral-500">
            {dearest ? formatMoney(Math.round(dearest.avgDailyCost), dearest.currency) : "—"}
          </p>
          <p className="text-xs text-ink/50">{dearest ? `${dearest.name}, ${dearest.division}` : "—"}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/40">Avg from Dhaka</p>
          <p className="mt-2 text-3xl font-black text-ink">{formatMoney(avgIntercity)}</p>
          <p className="text-xs text-ink/50">round trip, per person</p>
        </Card>
      </div>

      <div className="mt-8">
        <CostCalculator options={calculatorOptions} />
      </div>

      <div className="mt-12">
        <CostBreakdownTable rows={rows} />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-black tracking-tight">Average by division</h2>
          <p className="mt-1 text-sm text-ink/55">Per person, per day, excluding the Dhaka fare.</p>
          <ul className="mt-7 space-y-4">
            {divisionAverages.map((c) => (
              <li key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink/75">{c.name}</span>
                  <span className="font-black tabular-nums">{formatMoney(c.avg)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sand-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(c.avg / maxAvg) * 100}%`,
                      background: DIVISION_COLORS[c.name] ?? "#0d8371",
                    }}
                  />
                </div>
              </li>
            ))}
            {divisionAverages.length === 0 && <li className="text-sm text-ink/50">No data yet.</li>}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-ink/8 px-6 py-5">
            <h2 className="text-lg font-black tracking-tight">Cheapest to priciest</h2>
            <p className="mt-1 text-sm text-ink/55">
              Every destination ranked by daily cost, cheapest first.
            </p>
          </div>
          <ul className="divide-y divide-ink/5">
            {rows.map((r, i) => {
              const width = (r.avgDailyCost / (rows[rows.length - 1]?.avgDailyCost || 1)) * 100;
              return (
                <li key={r.id} className="flex items-center gap-4 px-6 py-3">
                  <span className="w-6 shrink-0 text-xs font-black tabular-nums text-ink/30">
                    {i + 1}
                  </span>
                  <span className="w-32 shrink-0 truncate text-sm font-bold text-ink">{r.name}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand-100">
                    <span
                      className="block h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${width}%`,
                        background: DIVISION_COLORS[r.division] ?? "#0d8371",
                      }}
                    />
                  </span>
                  <span className="w-20 shrink-0 text-right text-sm font-black tabular-nums text-lagoon-700">
                    {formatMoney(Math.round(r.avgDailyCost), r.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            t: "What's inside the daily figure",
            d: "One night's lodging at a mid-range local hotel, three meals plus tea priced at local counters, rickshaw and CNG fare for the day, and boat hire or guide fees.",
            icon: "🧾",
          },
          {
            t: "What we list separately",
            d: "Round-trip intercity transport from Dhaka — bus, train, launch or flight — plus one-off entry fees for forts, museums and protected areas.",
            icon: "🚌",
          },
          {
            t: "Season matters a lot",
            d: "Eid weeks and the December–January peak push Cox's Bazar and Saint Martin rates up 50–100%. Monsoon transforms Ratargul and Tanguar Haor from good to spectacular.",
            icon: "📅",
          },
        ].map((c) => (
          <Card key={c.t} className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-lagoon-50 text-lg">
              {c.icon}
            </span>
            <h3 className="mt-4 font-bold text-ink">{c.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">{c.d}</p>
          </Card>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink px-8 py-8 text-white">
        <div>
          <h2 className="text-xl font-black tracking-tight">Track the real takas on your next trip</h2>
          <p className="mt-1 text-sm text-white/60">
            Log spend as it happens and compare it against the estimate for that exact destination.
          </p>
        </div>
        <Link
          href="/signup"
          className="inline-flex h-12 items-center rounded-xl bg-lagoon-500 px-6 text-sm font-bold transition hover:bg-lagoon-400"
        >
          Start tracking free
        </Link>
      </div>
    </div>
  );
}
