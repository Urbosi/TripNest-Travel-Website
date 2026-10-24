"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-5 py-20">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-rose-50 text-4xl">
          🧯
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight">Something went sideways</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/55">
          We hit an unexpected error loading this view. Retrying usually fixes it — if not, head back
          to the dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-12 items-center rounded-xl bg-lagoon-600 px-6 text-sm font-bold text-white transition hover:bg-lagoon-700"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center rounded-xl border border-ink/15 bg-white px-6 text-sm font-bold transition hover:border-lagoon-500 hover:text-lagoon-700"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
