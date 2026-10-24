"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Card } from "@/components/ui";
import { statusTone } from "@/lib/status";
import { mapsDirectionsUrl, mapsEmbedUrl, mapsSearchUrl } from "@/lib/maps";
import { formatMoney } from "@/lib/format";

export type MapPin = {
  id: number;
  name: string;
  country: string;
  division: string;
  latitude: number;
  longitude: number;
  avgDailyCost: number;
  currency: string;
  rating: number;
  summary: string;
  bestSeason: string;
  status: string;
  imageUrl: string;
  travelMode: string;
  travelTime: string;
  accessNote: string;
  distanceFromDhaka: number;
  intercityTransport: number;
};

const W = 1000;
const H = 460;

/** Bounds tuned to Bangladesh so pins fill the canvas. */
const BOUNDS = {
  minLng: 87.8,
  maxLng: 92.9,
  minLat: 20.2,
  maxLat: 26.6,
};

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y: Math.max(14, Math.min(H - 14, y)) };
}

export default function LocationMap({ pins }: { pins: MapPin[] }) {
  const [activeId, setActiveId] = useState<number | null>(pins[0]?.id ?? null);
  const [region, setRegion] = useState<string>("all");
  const [view, setView] = useState<"illustrated" | "google">("illustrated");

  const regions = useMemo(() => [...new Set(pins.map((p) => p.division))].sort(), [pins]);
  const visible = region === "all" ? pins : pins.filter((p) => p.division === region);
  const active = pins.find((p) => p.id === activeId) ?? visible[0] ?? null;

  return (
    <div className="space-y-6">
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <RegionChip label="All divisions" active={region === "all"} onClick={() => setRegion("all")} />
          {regions.map((r) => (
            <RegionChip key={r} label={r} active={region === r} onClick={() => setRegion(r)} />
          ))}
          <span className="ml-auto flex items-center gap-2 px-3">
            <span className="hidden text-xs font-semibold text-ink/40 sm:inline">
              {visible.length} pins
            </span>
            <div className="flex rounded-lg bg-sand-100 p-1">
              <ToggleChip
                label="Illustrated"
                active={view === "illustrated"}
                onClick={() => setView("illustrated")}
              />
              <ToggleChip
                label="Google Maps"
                active={view === "google"}
                onClick={() => setView("google")}
              />
            </div>
          </span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          {view === "google" && active ? (
            <iframe
              key={active.id}
              title={`Google Map of ${active.name}`}
              src={mapsEmbedUrl(active.latitude, active.longitude, 9)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[30rem] w-full border-0 lg:h-full lg:min-h-[30rem]"
            />
          ) : (
            <div className="bg-[#0c2231] p-2">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-full w-full rounded-xl"
                role="img"
                aria-label="Map of Bangladesh destinations"
              >
                <defs>
                  <radialGradient id="ocean" cx="45%" cy="40%" r="80%">
                    <stop offset="0%" stopColor="#12374a" />
                    <stop offset="100%" stopColor="#081722" />
                  </radialGradient>
                  <pattern id="grid" width="41.66" height="41.66" patternUnits="userSpaceOnUse">
                    <path
                      d="M41.66 0H0V41.66"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                  </pattern>
                  <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#16503f" />
                    <stop offset="100%" stopColor="#0e3a2f" />
                  </linearGradient>
                </defs>

                <rect width={W} height={H} fill="url(#ocean)" />
                <rect width={W} height={H} fill="url(#grid)" />

                {/* Tropic of Cancer crosses Bangladesh near 23.5°N */}
                <line
                  x1="0"
                  y1={project(23.5, 0).y}
                  x2={W}
                  y2={project(23.5, 0).y}
                  stroke="rgba(255,180,120,0.3)"
                  strokeDasharray="8 10"
                />
                <text
                  x="14"
                  y={project(23.5, 0).y - 8}
                  fill="rgba(255,180,120,0.55)"
                  fontSize="11"
                  fontWeight="700"
                >
                  TROPIC OF CANCER
                </text>

                {/* Stylised Bangladesh landmass */}
                <path
                  d="M 300 60
                     C 380 40, 470 55, 520 95
                     C 560 130, 545 175, 585 205
                     C 630 240, 690 245, 700 285
                     C 710 325, 660 350, 610 355
                     C 560 360, 520 345, 480 330
                     C 430 312, 380 300, 350 265
                     C 315 225, 300 175, 295 130
                     C 292 100, 288 70, 300 60 Z"
                  fill="url(#land)"
                  stroke="rgba(125,220,196,0.35)"
                  strokeWidth="2"
                />
                {/* Bay of Bengal label */}
                <text
                  x="620"
                  y="430"
                  fill="rgba(125,220,196,0.4)"
                  fontSize="13"
                  fontWeight="700"
                  letterSpacing="2"
                >
                  BAY OF BENGAL
                </text>
                <text x="120" y="80" fill="rgba(255,255,255,0.28)" fontSize="12" fontWeight="700">
                  INDIA
                </text>
                <text x="740" y="120" fill="rgba(255,255,255,0.28)" fontSize="12" fontWeight="700">
                  INDIA
                </text>

                {visible.map((p) => {
                  const { x, y } = project(p.latitude, p.longitude);
                  const isActive = active?.id === p.id;
                  return (
                    <g
                      key={p.id}
                      transform={`translate(${x} ${y})`}
                      onClick={() => setActiveId(p.id)}
                      onMouseEnter={() => setActiveId(p.id)}
                      className="cursor-pointer"
                    >
                      {isActive && <circle r="20" fill="rgba(20,163,139,0.3)" className="animate-ping" />}
                      <circle
                        r={isActive ? 9 : 6}
                        fill={isActive ? "#7ddcc4" : "#14a38b"}
                        stroke="#041b14"
                        strokeWidth="2"
                      />
                      {isActive && (
                        <g transform="translate(13 -6)">
                          <rect
                            x="0"
                            y="-14"
                            width={Math.max(112, p.name.length * 8 + 30)}
                            height="30"
                            rx="8"
                            fill="rgba(4,27,20,0.94)"
                            stroke="rgba(125,220,196,0.45)"
                          />
                          <text x="10" y="7" fill="#e6fffa" fontSize="13" fontWeight="700">
                            {p.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="pointer-events-none absolute bottom-5 left-5 rounded-xl bg-black/45 px-3 py-2 text-[11px] font-semibold text-white/75 backdrop-blur">
                Hover a pin · switch to Google Maps for the real thing
              </div>
            </div>
          )}

          {active && (
            <div className="flex flex-wrap items-center gap-2 border-t border-ink/8 bg-sand-50 px-5 py-3">
              <a
                href={mapsSearchUrl(active.latitude, active.longitude, active.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-lagoon-600 px-3.5 text-xs font-bold text-white transition hover:bg-lagoon-700"
              >
                📍 {active.name} on Google Maps
              </a>
              <a
                href={mapsDirectionsUrl(active.latitude, active.longitude)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3.5 text-xs font-bold text-ink/70 transition hover:border-lagoon-500 hover:text-lagoon-700"
              >
                🧭 Get directions
              </a>
              <span className="ml-auto font-mono text-[11px] text-ink/45">
                {active.latitude.toFixed(4)}°N, {active.longitude.toFixed(4)}°E
              </span>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {active ? (
            <Card className="overflow-hidden">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.imageUrl}
                  alt={`${active.name}, ${active.country}`}
                  className="h-40 w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
                  <h3 className="text-lg font-black text-white drop-shadow">{active.name}</h3>
                  <p className="text-xs text-white/80">
                    {active.division} Division · {active.country}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <p className="text-sm leading-relaxed text-ink/60">{active.summary}</p>

                <div className="rounded-xl bg-lagoon-50 p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-lagoon-700">
                        Per person / day
                      </p>
                      <p className="text-2xl font-black text-lagoon-700">
                        {formatMoney(active.avgDailyCost, active.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                        Dhaka round trip
                      </p>
                      <p className="text-sm font-black text-ink">
                        {formatMoney(active.intercityTransport, active.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <dl className="grid grid-cols-3 gap-3">
                  <Stat label="Rating" value={`★ ${active.rating.toFixed(1)}`} />
                  <Stat label="Best" value={active.bestSeason} small />
                  <Stat label="From Dhaka" value={`${Math.round(active.distanceFromDhaka)} km`} small />
                </dl>

                <div className="space-y-1.5 rounded-xl bg-sand-50 p-4 text-xs">
                  <Row label="Travel mode" value={active.travelMode} />
                  <Row label="Journey time" value={active.travelTime || "—"} />
                </div>

                {active.accessNote && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                    <strong className="font-bold">Access note: </strong>
                    {active.accessNote}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge tone={statusTone(active.status)}>{active.status}</Badge>
                  <Badge tone="lagoon">{active.division}</Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <a
                    href={mapsSearchUrl(active.latitude, active.longitude, active.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-lagoon-600 text-sm font-bold text-white transition hover:bg-lagoon-700"
                  >
                    🗺 Google Maps
                  </a>
                  <Link
                    href="/costs"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-ink/15 bg-white text-sm font-bold transition hover:border-lagoon-500 hover:text-lagoon-700"
                  >
                    ৳ Cost breakdown
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-10 text-center text-sm text-ink/55">
              No pins in this division yet.
            </Card>
          )}

          <Card className="max-h-[26rem] divide-y divide-ink/5 overflow-y-auto">
            {visible.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition ${
                  active?.id === p.id ? "bg-lagoon-50" : "hover:bg-sand-50"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    active?.id === p.id ? "bg-lagoon-600" : "bg-ink/20"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{p.name}</span>
                  <span className="block truncate text-xs text-ink/45">
                    {p.division} · {formatMoney(p.avgDailyCost, p.currency)}/day
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-ink/35">📍</span>
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function RegionChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
        active ? "bg-lagoon-600 text-white" : "text-ink/55 hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
        active ? "bg-white text-lagoon-700 shadow-sm" : "text-ink/50 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">{label}</dt>
      <dd
        className={`mt-0.5 font-black text-ink ${small ? "text-xs" : "text-sm"}`}
        title={small ? value : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-ink/45">{label}</span>
      <span className="truncate font-bold text-ink/80">{value}</span>
    </div>
  );
}
