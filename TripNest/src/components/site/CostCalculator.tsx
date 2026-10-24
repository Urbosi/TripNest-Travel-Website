"use client";

import { useMemo, useState } from "react";
import { Card, Select, Field } from "@/components/ui";
import { formatMoney } from "@/lib/format";

type Option = {
  id: number;
  name: string;
  division: string;
  avgDailyCost: number;
  intercityTransport: number;
  currency: string;
};

const STYLES = [
  { key: "budget", label: "Backpacker", lodging: 0.32, food: 0.18, transport: 0.16, activities: 0.14, extra: 0.06 },
  { key: "mid", label: "Comfortable", lodging: 0.4, food: 0.22, transport: 0.14, activities: 0.16, extra: 0.08 },
  { key: "luxury", label: "Splash out", lodging: 0.5, food: 0.2, transport: 0.12, activities: 0.2, extra: 0.12 },
] as const;

export default function CostCalculator({ options }: { options: Option[] }) {
  const [id, setId] = useState(options[0]?.id ?? 0);
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [styleKey, setStyleKey] = useState<(typeof STYLES)[number]["key"]>("mid");
  const [flights, setFlights] = useState(650);

  const selected = options.find((o) => o.id === id) ?? options[0];
  const style = STYLES.find((s) => s.key === styleKey) ?? STYLES[1];

  const perPersonPerDay = selected?.avgDailyCost ?? 0;

  const breakdown = useMemo(() => {
    const dailyTotal = perPersonPerDay;
    const rows = [
      { label: "Lodging", share: style.lodging, color: "#0d8371" },
      { label: "Food & drink", share: style.food, color: "#14a38b" },
      { label: "Local transport", share: style.transport, color: "#7ddcc4" },
      { label: "Activities", share: style.activities, color: "#ff8a6a" },
      { label: "Buffer / misc", share: style.extra, color: "#f7b267" },
    ].map((r) => ({
      ...r,
      perDay: dailyTotal * r.share,
      total: dailyTotal * r.share * days * travelers,
    }));

    const onGroundPerDay = rows.reduce((sum, r) => sum + r.perDay, 0);
    const onGroundTotal = rows.reduce((sum, r) => sum + r.total, 0);
    const flightTotal = flights * travelers;
    const intercityTotal = (selected?.intercityTransport ?? 0) * travelers;
    const grand = onGroundTotal + flightTotal + intercityTotal;

    return { rows, onGroundPerDay, onGroundTotal, flightTotal, intercityTotal, grand };
  }, [perPersonPerDay, style, days, travelers, flights]);

  if (!selected) {
    return (
      <Card className="p-8 text-center text-sm text-ink/55">
        No destinations are available to price yet.
      </Card>
    );
  }

  const barTotal = breakdown.rows.reduce((s, r) => s + r.perDay, 0) || 1;

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5 border-b border-ink/8 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="text-lg font-black tracking-tight">Trip cost calculator</h2>
            <p className="mt-1 text-sm text-ink/55">
              Tune the inputs and watch the estimate update instantly.
            </p>
          </div>

          <Field label="Destination">
            <Select value={id} onChange={(e) => setId(Number(e.target.value))}>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.division}) — ৳{Math.round(o.avgDailyCost).toLocaleString()}/day
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Travel style">
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStyleKey(s.key)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${
                    styleKey === s.key
                      ? "border-lagoon-500 bg-lagoon-50 text-lagoon-700"
                      : "border-ink/12 bg-white text-ink/55 hover:border-ink/25"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`Nights — ${days}`}>
              <input
                type="range"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="mt-3 w-full accent-lagoon-600"
              />
            </Field>
            <Field label={`Travellers — ${travelers}`}>
              <input
                type="range"
                min={1}
                max={8}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="mt-3 w-full accent-lagoon-600"
              />
            </Field>
          </div>

          <Field label={`Flights per person — ${formatMoney(flights, selected.currency)}`}>
            <input
              type="range"
              min={0}
              max={2500}
              step={25}
              value={flights}
              onChange={(e) => setFlights(Number(e.target.value))}
              className="mt-3 w-full accent-lagoon-600"
            />
          </Field>
        </div>

        <div className="bg-sand-50 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                Estimated total
              </p>
              <p className="mt-1 text-4xl font-black tracking-tight text-ink">
                {formatMoney(breakdown.grand, selected.currency)}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink/50">
                {days} nights · {travelers}{" "}
                {travelers === 1 ? "traveller" : "travellers"} · {style.label}
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Per day</p>
              <p className="text-lg font-black text-lagoon-700">
                {formatMoney(breakdown.onGroundPerDay, selected.currency)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-white">
            {breakdown.rows.map((r) => (
              <div
                key={r.label}
                style={{ width: `${(r.perDay / barTotal) * 100}%`, background: r.color }}
                title={`${r.label}: ${formatMoney(r.perDay, selected.currency)}/day`}
              />
            ))}
          </div>

          <ul className="mt-5 space-y-2.5">
            {breakdown.rows.map((r) => (
              <li key={r.label} className="flex items-center gap-3 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: r.color }}
                />
                <span className="flex-1 font-medium text-ink/70">{r.label}</span>
                <span className="tabular-nums text-ink/45">
                  {formatMoney(r.perDay, selected.currency)}/day
                </span>
                <span className="w-24 text-right font-bold tabular-nums text-ink">
                  {formatMoney(r.total, selected.currency)}
                </span>
              </li>
            ))}
            {flights > 0 && (
              <li className="flex items-center gap-3 border-t border-ink/10 pt-3 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink" />
                <span className="flex-1 font-bold text-ink">Flights</span>
                <span className="tabular-nums text-ink/45">
                  {formatMoney(flights, selected.currency)}/pp
                </span>
                <span className="w-24 text-right font-black tabular-nums text-ink">
                  {formatMoney(breakdown.flightTotal, selected.currency)}
                </span>
              </li>
            )}
            {breakdown.intercityTotal > 0 && (
              <li className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral-500" />
                <span className="flex-1 font-bold text-ink">Bus / train / launch from Dhaka</span>
                <span className="tabular-nums text-ink/45">
                  {formatMoney(selected.intercityTransport, selected.currency)}/pp
                </span>
                <span className="w-24 text-right font-black tabular-nums text-ink">
                  {formatMoney(breakdown.intercityTotal, selected.currency)}
                </span>
              </li>
            )}
            <li className="flex items-center gap-3 border-t border-ink/10 pt-3 text-base">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-lagoon-600" />
              <span className="flex-1 font-black text-ink">Grand total</span>
              <span className="w-24 text-right font-black tabular-nums text-lagoon-700">
                {formatMoney(Math.round(breakdown.grand), selected.currency)}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
