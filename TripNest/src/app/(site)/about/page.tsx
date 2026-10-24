import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = { title: "About" };

const IMAGE =
  "https://images.pexels.com/photos/35458090/pexels-photo-35458090.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">
            About TripNest
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            We built a budget tool for travelling <em>Bangladesh</em>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink/60">
            TripNest started out of a Joydebpur flat, where four friends kept planning trips that
            collapsed on day three. Every tour ended the same way: a wallet of crumpled receipts, a
            calculator open at midnight, and no idea whether Sajek or Saint Martin was actually the
            more expensive weekend.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/60">
            Bangladesh is a genuinely cheap place to travel and almost nobody has written the numbers
            down. So we did — real per-day costs for Cox&apos;s Bazar, Ratargul, Kuakata, Nilgiri and
            everywhere else, broken into lodging, food, local transport and activities, plus the
            intercity fare from Dhaka that every plan forgets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-xl bg-lagoon-600 px-6 text-sm font-bold text-white transition hover:bg-lagoon-700"
            >
              Join TripNest
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-xl border border-ink/15 bg-white px-6 text-sm font-bold transition hover:border-lagoon-500 hover:text-lagoon-700"
            >
              Say hello
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-ink/10 shadow-2xl shadow-ink/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGE}
            alt="Cyclist riding through the tea gardens of Sreemangal at sunrise"
            className="h-[26rem] w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { v: "25", k: "Destinations priced" },
          { v: "8", k: "Divisions covered" },
          { v: "৳550", k: "Cheapest day on the board" },
          { v: "৳6,500", k: "Priciest (Sundarbans)" },
        ].map((s) => (
          <Card key={s.k} className="p-6 text-center">
            <p className="text-3xl font-black tracking-tight text-lagoon-700">{s.v}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/45">{s.k}</p>
          </Card>
        ))}
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-black tracking-tight">What we believe</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: "🔍",
              t: "Honest numbers beat pretty brochures",
              d: "A destination page without a price is a wish, not a plan. Every TripNest card leads with the taka.",
            },
            {
              icon: "🧠",
              t: "Planning should take one evening",
              d: "No forty-field forms. If it takes longer than a cup of cha, we have over-engineered it.",
            },
            {
              icon: "🤝",
              t: "Your data is yours",
              d: "Boards are private to your account, and you can delete any destination, trip or expense permanently in one click.",
            },
          ].map((v) => (
            <Card key={v.t} className="p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lagoon-50 text-xl">
                {v.icon}
              </span>
              <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{v.d}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-black tracking-tight">The road so far</h2>
        <ol className="mt-10 space-y-1">
          {[
            {
              y: "2022",
              t: "The spreadsheet era",
              d: "Four friends, one shared Google Sheet, and endless arguments about who owed whom.",
            },
            {
              y: "2023",
              t: "First cost index",
              d: "We priced 12 Sylhet and Chattogram spots and realised nobody had published any of it.",
            },
            {
              y: "2025",
              t: "Trips & expenses",
              d: "Dated itineraries with live spend tracking, plus the intercity fare from Dhaka.",
            },
            {
              y: "2026",
              t: "TripNest today",
              d: "25 destinations across all 8 divisions, a cost calculator, and an interactive map.",
            },
          ].map((m, i) => (
            <li key={m.y} className="relative flex gap-6 rounded-2xl p-5 transition hover:bg-white">
              <div className="flex flex-col items-center">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lagoon-600 text-xs font-black text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < 3 && <span className="mt-2 w-px flex-1 bg-ink/10" />}
              </div>
              <div className="pb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">{m.y}</p>
                <h3 className="mt-1 text-lg font-bold text-ink">{m.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/55">{m.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-black tracking-tight">The team</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { n: "Rafi Ahmed", r: "Founder & product", c: "Joydebpur, Gazipur", e: "🧭" },
            { n: "Nusrat Jahan", r: "Engineering", c: "Dhaka", e: "⚙️" },
            { n: "Rezaul Karim", r: "Field research", c: "Sylhet", e: "🌱" },
          ].map((p) => (
            <Card key={p.n} className="p-7">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-2xl">
                {p.e}
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{p.n}</h3>
              <p className="text-sm text-lagoon-700">{p.r}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                📍 {p.c}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-black tracking-tight">How we price a destination</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {[
            {
              t: "What's inside the daily figure",
              items: [
                "Lodging — one night in a mid-range local hotel or resort",
                "Food — three meals plus tea, priced at local (not tourist) counters",
                "Local transport — rickshaw, CNG and local bus for the day",
                "Activities — boat hire, guide fees, park entry",
              ],
            },
            {
              t: "What we list separately",
              items: [
                "Intercity transport — the round trip from Dhaka, which people always forget",
                "Entry fees — one-off preserve, museum or fort tickets",
                "Distance and travel time from Joydebpur/Dhaka",
                "Access notes — permits, ID checks, seasonal closures",
              ],
            },
          ].map((b) => (
            <Card key={b.t} className="p-7">
              <h3 className="text-lg font-bold text-ink">{b.t}</h3>
              <ul className="mt-4 space-y-2.5">
                {b.items.map((i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/60">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon-500" />
                    {i}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
