"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { mapsSearchUrl } from "@/lib/maps";
import { formatMoney } from "@/lib/format";

export type CostRow = {
  id: number;
  name: string;
  division: string;
  avgDailyCost: number;
  lodgingCost: number;
  foodCost: number;
  localTransportCost: number;
  activityCost: number;
  intercityTransport: number;
  entryFee: number;
  currency: string;
  latitude: number;
  longitude: number;
  travelMode: string;
  travelTime: string;
};

type SortKey = "total" | "lodging" | "food" | "transport" | "activities" | "intercity";

const COLUMNS: { key: SortKey; label: string; get: (r: CostRow) => number }[] = [
  { key: "total", label: "Per day", get: (r) => r.avgDailyCost },
  { key: "lodging", label: "Lodging", get: (r) => r.lodgingCost },
  { key: "food", label: "Food", get: (r) => r.foodCost },
  { key: "transport", label: "Local transport", get: (r) => r.localTransportCost },
  { key: "activities", label: "Activities", get: (r) => r.activityCost },
  { key: "intercity", label: "From Dhaka", get: (r) => r.intercityTransport },
];

/** Trip-length presets so each destination shows a total trip cost, not just a daily rate. */
const LENGTHS = [
  { days: 2, label: "2-day" },
  { days: 3, label: "3-day" },
  { days: 5, label: "5-day" },
];

export default function CostBreakdownTable({ rows }: { rows: CostRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [asc, setAsc] = useState(true);
  const [length, setLength] = useState(3);

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortKey) ?? COLUMNS[0];
    return [...rows].sort((a, b) => (asc ? col.get(a) - col.get(b) : col.get(b) - col.get(a)));
  }, [rows, sortKey, asc]);

  const totals = useMemo(() => {
    const currency = rows[0]?.currency ?? "BDT";
    return {
      currency,
      perDay: rows.reduce((s, r) => s + r.avgDailyCost, 0),
      intercity: rows.reduce((s, r) => s + r.intercityTransport, 0),
    };
  }, [rows]);

  function header(key: SortKey, label: string) {
    const isActive = sortKey === key;
    return (
      <th
        key={key}
        className="cursor-pointer select-none whitespace-nowrap px-4 py-3 transition hover:text-lagoon-700"
        onClick={() => {
          if (sortKey === key) setAsc((v) => !v);
          else {
            setSortKey(key);
            setAsc(key === "total" || key === "intercity");
          }
        }}
      >
        <span className={`inline-flex items-center gap-1 ${isActive ? "text-lagoon-700" : ""}`}>
          {label}
          {isActive && <span className="text-[9px]">{asc ? "▲" : "▼"}</span>}
        </span>
      </th>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-5 py-4">
        <div>
          <h2 className="text-base font-black tracking-tight">
            Individual trip cost — all {rows.length} destinations
          </h2>
          <p className="mt-0.5 text-xs text-ink/50">
            Click any column header to re-sort. Tap a place name to open it in Google Maps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink/45">Trip length</span>
          <div className="flex rounded-lg bg-sand-100 p-1">
            {LENGTHS.map((l) => (
              <button
                key={l.days}
                onClick={() => setLength(l.days)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                  length === l.days ? "bg-white text-lagoon-700 shadow-sm" : "text-ink/50 hover:text-ink"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[64rem] text-sm">
          <thead>
            <tr className="border-b border-ink/8 bg-sand-50 text-left text-[11px] font-bold uppercase tracking-wide text-ink/40">
              <th className="sticky left-0 z-10 bg-sand-50 px-5 py-3">Destination</th>
              <th className="px-4 py-3">Division</th>
              {COLUMNS.map((c) => header(c.key, c.label))}
              <th className="px-4 py-3">Entry fee</th>
              <th className="whitespace-nowrap bg-lagoon-50 px-5 py-3 text-right text-lagoon-700">
                {length}-day total
              </th>
              <th className="px-4 py-3">Map</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const onGround = r.avgDailyCost * length;
              const tripTotal = onGround + r.intercityTransport + r.entryFee;
              return (
                <tr
                  key={r.id}
                  className="border-b border-ink/5 transition last:border-0 hover:bg-lagoon-50/40"
                >
                  <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-bold text-ink">
                    <span className="block">{r.name}</span>
                    <span className="block text-[11px] font-semibold text-ink/40">
                      {r.travelMode}
                      {r.travelTime ? ` · ${r.travelTime}` : ""}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink/60">{r.division}</td>
                  <td className="px-4 py-3.5 font-black tabular-nums text-lagoon-700">
                    {formatMoney(Math.round(r.avgDailyCost), r.currency)}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-ink/65">
                    {formatMoney(Math.round(r.lodgingCost), r.currency)}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-ink/65">
                    {formatMoney(Math.round(r.foodCost), r.currency)}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-ink/65">
                    {formatMoney(Math.round(r.localTransportCost), r.currency)}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-ink/65">
                    {formatMoney(Math.round(r.activityCost), r.currency)}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-coral-500">
                    {r.intercityTransport > 0
                      ? formatMoney(Math.round(r.intercityTransport), r.currency)
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-ink/65">
                    {r.entryFee > 0 ? formatMoney(Math.round(r.entryFee), r.currency) : "—"}
                  </td>
                  <td className="bg-lagoon-50/60 px-5 py-3.5 text-right">
                    <span className="block font-black tabular-nums text-lagoon-700">
                      {formatMoney(Math.round(tripTotal), r.currency)}
                    </span>
                    <span className="block text-[10px] font-semibold text-ink/40">
                      incl. travel & entry
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <a
                      href={mapsSearchUrl(r.latitude, r.longitude, r.name)}
                      target="_blank"
                      rel="noreferrer"
                      title={`Open ${r.name} in Google Maps`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-ink/12 text-xs transition hover:border-lagoon-500 hover:bg-lagoon-50"
                    >
                      📍
                    </a>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={12} className="px-6 py-14 text-center text-ink/50">
                  The cost index is empty — check back soon.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-sand-50 text-sm">
                <td className="sticky left-0 z-10 bg-sand-50 px-5 py-3 font-black" colSpan={2}>
                  Averages across {rows.length} destinations
                </td>
                <td className="px-4 py-3 font-black tabular-nums">
                  {formatMoney(Math.round(totals.perDay / rows.length), totals.currency)}
                </td>
                {COLUMNS.slice(1, 5).map((c) => (
                  <td key={c.key} className="px-4 py-3 font-bold tabular-nums text-ink/50">
                    {formatMoney(Math.round(rows.reduce((s, r) => s + c.get(r), 0) / rows.length), totals.currency)}
                  </td>
                ))}
                <td className="px-4 py-3 font-bold tabular-nums text-ink/50">
                  {formatMoney(Math.round(totals.intercity / rows.length), totals.currency)}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 font-black tabular-nums text-lagoon-700">
                  {formatMoney(
                    Math.round(
                      (totals.perDay / rows.length) * length + totals.intercity / rows.length,
                    ),
                    totals.currency,
                  )}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 bg-white px-5 py-4">
        <p className="text-xs leading-relaxed text-ink/45">
          The {length}-day total = ({length} × per-day cost) + round-trip transport from Dhaka + entry
          fee. Per-person, mid-range.
        </p>
        <Link
          href="/location"
          className="text-xs font-bold text-lagoon-700 hover:underline"
        >
          See these on the map →
        </Link>
      </div>
    </Card>
  );
}
