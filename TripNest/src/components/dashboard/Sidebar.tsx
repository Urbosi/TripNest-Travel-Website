"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◧" },
  { href: "/dashboard/destinations", label: "Destinations", icon: "📍" },
  { href: "/dashboard/trips", label: "Trips", icon: "🗓️" },
  { href: "/dashboard/expenses", label: "Travel cost", icon: "💸" },
  { href: "/dashboard/messages", label: "Inbox", icon: "✉️" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({
  user,
  counts,
}: {
  user: { name: string; email: string; homeCity: string };
  counts: { destinations: number; trips: number; newMessages: number };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const badgeFor = (href: string) => {
    if (href === "/dashboard/destinations") return counts.destinations || null;
    if (href === "/dashboard/trips") return counts.trips || null;
    if (href === "/dashboard/messages") return counts.newMessages || null;
    return null;
  };

  const body = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-base shadow-lg shadow-lagoon-600/30">
            🧭
          </span>
          <span className="text-lg font-black tracking-tight text-white">
            Wander<span className="text-lagoon-300">lyst</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const badge = badgeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-lagoon-500/15 text-white shadow-[inset_0_0_0_1px_rgba(125,220,196,0.25)]"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {badge !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    active ? "bg-lagoon-400 text-ink" : "bg-white/10 text-white/60"
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 p-3">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-lagoon-300/40"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lagoon-400 text-xs font-black text-ink">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-white">{user.name}</span>
            <span className="block truncate text-[11px] text-white/45">{user.email}</span>
          </span>
        </Link>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "↩︎ Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-ink/8 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink"
        >
          ☰
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-sm">
            🧭
          </span>
          <span className="font-black tracking-tight">
            Wander<span className="text-lagoon-600">lyst</span>
          </span>
        </Link>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-lagoon-100 text-xs font-black text-lagoon-700">
          {initials}
        </span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-ink lg:sticky lg:top-0 lg:block lg:h-screen">
        {body}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="animate-fade-up absolute inset-y-0 left-0 w-72 bg-ink shadow-2xl">{body}</div>
        </div>
      )}
    </>
  );
}
