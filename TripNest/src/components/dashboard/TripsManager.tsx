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
import { TRIP_STATUSES, formatDate, formatMoney, nightsBetween, todayISO } from "@/lib/format";

export type TripRow = {
  id: number;
  destinationId: number | null;
  title: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  status: string;
  notes: string;
};

type DestinationOption = { id: number; name: string; country: string; avgDailyCost: number };

type FormState = {
  title: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  status: string;
  notes: string;
};

function emptyForm(): FormState {
  const start = new Date();
  start.setDate(start.getDate() + 30);
  const end = new Date(start);
  end.setDate(end.getDate() + 9);
  return {
    title: "",
    destinationId: "",
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    travelers: 2,
    budget: 2500,
    status: "planning",
    notes: "",
  };
}

export default function TripsManager({
  initial,
  destinations,
  spendByTrip,
  currency,
}: {
  initial: TripRow[];
  destinations: DestinationOption[];
  spendByTrip: Record<number, number>;
  currency: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [rows, setRows] = useState<(TripRow & { _pending?: boolean })[]>(initial);
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TripRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [details, setDetails] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const destById = useMemo(
    () => new Map(destinations.map((d) => [d.id, d])),
    [destinations],
  );

  const filtered = useMemo(
    () => (statusFilter === "all" ? rows : rows.filter((r) => r.status === statusFilter)),
    [rows, statusFilter],
  );

  const totals = useMemo(() => {
    const budget = rows.reduce((s, r) => s + r.budget, 0);
    const spent = rows.reduce((s, r) => s + (spendByTrip[r.id] ?? 0), 0);
    const nights = rows.reduce((s, r) => s + nightsBetween(r.startDate, r.endDate), 0);
    return { budget, spent, nights };
  }, [rows, spendByTrip]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDetails({});
    setOpen(true);
  }

  function openEdit(t: TripRow) {
    setEditing(t);
    setForm({
      title: t.title,
      destinationId: t.destinationId ? String(t.destinationId) : "",
      startDate: t.startDate,
      endDate: t.endDate,
      travelers: t.travelers,
      budget: t.budget,
      status: t.status,
      notes: t.notes,
    });
    setDetails({});
    setOpen(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDetails((d) => ({ ...d, [key as string]: "" }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.endDate < form.startDate) {
      setDetails({ endDate: "End date must be after the start date." });
      return;
    }
    setSaving(true);
    setDetails({});

    const payload = {
      ...form,
      destinationId: form.destinationId ? Number(form.destinationId) : null,
    };

    const tempId = -Math.floor(Math.random() * 1_000_000);
    const optimistic: TripRow & { _pending?: boolean } = {
      id: editing?.id ?? tempId,
      ...payload,
      _pending: true,
    };
    setRows((rs) => (editing ? rs.map((r) => (r.id === editing.id ? optimistic : r)) : [optimistic, ...rs]));
    setOpen(false);

    const res = editing
      ? await apiFetch<{ trip: TripRow }>(`/api/trips/${editing.id}`, { method: "PATCH", json: payload })
      : await apiFetch<{ trip: TripRow }>("/api/trips", { method: "POST", json: payload });

    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === optimistic.id ? res.data.trip : r)));
      push(editing ? "Trip updated." : `${res.data.trip.title} added.`);
      router.refresh();
    } else {
      setRows((rs) => rs.filter((r) => r.id !== optimistic.id));
      setDetails(res.details ?? {});
      setOpen(true);
      push(res.error, "error");
    }
    setSaving(false);
  }

  async function remove(id: number) {
    const snapshot = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    push("Trip deleted.", "info");
    const res = await apiFetch(`/api/trips/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setRows(snapshot);
      push(res.error, "error");
    } else {
      router.refresh();
    }
  }

  async function quickStatus(t: TripRow, status: string) {
    const snapshot = rows;
    setRows((rs) => rs.map((r) => (r.id === t.id ? { ...r, status, _pending: true } : r)));
    const res = await apiFetch<{ trip: TripRow }>(`/api/trips/${t.id}`, {
      method: "PATCH",
      json: { status },
    });
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === t.id ? res.data.trip : r)));
      router.refresh();
    } else {
      setRows(snapshot);
      push(res.error, "error");
    }
  }

  const estimateFor = (destinationId: string, startDate: string, endDate: string, travelers: number) => {
    const d = destinations.find((x) => String(x.id) === destinationId);
    if (!d) return null;
    const nights = nightsBetween(startDate, endDate);
    return d.avgDailyCost * nights * travelers;
  };

  const estimate = estimateFor(form.destinationId, form.startDate, form.endDate, form.travelers);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Total budget</p>
          <p className="mt-1 text-2xl font-black">{formatMoney(Math.round(totals.budget), currency)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Logged against trips</p>
          <p className="mt-1 text-2xl font-black text-lagoon-700">
            {formatMoney(Math.round(totals.spent), currency)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Nights planned</p>
          <p className="mt-1 text-2xl font-black">{totals.nights}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-ink/8">
          {["all", ...TRIP_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                statusFilter === s ? "bg-ink text-white" : "text-ink/50 hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button onClick={openCreate}>+ New trip</Button>
      </div>

      {filtered.length === 0 ? (
        rows.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="No trips yet"
            description="Give a destination some dates and a budget. You can always shift them later."
            action={<Button onClick={openCreate}>Plan your first trip</Button>}
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No trips with that status"
            description="Switch filters to see the rest of your itineraries."
            action={
              <Button variant="outline" onClick={() => setStatusFilter("all")}>
                Show all trips
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => {
            const dest = t.destinationId ? destById.get(t.destinationId) : null;
            const spent = spendByTrip[t.id] ?? 0;
            const pct = t.budget > 0 ? Math.min(100, Math.round((spent / t.budget) * 100)) : 0;
            const nights = nightsBetween(t.startDate, t.endDate);
            const upcoming = t.startDate >= todayISO();
            return (
              <Card key={t.id} className={`p-5 ${t._pending ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black tracking-tight">{t.title}</h3>
                      <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                      {upcoming && nights > 0 && (
                        <Badge tone="sky">
                          {new Date(`${t.startDate}T12:00:00Z`).getTime() > Date.now()
                            ? `in ${Math.max(
                                1,
                                Math.round(
                                  (new Date(`${t.startDate}T12:00:00Z`).getTime() - Date.now()) / 86400000,
                                ),
                              )} days`
                            : "happening now"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-ink/55">
                      {dest ? `📍 ${dest.name}, ${dest.country} · ` : "📍 Unassigned · "}
                      {formatDate(t.startDate)} → {formatDate(t.endDate)} · {nights} nights ·{" "}
                      {t.travelers} {t.travelers === 1 ? "traveller" : "travellers"}
                    </p>
                    {t.notes && (
                      <p className="mt-3 rounded-xl bg-sand-50 px-4 py-3 text-xs leading-relaxed text-ink/60">
                        {t.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Select
                      value={t.status}
                      onChange={(e) => quickStatus(t, e.target.value)}
                      className="h-8 w-32 py-0 text-xs"
                    >
                      {TRIP_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                      Edit
                    </Button>
                    <ConfirmButton onConfirm={() => remove(t.id)} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-ink/50">
                      <span>{formatMoney(Math.round(spent), currency)} logged</span>
                      <span>{formatMoney(Math.round(t.budget), currency)} budget</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-sand-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          pct > 95 ? "bg-rose-500" : pct > 75 ? "bg-amber-400" : "bg-lagoon-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-right text-xs font-bold text-ink/45">
                    {pct}% committed · {t.budget > 0 ? formatMoney(Math.max(0, Math.round(t.budget - spent)), currency) : "—"} left
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.title}` : "New trip"}
        description="Dates drive your budget estimate, so keep them honest."
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing ? "Save changes" : "Create trip"}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Trip name" className="sm:col-span-2" hint={details.title}>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Patagonia W Trek"
              invalid={Boolean(details.title)}
            />
          </Field>
          <Field label="Destination" className="sm:col-span-2">
            <Select
              value={form.destinationId}
              onChange={(e) => set("destinationId", e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.country} ({formatMoney(d.avgDailyCost)}/day)
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start date" hint={details.startDate}>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              invalid={Boolean(details.startDate)}
            />
          </Field>
          <Field label="End date" hint={details.endDate}>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              invalid={Boolean(details.endDate)}
            />
          </Field>
          <Field label={`Travellers — ${form.travelers}`}>
            <input
              type="range"
              min={1}
              max={8}
              value={form.travelers}
              onChange={(e) => set("travelers", Number(e.target.value))}
              className="mt-3 w-full accent-lagoon-600"
            />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {TRIP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Total budget" className="sm:col-span-2" hint={details.budget}>
            <Input
              type="number"
              min={0}
              step={50}
              value={form.budget}
              onChange={(e) => set("budget", Number(e.target.value))}
            />
          </Field>
          {estimate !== null && (
            <div className="sm:col-span-2 rounded-xl border border-lagoon-300/50 bg-lagoon-50 px-4 py-3 text-sm">
              <span className="font-bold text-lagoon-700">
                Estimated on-ground cost: {formatMoney(Math.round(estimate), currency)}
              </span>
              <span className="ml-2 text-ink/55">
                for {nightsBetween(form.startDate, form.endDate)} nights × {form.travelers}{" "}
                {form.travelers === 1 ? "traveller" : "travellers"}
              </span>
            </div>
          )}
          <Field label="Notes" className="sm:col-span-2">
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              placeholder="Bookings to make, visas to sort, who's bringing the tent…"
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
