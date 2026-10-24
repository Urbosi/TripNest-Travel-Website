import ContactForm from "@/components/site/ContactForm";

export const metadata = { title: "Contact" };

const OFFICE = {
  label: "TripNest · Joydebpur, Gazipur",
  lat: 23.9997,
  lng: 90.4203,
};

export default function ContactPage() {
  const embed = `https://www.google.com/maps?q=${OFFICE.lat},${OFFICE.lng}&z=14&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${OFFICE.lat},${OFFICE.lng}`;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">Contact</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Tell us where you&apos;re heading
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/60">
            Questions about a cost figure, a route you think we priced wrong, or a destination we
            should add — it all lands in the same inbox and a person reads it.
          </p>

          <div className="mt-10 space-y-3">
            {[
              {
                icon: "✉️",
                label: "Email",
                value: "hello@tripnest.app",
                sub: "Replies within 1 business day",
              },
              {
                icon: "🏢",
                label: "Office",
                value: "Joydebpur, Gazipur, Bangladesh",
                sub: "Near Joydebpur Junction railway station",
                href: directions,
              },
              {
                icon: "🕘",
                label: "Hours",
                value: "Sat – Thu, 10:00 – 19:00",
                sub: "Bangladesh Standard Time (GMT+6)",
              },
              {
                icon: "🚨",
                label: "Support",
                value: "support@tripnest.app",
                sub: "For sign-in and account issues",
              },
              {
                icon: "💬",
                label: "Traveller community",
                value: "3,400+ members",
                sub: "Trip reports and live price checks",
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href ?? "#"}
                target={c.href ? "_blank" : undefined}
                rel={c.href ? "noreferrer" : undefined}
                className="flex gap-4 rounded-2xl border border-ink/8 bg-white p-5 transition hover:border-lagoon-300"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lagoon-50 text-lg">
                  {c.icon}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                    {c.label}
                  </p>
                  <p className="text-sm font-bold text-ink">{c.value}</p>
                  <p className="text-xs text-ink/50">{c.sub}</p>
                </div>
              </a>
            ))}
          </div>

          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-bold text-white transition hover:bg-ink/90"
          >
            📍 Get directions to our office
          </a>
        </div>

        <div className="space-y-6">
          <ContactForm />

          <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-6 py-4">
              <div>
                <h2 className="text-base font-black tracking-tight">Find us on the map</h2>
                <p className="text-xs text-ink/50">Joydebpur, Gazipur — Dhaka Division</p>
              </div>
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 px-3.5 text-xs font-bold text-ink/70 transition hover:border-lagoon-500 hover:text-lagoon-700"
              >
                Open in Google Maps ↗
              </a>
            </div>
            <iframe
              title="TripNest office location in Joydebpur, Gazipur"
              src={embed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0"
            />
          </div>

          <div className="rounded-2xl border border-ink/8 bg-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink/45">
              Quick answers
            </h2>
            <div className="mt-4 divide-y divide-ink/5">
              {[
                {
                  q: "Is TripNest free?",
                  a: "Yes — unlimited destinations, trips and expenses are all free while we're in beta.",
                },
                {
                  q: "Are your prices in taka?",
                  a: "Every Bangladesh figure is in BDT, broken into lodging, food, local transport, activities, intercity transport from Dhaka and one-off entry fees.",
                },
                {
                  q: "How current are the numbers?",
                  a: "They're updated by travellers on the ground and refreshed each season. Peak-period (Eid, winter) rates run noticeably higher than what we show.",
                },
                {
                  q: "Can I add a destination that's missing?",
                  a: "Please do — send us the place, a rough per-day cost and how you got there, and we'll verify it before adding it to the board.",
                },
                {
                  q: "Do you cover restricted areas like Boga Lake?",
                  a: "We list them with an access note. Always confirm current permission rules with the local authorities before travelling — rules change without notice.",
                },
              ].map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-ink">
                    {f.q}
                    <span className="text-ink/30 transition group-open:rotate-45">＋</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink/55">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
