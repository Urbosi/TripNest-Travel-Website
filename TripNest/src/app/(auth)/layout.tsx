import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { ToastProvider } from "@/components/ui";

const HIGHLIGHTS = [
  { icon: "💸", t: "Cost index for 8 regions", d: "Know the daily burn rate before you commit." },
  { icon: "🗓️", t: "Dated trips & budgets", d: "Turn a wish into a plan with real numbers." },
  { icon: "📊", t: "Live spend tracking", d: "Log expenses and watch the budget bar respond." },
];

export default async function AuthLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <ToastProvider>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -left-20 top-1/3 h-96 w-96 rounded-full bg-lagoon-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-coral-400/20 blur-3xl" />

          <Link href="/" className="relative flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-base">
              🧭
            </span>
            <span className="text-lg font-black tracking-tight">
              Wander<span className="text-lagoon-300">lyst</span>
            </span>
          </Link>

          <div className="relative">
            <h2 className="max-w-sm text-4xl font-black leading-tight tracking-tight">
              Plan the trip.
              <br />
              Respect the budget.
            </h2>
            <ul className="mt-10 space-y-5">
              {HIGHLIGHTS.map((h) => (
                <li key={h.t} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg">
                    {h.icon}
                  </span>
                  <div>
                    <p className="font-bold">{h.t}</p>
                    <p className="text-sm text-white/55">{h.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/40">
            Demo account seeded with realistic destinations, trips and expenses.
          </p>
        </div>

        <div className="flex items-center justify-center bg-sand-50 px-5 py-14 sm:px-10">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-base">
                🧭
              </span>
              <span className="text-lg font-black tracking-tight">
                Wander<span className="text-lagoon-600">lyst</span>
              </span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
