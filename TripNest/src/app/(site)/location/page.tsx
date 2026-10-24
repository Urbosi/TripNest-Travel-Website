import { asc } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import LocationMap from "@/components/site/LocationMap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Location" };

export default async function LocationPage() {
  const rows = await db
    .select({
      id: destinations.id,
      name: destinations.name,
      country: destinations.country,
      division: destinations.division,
      latitude: destinations.latitude,
      longitude: destinations.longitude,
      avgDailyCost: destinations.avgDailyCost,
      currency: destinations.currency,
      rating: destinations.rating,
      summary: destinations.summary,
      bestSeason: destinations.bestSeason,
      status: destinations.status,
      imageUrl: destinations.imageUrl,
      travelMode: destinations.travelMode,
      travelTime: destinations.travelTime,
      accessNote: destinations.accessNote,
      distanceFromDhaka: destinations.distanceFromDhaka,
      intercityTransport: destinations.intercityTransport,
    })
    .from(destinations)
    .orderBy(asc(destinations.name));

  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">
          Location explorer
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          All 25 destinations across Bangladesh
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Every spot on the board plotted from its real coordinates. Filter by division, tap a pin,
          then open it straight in Google Maps or get turn-by-turn directions.
        </p>
      </div>

      <div className="mt-10">
        <LocationMap pins={rows} />
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "🗺️", t: "8 divisions", d: "Chattogram to Rangamati — full national coverage." },
          { icon: "📍", t: "Google Maps ready", d: "One tap opens the real map or launches directions." },
          { icon: "৳", t: "Cost overlay", d: "Compare per-day spend without leaving the map." },
          { icon: "⚠️", t: "Access notes", d: "Permits, ID checks and seasonal closures flagged inline." },
        ].map((f) => (
          <div key={f.t} className="rounded-2xl border border-ink/8 bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-lagoon-50 text-lg">
              {f.icon}
            </span>
            <h3 className="mt-4 font-bold text-ink">{f.t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/55">{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
