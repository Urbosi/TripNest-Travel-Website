import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import DestinationCard from "@/components/site/DestinationCard";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.pexels.com/photos/38183292/pexels-photo-38183292.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const HERO_SMALL =
  "https://images.pexels.com/photos/37562349/pexels-photo-37562349.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const HERO_SMALL_2 =
  "https://images.pexels.com/photos/35458090/pexels-photo-35458090.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export default async function HomePage() {
  const featured = await loadFeatured();
  const costs = featured.map((d) => d.avgDailyCost).filter((n) => n > 0);
  const stats = {
    count: featured.length,
    cheapest: costs.length ? Math.min(...costs) : 0,
    priciest: costs.length ? Math.max(...costs) : 0,
    avg: costs.length ? Math.round(costs.reduce((a, b) => a + b, 0) / costs.length) : 0,
  };

  return (
    <>
      {/* ---------------------------------- Hero --------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-lagoon-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-coral-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-lagoon-300/60 bg-lagoon-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-lagoon-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lagoon-500" />
              25 destinations · all 8 divisions · prices in taka
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Know the cost.
              <br />
              Then book the{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-lagoon-600">trip.</span>
                <svg
                  className="absolute -bottom-2 left-0 z-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 9C40 3 90 2 198 6"
                    stroke="var(--color-coral-400)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg">
              TripNest is a travel planner built for Bangladesh — from Cox&apos;s Bazar to
              Ratargul, Sajek to the Sundarbans. Real per-day costs in ৳, the intercity fare from
              Dhaka, Google Maps for every pin, and every taka you spend logged against a budget.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-lagoon-600 px-6 text-sm font-bold text-white shadow-lg shadow-lagoon-600/25 transition hover:bg-lagoon-700 hover:shadow-xl"
              >
                Start planning free
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/costs"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink/15 bg-white px-6 text-sm font-bold text-ink transition hover:border-lagoon-500 hover:text-lagoon-700"
              >
                See all 25 trip costs
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink/8 pt-7">
              {[
                { k: "Avg daily cost", v: stats.avg ? formatMoney(stats.avg) : "—" },
                { k: "Daily range", v: stats.cheapest ? `${formatMoney(stats.cheapest)}–${formatMoney(stats.priciest)}` : "—" },
                { k: "Destinations", v: "25" },
              ].map((s) => (
                <div key={s.k}>
                  <dd className="text-xl font-black text-ink">{s.v}</dd>
                  <dt className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                    {s.k}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-fade-up">
            <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white p-2 shadow-2xl shadow-ink/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt="Sunset over Cox's Bazar beach with fishing boats"
                className="h-[24rem] w-full rounded-[1.6rem] object-cover sm:h-[30rem]"
              />
            </div>

            <div className="animate-floaty absolute -left-4 bottom-16 w-56 rounded-2xl border border-ink/8 bg-white/95 p-4 shadow-xl backdrop-blur sm:-left-10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40">
                Cox&apos;s Bazar · 3 nights
              </p>
              <p className="mt-1 text-2xl font-black text-ink">৳16,200</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-lagoon-500 to-lagoon-300" />
              </div>
              <p className="mt-2 text-xs font-semibold text-ink/50">58% of ৳28,000 budget</p>
            </div>

            <div className="absolute -right-2 top-8 hidden w-44 rounded-2xl border border-ink/8 bg-white/95 p-3 shadow-xl backdrop-blur sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_SMALL}
                alt="Green hills of the Chittagong Hill Tracts"
                className="h-24 w-full rounded-xl object-cover"
              />
              <p className="mt-2 text-xs font-bold text-ink">Sajek Valley</p>
              <p className="text-[11px] text-ink/50">★ 4.9 · ৳3,400/day</p>
            </div>

            <div className="absolute -right-6 bottom-4 hidden w-40 rounded-2xl border border-ink/8 bg-white/95 p-3 shadow-xl backdrop-blur lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_SMALL_2}
                alt="Tea gardens in Sreemangal"
                className="h-20 w-full rounded-xl object-cover"
              />
              <p className="mt-2 text-xs font-bold text-ink">Sreemangal</p>
              <p className="text-[11px] text-ink/50">★ 4.7 · ৳2,400/day</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- Value bar ------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-4 rounded-3xl border border-ink/8 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
          {[
            { icon: "৳", t: "Costs in taka", d: "Lodging, food, transport and activities, per destination." },
            { icon: "📍", t: "Google Maps everywhere", d: "Every pin opens in Maps or launches directions." },
            { icon: "🗓️", t: "Dated itineraries", d: "Trips with budgets, travellers and live spend." },
            { icon: "⚠️", t: "Access notes", d: "Permits, ID checks and seasonal closures flagged." },
          ].map((f) => (
            <div key={f.t} className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lagoon-50 text-lg">
                {f.icon}
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">{f.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink/55">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------- Featured -------------------------------- */}
      <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">
              Featured destinations
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Where Bangladesh travellers are heading
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/55">
              Each card carries the real average daily cost for one person — lodging, food, local
              transport and activities — plus the round-trip fare from Dhaka on the cost page.
            </p>
          </div>
          <Link
            href="/destinations"
            className="inline-flex h-11 items-center rounded-xl border border-ink/15 bg-white px-5 text-sm font-bold transition hover:border-lagoon-500 hover:text-lagoon-700"
          >
            Browse all 25 destinations
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-ink/15 p-12 text-center">
            <p className="text-sm font-semibold text-ink">
              The board is warming up — refresh in a moment.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </section>

      {/* --------------------------------- Regions ------------------------------- */}
      <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">
            Pick a corner of the country
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Beach, hills, haor or heritage
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "Sea & coast",
              c: "Cox's Bazar · Saint Martin · Kuakata · Guliakhali",
              d: "The world's longest beach, a coral island, and the one place you can catch sunrise and sunset over the same sea.",
              e: "🏖️",
            },
            {
              n: "Hill tracts",
              c: "Sajek · Nilgiri · Nilachal · Boga Lake",
              d: "Cloud seas, ridge-top resorts and jeep rides that are half the adventure.",
              e: "⛰️",
            },
            {
              n: "Rivers & wetlands",
              c: "Tanguar Haor · Jadukata · Ratargul · Kaptai",
              d: "Houseboats, swamp forest and the clearest water in the country.",
              e: "🛶",
            },
            {
              n: "History & heritage",
              c: "Paharpur · Mahasthangarh · Panam City · Lalbagh",
              d: "UNESCO viharas, 3rd-century BCE ramparts and Mughal forts.",
              e: "🏛️",
            },
          ].map((g) => (
            <div
              key={g.n}
              className="card-hover flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-6"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lagoon-50 text-xl">
                {g.e}
              </span>
              <h3 className="mt-4 text-lg font-black tracking-tight text-ink">{g.n}</h3>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-lagoon-700">
                {g.c}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/55">{g.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ How it works ----------------------------- */}
      <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-14 text-white sm:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-lagoon-300">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Three steps from daydream to departure
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                No spreadsheets to babysit. Shortlist a place, set the dates, then log spend as you
                go — TripNest keeps the maths honest.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex h-12 items-center rounded-xl bg-lagoon-500 px-6 text-sm font-bold text-white transition hover:bg-lagoon-400"
              >
                Create your free board
              </Link>
            </div>
            <ol className="grid gap-4">
              {[
                {
                  n: "01",
                  t: "Shortlist destinations",
                  d: "Browse 25 priced spots across every division and save the ones you want.",
                },
                {
                  n: "02",
                  t: "Date the trip",
                  d: "Turn a wish into a dated itinerary with a budget and traveller count.",
                },
                {
                  n: "03",
                  t: "Track every taka",
                  d: "Log the coach fare, the hotel, the grilled Rupchanda — and watch the budget bar move.",
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-lagoon-300/40 hover:bg-white/10"
                >
                  <span className="text-2xl font-black text-lagoon-300">{s.n}</span>
                  <div>
                    <h3 className="font-bold">{s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------ Testimonials ----------------------------- */}
      <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">
            Loved by Bangladeshi travellers
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Budgets people actually keep
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              q: "I used to find out I'd overspent on the bus home. Now the budget bar is in my face the whole trip.",
              n: "Tanvir Hasan",
              r: "Gazipur · 22 districts",
            },
            {
              q: "Finally a site that shows the coach fare from Dhaka separately. That's the bit that always broke my maths.",
              n: "Shirin Akter",
              r: "Sylhet",
            },
            {
              q: "We planned a Sajek trip for four off the cost table and came back 11% under budget.",
              n: "Imran Chowdhury",
              r: "Dhaka",
            },
          ].map((t) => (
            <figure
              key={t.n}
              className="card-hover flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-7"
            >
              <div className="text-lagoon-500">★★★★★</div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">
                “{t.q}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/8 pt-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-lagoon-100 text-xs font-black text-lagoon-700">
                  {t.n.slice(0, 1)}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{t.n}</span>
                  <span className="block text-xs text-ink/45">{t.r}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------------------------------- CTA ---------------------------------- */}
      <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-lagoon-300/40 bg-gradient-to-br from-lagoon-50 via-white to-sand-100 px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lagoon-300/25 blur-3xl" />
          <h2 className="relative text-3xl font-black tracking-tight sm:text-4xl">
            Your next trip deserves a real budget
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/60">
            Sign up in seconds and start with a demo board already full of destinations, trips and
            expenses you can edit, duplicate or delete.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-xl bg-ink px-7 text-sm font-bold text-white transition hover:bg-ink/90"
            >
              Create free account
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-xl border border-ink/15 bg-white px-7 text-sm font-bold transition hover:border-lagoon-500 hover:text-lagoon-700"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

async function loadFeatured() {
  return db
    .select({
      id: destinations.id,
      name: destinations.name,
      country: destinations.country,
      continent: destinations.continent,
      division: destinations.division,
      summary: destinations.summary,
      imageUrl: destinations.imageUrl,
      avgDailyCost: destinations.avgDailyCost,
      currency: destinations.currency,
      rating: destinations.rating,
      bestSeason: destinations.bestSeason,
      tags: destinations.tags,
      status: destinations.status,
      latitude: destinations.latitude,
      longitude: destinations.longitude,
    })
    .from(destinations)
    .where(eq(destinations.featured, true))
    .orderBy(desc(destinations.rating))
    .limit(6);
}
