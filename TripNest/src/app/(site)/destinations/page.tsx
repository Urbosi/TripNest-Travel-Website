import Link from "next/link";
import { Suspense } from "react";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import DestinationCard from "@/components/site/DestinationCard";
import { Card, SkeletonCard } from "@/components/ui";
import { DIVISIONS, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Destinations" };

type SearchParams = Promise<{ division?: string; sort?: string; q?: string }>;

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { division = "all", sort = "cost" } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">Destination library</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Every place worth a flight
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          A curated board with honest daily costs, the season that actually works and the small
          details that only show up after you&apos;ve been.
        </p>
      </div>

      <Card className="mt-10 flex flex-wrap items-center gap-2 p-3">
        <FilterLink label="All regions" href={buildHref({ division: "all", sort })} active={division === "all"} />
        {DIVISIONS.map((c) => (
          <FilterLink
            key={c}
            label={c}
            href={buildHref({ division: c, sort })}
            active={division === c}
          />
        ))}
        <span className="ml-auto flex items-center gap-1 rounded-xl bg-sand-100 p-1">
          <FilterLink label="Cheapest" href={buildHref({ division, sort: "cost" })} active={sort === "cost"} subtle />
          <FilterLink label="Top rated" href={buildHref({ division, sort: "rating" })} active={sort === "rating"} subtle />
        </span>
      </Card>

      <Suspense
        fallback={
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        }
      >
        <DestinationGrid division={division} sort={sort} />
      </Suspense>

      <div className="mt-16 rounded-3xl border border-ink/8 bg-white p-8 text-center">
        <h2 className="text-2xl font-black tracking-tight">Want your own board?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink/55">
          Create a free account to save destinations, attach them to dated trips and log what you
          really spent.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-lagoon-600 px-7 text-sm font-bold text-white transition hover:bg-lagoon-700"
        >
          Start free
        </Link>
      </div>
    </div>
  );
}

function buildHref({ division, sort }: { division: string; sort: string }) {
  const params = new URLSearchParams();
  if (division && division !== "all") params.set("division", division);
  if (sort && sort !== "cost") params.set("sort", sort);
  const qs = params.toString();
  return `/destinations${qs ? `?${qs}` : ""}`;
}

function FilterLink({
  label,
  href,
  active,
  subtle = false,
}: {
  label: string;
  href: string;
  active: boolean;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition ${
        active
          ? subtle
            ? "bg-white text-lagoon-700 shadow-sm"
            : "bg-lagoon-600 text-white"
          : subtle
            ? "text-ink/50 hover:text-ink"
            : "text-ink/55 hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

async function DestinationGrid({ division, sort }: { division: string; sort: string }) {
  const rows = await db
    .select()
    .from(destinations)
    .orderBy(desc(destinations.rating), asc(destinations.name));

  const filtered =
    division === "all" ? rows : rows.filter((r) => r.division === division);
  const sorted =
    sort === "rating"
      ? [...filtered].sort((a, b) => b.rating - a.rating)
      : [...filtered].sort((a, b) => a.avgDailyCost - b.avgDailyCost);

  if (sorted.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lagoon-50 text-2xl">
          🗺️
        </div>
        <h3 className="mt-4 text-base font-bold">Nothing here yet for {division}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">
          Try another region, or reset the filters to see the full library.
        </p>
        <Link
          href="/destinations"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink px-5 text-sm font-bold text-white"
        >
          Reset filters
        </Link>
      </div>
    );
  }

  const costs = sorted.map((d) => d.avgDailyCost).filter((n) => n > 0);
  const cheapest = costs.length ? Math.min(...costs) : 0;
  const dearest = costs.length ? Math.max(...costs) : 0;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        <span className="font-bold text-ink">{sorted.length} destinations</span>
        {cheapest > 0 && (
          <span className="text-ink/50">
            from <strong className="text-lagoon-700">{formatMoney(cheapest)}</strong> to{" "}
            <strong className="text-ink/70">{formatMoney(dearest)}</strong> per day
          </span>
        )}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((d) => (
          <DestinationCard key={d.id} destination={d} />
        ))}
      </div>
    </>
  );
}
