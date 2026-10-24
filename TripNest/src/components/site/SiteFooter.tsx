import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/8 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-base">
              🧭
            </span>
            <span className="text-lg font-black tracking-tight">
              Wander<span className="text-lagoon-600">lyst</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/55">
            A planner built for real budgets. Discover destinations, sketch itineraries and know
            exactly what every trip costs before you book.
          </p>
          <div className="mt-5 flex gap-2">
            {["𝕏", "in", "ig", "yt"].map((s) => (
              <span
                key={s}
                className="grid h-9 w-9 place-items-center rounded-xl border border-ink/10 text-xs font-bold text-ink/50"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <FooterCol
          title="Explore"
          links={[
            { href: "/destinations", label: "Destinations" },
            { href: "/location", label: "Location explorer" },
            { href: "/costs", label: "Travel cost index" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: "/about", label: "About us" },
            { href: "/contact", label: "Contact" },
            { href: "/signup", label: "Create account" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { href: "/login", label: "Sign in" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/expenses", label: "Expense tracker" },
          ]}
        />
      </div>
      <div className="border-t border-ink/8 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-ink/45 sm:flex-row">
          <p>© {new Date().getFullYear()} TripNest. Crafted for people who count every mile.</p>
          <p>Photography via Pexels · Demo data seeded on first load</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-ink/60 transition hover:text-lagoon-600">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
