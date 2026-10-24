import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-sand-50 px-5 py-20">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-lagoon-50 text-4xl">
          🧭
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-lagoon-600">
          404 — off the map
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">This route isn&apos;t on the itinerary</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/55">
          The page you were looking for has moved, or never existed. Let&apos;s get you back to
          somewhere useful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-xl bg-lagoon-600 px-6 text-sm font-bold text-white transition hover:bg-lagoon-700"
          >
            Back home
          </Link>
          <Link
            href="/destinations"
            className="inline-flex h-12 items-center rounded-xl border border-ink/15 bg-white px-6 text-sm font-bold transition hover:border-lagoon-500 hover:text-lagoon-700"
          >
            Browse destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
