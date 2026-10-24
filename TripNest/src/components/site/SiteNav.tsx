"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/costs", label: "Travel Cost" },
  { href: "/location", label: "Location" },
  { href: "/code", label: "Code" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-base shadow-lg shadow-lagoon-600/30 transition group-hover:scale-105">
        🧭
      </span>
      <span className={`text-lg font-black tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Wander<span className="text-lagoon-600">lyst</span>
      </span>
    </Link>
  );
}

export default function SiteNav({
  user,
}: {
  user: { name: string } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-ink/8 bg-white/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Wordmark />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-lagoon-50 text-lagoon-700"
                    : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-lagoon-400 text-[11px] font-black text-ink">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-xl bg-lagoon-600 px-4 text-sm font-semibold text-white shadow-sm shadow-lagoon-600/25 transition hover:bg-lagoon-700"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 bg-white text-ink lg:hidden"
        >
          <span className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-ink transition ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span className={`block h-0.5 w-5 bg-ink transition ${open ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-5 bg-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="animate-fade-up border-t border-ink/8 bg-white px-5 pb-5 pt-3 lg:hidden">
          <div className="grid gap-1">
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    active ? "bg-lagoon-50 text-lagoon-700" : "text-ink/70 hover:bg-ink/5"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="col-span-2 grid h-11 place-items-center rounded-xl bg-ink text-sm font-semibold text-white"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="grid h-11 place-items-center rounded-xl border border-ink/15 text-sm font-semibold"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="grid h-11 place-items-center rounded-xl bg-lagoon-600 text-sm font-semibold text-white"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
