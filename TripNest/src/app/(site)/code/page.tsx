import Link from "next/link";
import CodeExplorer from "@/components/site/CodeExplorer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Source code" };

export default function CodePage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-lagoon-600">Source code</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Every file, readable right here
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Browse the complete TripNest codebase — all pages, components, API routes, the database
          schema and the seed data. Click any file to read it, copy it, or grab the raw text. Want it
          in VS Code? Download the folder below.
        </p>
      </div>

      <div className="mt-8">
        <CodeExplorer />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/8 bg-white p-7">
          <h2 className="text-lg font-black tracking-tight">Open it in VS Code</h2>
          <ol className="mt-5 space-y-4">
            {[
              {
                n: "01",
                t: "Download the folder",
                d: "Hit the download button above to get tripest-source.zip.",
              },
              { n: "02", t: "Unzip it", d: "You'll get a folder named TripNest containing the whole project." },
              {
                n: "03",
                t: "Open the folder",
                d: "In VS Code: File → Open Folder… → select TripNest.",
              },
              {
                n: "04",
                t: "Install & run",
                d: "In the integrated terminal: npm install, then npm run dev.",
              },
              {
                n: "05",
                t: "Add your database",
                d: "Copy .env.example to .env, set DATABASE_URL, then run npx drizzle-kit push.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lagoon-50 text-xs font-black text-lagoon-700">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{s.t}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink/55">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-ink/8 bg-white p-7">
            <h2 className="text-lg font-black tracking-tight">Folder map</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-sand-50 p-4 font-mono text-[11px] leading-relaxed text-ink/70">
{`TripNest/
├── src/
│   ├── app/
│   │   ├── (site)/        public pages
│   │   │   ├── page.tsx         home
│   │   │   ├── destinations/
│   │   │   ├── costs/
│   │   │   ├── location/
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── (auth)/        login + signup
│   │   ├── dashboard/     6 workspace pages
│   │   ├── api/           REST route handlers
│   │   └── globals.css
│   ├── components/
│   │   ├── site/          map, calculator, cards
│   │   ├── dashboard/     sidebar + CRUD managers
│   │   └── ui.tsx         design system
│   ├── db/
│   │   ├── schema.ts      6 tables
│   │   ├── seed.ts        25 destinations
│   │   └── index.ts
│   └── lib/               auth, maps, format, api
├── .env.example
├── drizzle.config.json
├── package.json
└── README.md`}
            </pre>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-white p-7">
            <h2 className="text-lg font-black tracking-tight">Rather use git?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">
              The repo is empty and ready for your first push. Unzip, then run:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-[11px] leading-relaxed text-lagoon-300">
{`git init
git add -A
git commit -m "TripNest"
git branch -M main
git remote add origin \\
  https://github.com/Urbosi/Wanderly.git
git push -u origin main`}
            </pre>
            <Link
              href="/contact"
              className="mt-4 inline-block text-xs font-bold text-lagoon-700 hover:underline"
            >
              Need help? Get in touch →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
