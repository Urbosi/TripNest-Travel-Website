"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { statusTone } from "@/lib/status";
import {
  Badge,
  Button,
  Card,
  ConfirmButton,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import { apiFetch } from "@/lib/client";
import { DIVISIONS, DESTINATION_STATUSES, formatMoney, todayISO } from "@/lib/format";
import { mapsSearchUrl } from "@/lib/maps";
import { TRAVEL_MODES } from "@/lib/format";

export type DestinationRow = {
  id: number;
  name: string;
  country: string;
  continent: string;
  division: string;
  summary: string;
  description: string;
  imageUrl: string;
  bestSeason: string;
  avgDailyCost: number;
  currency: string;
  lodgingCost: number;
  foodCost: number;
  localTransportCost: number;
  activityCost: number;
  intercityTransport: number;
  entryFee: number;
  distanceFromDhaka: number;
  travelMode: string;
  travelTime: string;
  accessNote: string;
  rating: number;
  latitude: number;
  longitude: number;
  tags: string[];
  status: string;
  featured: boolean;
  createdAt: string | Date;
};

type FormState = Omit<DestinationRow, "id" | "createdAt" | "tags"> & { tagsText: string };

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/22711558/pexels-photo-22711558.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

function emptyForm(): FormState {
  return {
    name: "",
    country: "Bangladesh",
    continent: "Asia",
    division: "Dhaka",
    travelMode: "Bus",
    travelTime: "",
    accessNote: "",
    lodgingCost: 1200,
    foodCost: 700,
    localTransportCost: 300,
    activityCost: 200,
    intercityTransport: 1500,
    entryFee: 0,
    distanceFromDhaka: 200,
    summary: "",
    description: "",
    imageUrl: "",
    bestSeason: "Year-round",
    avgDailyCost: 2400,
    currency: "BDT",
    rating: 4.5,
    latitude: 0,
    longitude: 0,
    tagsText: "",
    status: "wishlist",
    featured: false,
  };
}

function toForm(d: DestinationRow): FormState {
  return { ...d, tagsText: d.tags.join(", ") };
}

export default function DestinationsManager({ initial }: { initial: DestinationRow[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [rows, setRows] = useState<(DestinationRow & { _pending?: boolean })[]>(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DestinationRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [details, setDetails] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      wishlist: rows.filter((r) => r.status === "wishlist").length,
      planned: rows.filter((r) => r.status === "planned").length,
      visited: rows.filter((r) => r.status === "visited").length,
    }),
    [rows],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDetails({});
    setModalOpen(true);
  }

  function openEdit(d: DestinationRow) {
    setEditing(d);
    setForm(toForm(d));
    setDetails({});
    setModalOpen(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Keep the headline figure in sync with the individual cost lines.
      if (["lodgingCost", "foodCost", "localTransportCost", "activityCost"].includes(key as string)) {
        next.avgDailyCost =
          next.lodgingCost + next.foodCost + next.localTransportCost + next.activityCost;
      }
      return next;
    });
    setDetails((d) => ({ ...d, [key as string]: "" }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setDetails({});

    const payload = {
      ...form,
      tags: form.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl.trim() || FALLBACK_IMAGE,
    };

    // Optimistic insert / update
    const tempId = -Math.floor(Math.random() * 1_000_000);
    const optimistic: DestinationRow & { _pending?: boolean } = {
      id: editing?.id ?? tempId,
      createdAt: editing?.createdAt ?? new Date(),
      ...form,
      tags: payload.tags,
      imageUrl: payload.imageUrl,
      _pending: true,
    };
    if (editing) {
      setRows((rs) => rs.map((r) => (r.id === editing.id ? optimistic : r)));
    } else {
      setRows((rs) => [optimistic, ...rs]);
    }
    setModalOpen(false);

    const res = editing
      ? await apiFetch<{ destination: DestinationRow }>(`/api/destinations/${editing.id}`, {
          method: "PATCH",
          json: payload,
        })
      : await apiFetch<{ destination: DestinationRow }>("/api/destinations", {
          method: "POST",
          json: payload,
        });

    if (res.ok) {
      const saved = res.data.destination;
      setRows((rs) => rs.map((r) => (r.id === optimistic.id ? saved : r)));
      push(editing ? `${saved.name} updated.` : `${saved.name} added to your board.`);
      router.refresh();
    } else {
      setRows((rs) => rs.filter((r) => r.id !== optimistic.id));
      setDetails(res.details ?? {});
      setModalOpen(true);
      push(res.error, "error");
    }
    setSaving(false);
  }

  async function remove(id: number) {
    const snapshot = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    push("Destination deleted.", "info");
    const res = await apiFetch(`/api/destinations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setRows(snapshot);
      push(res.error, "error");
    } else {
      router.refresh();
    }
  }

  async function cycleStatus(d: DestinationRow) {
    const next =
      d.status === "wishlist" ? "planned" : d.status === "planned" ? "visited" : "wishlist";
    const snapshot = rows;
    setRows((rs) => rs.map((r) => (r.id === d.id ? { ...r, status: next, _pending: true } : r)));
    const res = await apiFetch<{ destination: DestinationRow }>(`/api/destinations/${d.id}`, {
      method: "PATCH",
      json: { status: next },
    });
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === d.id ? res.data.destination : r)));
      router.refresh();
    } else {
      setRows(snapshot);
      push(res.error, "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[15rem] flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, country or tag…"
            className="pl-9"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/35">
            🔍
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-ink/8">
          {(["all", "wishlist", "planned", "visited"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                statusFilter === s ? "bg-ink text-white" : "text-ink/50 hover:text-ink"
              }`}
            >
              {s} <span className="opacity-50">{counts[s]}</span>
            </button>
          ))}
        </div>
        <Button onClick={openCreate}>+ New destination</Button>
      </div>

      {filtered.length === 0 ? (
        rows.length === 0 ? (
          <EmptyState
            icon="📍"
            title="Your board is empty"
            description="Add the first place you're dreaming about — with a daily cost so you can compare later."
            action={<Button onClick={openCreate}>Add your first destination</Button>}
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No matches"
            description={`Nothing matches "${query}"${statusFilter !== "all" ? ` in ${statusFilter}` : ""}. Try a different search.`}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <Card
              key={d.id}
              className={`card-hover overflow-hidden ${d._pending ? "opacity-60" : ""}`}
            >
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.imageUrl || FALLBACK_IMAGE}
                  alt={`${d.name}, ${d.country}`}
                  className={`h-full w-full object-cover transition duration-500 ${d._pending ? "animate-pulse" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent" />
                <button
                  onClick={() => cycleStatus(d)}
                  title="Click to change status"
                  className="absolute left-3 top-3"
                >
                  <Badge tone={statusTone(d.status)} className="bg-white/95">
                    {d.status}
                  </Badge>
                </button>
                {d.featured && (
                  <span className="absolute right-3 top-3 rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    Featured
                  </span>
                )}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-black text-white drop-shadow">{d.name}</h3>
                  <p className="text-[11px] font-semibold text-white/75">
                    {d.division} · {d.country}
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-ink/55">
                  {d.summary || "No summary yet."}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-bold text-ink/50"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-sand-50 p-3 text-center">
                  <Mini label="Per day" value={formatMoney(Math.round(d.avgDailyCost), d.currency)} />
                  <Mini label="From Dhaka" value={formatMoney(Math.round(d.intercityTransport), d.currency)} />
                  <Mini label="Rating" value={`★ ${d.rating.toFixed(1)}`} />
                  <Mini label="Season" value={d.bestSeason} small />
                </div>

                {(d.travelMode || d.distanceFromDhaka > 0) && (
                  <p className="rounded-lg bg-lagoon-50 px-3 py-2 text-[11px] font-semibold text-lagoon-700">
                    🚌 {d.travelMode || "—"}
                    {d.travelTime ? ` · ${d.travelTime}` : ""}
                    {d.distanceFromDhaka > 0 ? ` · ${Math.round(d.distanceFromDhaka)} km` : ""}
                  </p>
                )}

                {d.accessNote && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                    ⚠️ {d.accessNote}
                  </p>
                )}

                <a
                  href={mapsSearchUrl(d.latitude, d.longitude, `${d.name}, ${d.country}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-ink/12 text-xs font-bold text-ink/65 transition hover:border-lagoon-500 hover:bg-lagoon-50 hover:text-lagoon-700"
                >
                  📍 View on Google Maps
                </a>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                    Edit
                  </Button>
                  <ConfirmButton onConfirm={() => remove(d.id)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : "New destination"}
        description="Daily cost should cover lodging, food, transport and one activity."
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing ? "Save changes" : "Add destination"}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/45">Basics</h3>
          </div>

          <Field label="Name" hint={details.name}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sajek Valley" invalid={Boolean(details.name)} />
          </Field>
          <Field label="Division">
            <Select value={form.division} onChange={(e) => set("division", e.target.value)}>
              {DIVISIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Country">
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Bangladesh" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {DESTINATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Best season">
            <Input value={form.bestSeason} onChange={(e) => set("bestSeason", e.target.value)} placeholder="Oct – Mar" />
          </Field>
          <Field label={`Rating — ${form.rating.toFixed(1)}`}>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => set("rating", Number(e.target.value))}
              className="mt-3 w-full accent-lagoon-600"
            />
          </Field>

          <div className="mt-2 sm:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/45">
              Individual cost breakdown (BDT)
            </h3>
            <p className="mt-1 text-xs text-ink/50">
              The headline &quot;per day&quot; figure updates automatically from these four lines.
            </p>
          </div>

          <Field label="Lodging / night">
            <Input type="number" min={0} step={50} value={form.lodgingCost} onChange={(e) => set("lodgingCost", Number(e.target.value))} />
          </Field>
          <Field label="Food / day">
            <Input type="number" min={0} step={50} value={form.foodCost} onChange={(e) => set("foodCost", Number(e.target.value))} />
          </Field>
          <Field label="Local transport / day">
            <Input type="number" min={0} step={50} value={form.localTransportCost} onChange={(e) => set("localTransportCost", Number(e.target.value))} />
          </Field>
          <Field label="Activities / day">
            <Input type="number" min={0} step={50} value={form.activityCost} onChange={(e) => set("activityCost", Number(e.target.value))} />
          </Field>
          <Field label="Intercity transport from Dhaka (round trip)" hint="Bus, train, launch or air fare — listed separately on the public cost table.">
            <Input type="number" min={0} step={100} value={form.intercityTransport} onChange={(e) => set("intercityTransport", Number(e.target.value))} />
          </Field>
          <Field label="One-off entry fee">
            <Input type="number" min={0} step={10} value={form.entryFee} onChange={(e) => set("entryFee", Number(e.target.value))} />
          </Field>

          <div className="sm:col-span-2 rounded-xl bg-lagoon-50 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-lagoon-700">
                Computed per-day total
              </span>
              <span className="text-lg font-black text-lagoon-700">
                {formatMoney(Math.round(form.avgDailyCost), form.currency)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-ink/50">
              {formatMoney(Math.round(form.lodgingCost), form.currency)} lodging +{" "}
              {formatMoney(Math.round(form.foodCost), form.currency)} food +{" "}
              {formatMoney(Math.round(form.localTransportCost), form.currency)} transport +{" "}
              {formatMoney(Math.round(form.activityCost), form.currency)} activities
            </p>
          </div>

          <div className="mt-2 sm:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/45">
              Logistics & map
            </h3>
          </div>

          <Field label="Travel mode">
            <Select value={form.travelMode} onChange={(e) => set("travelMode", e.target.value)}>
              {TRAVEL_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Journey time">
            <Input value={form.travelTime} onChange={(e) => set("travelTime", e.target.value)} placeholder="6h 30m from Dhaka" />
          </Field>
          <Field label="Distance from Dhaka (km)">
            <Input type="number" min={0} step={5} value={form.distanceFromDhaka} onChange={(e) => set("distanceFromDhaka", Number(e.target.value))} />
          </Field>
          <Field label="Currency">
            <Select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {["BDT", "USD", "EUR", "GBP", "INR"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Latitude" hint="Used to place the pin on the map.">
            <Input type="number" step="0.0001" value={form.latitude} onChange={(e) => set("latitude", Number(e.target.value))} />
          </Field>
          <Field label="Longitude">
            <Input type="number" step="0.0001" value={form.longitude} onChange={(e) => set("longitude", Number(e.target.value))} />
          </Field>
          <Field label="Access note" className="sm:col-span-2" hint="Permits, ID checks, seasonal closures — e.g. Boga Lake restrictions.">
            <Input value={form.accessNote} onChange={(e) => set("accessNote", e.target.value)} placeholder="Restricted area. Security clearance required." />
          </Field>
          <Field label="Image URL" className="sm:col-span-2" hint="Leave blank to use a placeholder photo.">
            <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="One-line summary" className="sm:col-span-2">
            <Input value={form.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Clouds, mountains, and scenic resorts." />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Logistics, which neighbourhood to stay in, the meal you can't stop thinking about…" />
          </Field>
          <Field label="Tags" className="sm:col-span-2" hint="Comma separated, max 8.">
            <Input value={form.tagsText} onChange={(e) => set("tagsText", e.target.value)} placeholder="clouds, mountains, resorts" />
          </Field>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 rounded accent-lagoon-600"
            />
            <span className="text-sm font-semibold text-ink/70">Feature on the public home page</span>
          </label>
          <input type="hidden" value={todayISO()} />
        </form>
      </Modal>
    </div>
  );
}

function Mini({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">{label}</p>
      <p className={`mt-0.5 font-black text-ink ${small ? "truncate text-[11px]" : "text-xs"}`}>
        {value}
      </p>
    </div>
  );
}
