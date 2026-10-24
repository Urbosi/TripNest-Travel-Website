/**
 * Client-safe list of the files most worth reading first.
 * Kept separate from codetree.ts so browser bundles never pull in node:fs.
 */
export const KEY_FILES: { path: string; why: string }[] = [
  { path: "src/db/schema.ts", why: "All 6 tables — users, sessions, destinations, trips, expenses, messages" },
  { path: "src/db/seed.ts", why: "All 25 Bangladesh destinations with individual cost breakdowns" },
  { path: "src/lib/auth.ts", why: "scrypt hashing + cookie sessions" },
  { path: "src/lib/maps.ts", why: "Google Maps URL builders" },
  { path: "src/components/site/LocationMap.tsx", why: "Interactive Bangladesh map + Google Maps toggle" },
  { path: "src/components/site/CostBreakdownTable.tsx", why: "Per-destination trip cost table" },
  { path: "src/app/api/destinations/route.ts", why: "Destinations CRUD API" },
  { path: "src/components/dashboard/DestinationsManager.tsx", why: "Optimistic CRUD UI" },
];
