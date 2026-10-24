"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { statusTone } from "@/lib/status";
import {
  Button,
  Card,
  ConfirmButton,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  useToast,
  Badge,
} from "@/components/ui";
import { apiFetch } from "@/lib/client";
import {
  EXPENSE_CATEGORIES,
  formatDate,
  formatMoney,
  formatShortDate,
  todayISO,
} from "@/lib/format";

export type ExpenseRow = {
  id: number;
  tripId: number | null;
  category: string;
  description: string;
  amount: number;
  currency: string;
  spentOn: string;
};

type TripOption = { id: number; title: string };
type DestinationOption = { id: number; name: string; country: string; avgDailyCost: number };

type FormState = {
  category: string;
  description: string;
  amount: number;
  currency: string;
  spentOn: string;
  tripId: string;
};

const COLORS: Record<string, string> = {
  Flights: "#0d8371",
  Lodging: "#14a38b",
  Food: "#7ddcc4",
  Transport: "#ff8a6a",
  Activities: "#f7b267",
  Gear: "#6b8bd6",
  Insurance: "#a78bfa",
  Visas: "#f472b6",
  Other: "#94a3b8",
};

function emptyForm(currency: string): FormState {
  return {
    category: "Flights",
    description: "",
    amount: 0,
    currency,
    spentOn: todayISO(),
    tripId: "",
  };
}

export default function ExpensesManager({
  initial,
  trips,
  destinations,
  currency,
}: {
  initial: ExpenseRow[];
  trips: TripOption[];
  destinations: DestinationOption[];
  currency: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [rows, setRows] = useState<(ExpenseRow & { _pending?: boolean })[]>(initial);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tripFilter, setTripFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(currency));
  const [details, setDetails] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [quickAmount, setQuickAmount] = useState("");

  const tripById = useMemo(() => new Map(trips.map((t) => [t.id, t.title])), [trips]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !q || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      const matchC = categoryFilter === "all" || r.category === categoryFilter;
      const matchT =
        tripFilter === "all" ||
        (tripFilter === "none" ? r.tripId === null : String(r.tripId) === tripFilter);
      return matchQ && matchC && matchT;
    });
  }, [rows, query, categoryFilter, tripFilter]);

  const totals = useMemo(() => {
    const all = rows.reduce((s, r) => s + r.amount, 0);
    const shown = filtered.reduce((s, r) => s + r.amount, 0);
    return { all, shown };
  }, [rows, filtered]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rows) map[r.category] = (map[r.category] ?? 0) + r.amount;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const maxCat = Math.max(1, ...byCategory.map(([, v]) => v));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(currency));
    setDetails({});
    setOpen(true);
  }

  function openEdit(e: ExpenseRow) {
    setEditing(e);
    setForm({
      category: e.category,
      description: e.description,
      amount: e.amount,
      currency: e.currency,
      spentOn: e.spentOn,
      tripId: e.tripId ? String(e.tripId) : "",
    });
    setDetails({});
    setOpen(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDetails((d) => ({ ...d, [key as string]: "" }));
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (form.amount <= 0) {
      setDetails({ amount: "Enter an amount greater than zero." });
      return;
    }
    setSaving(true);
    setDetails({});

    const payload = { ...form, tripId: form.tripId ? Number(form.tripId) : null };
    const tempId = -Math.floor(Math.random() * 1_000_000);
    const optimistic: ExpenseRow & { _pending?: boolean } = {
      id: editing?.id ?? tempId,
      ...payload,
      _pending: true,
    };
    setRows((rs) =>
      editing ? rs.map((r) => (r.id === editing.id ? optimistic : r)) : [optimistic, ...rs],
    );
    setOpen(false);

    const res = editing
      ? await apiFetch<{ expense: ExpenseRow }>(`/api/expenses/${editing.id}`, {
          method: "PATCH",
          json: payload,
        })
      : await apiFetch<{ expense: ExpenseRow }>("/api/expenses", { method: "POST", json: payload });

    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === optimistic.id ? res.data.expense : r)));
      push(editing ? "Expense updated." : `Logged ${formatMoney(payload.amount, payload.currency)}.`);
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
    push("Expense deleted.", "info");
    const res = await apiFetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setRows(snapshot);
      push(res.error, "error");
    } else {
      router.refresh();
    }
  }

  /** One-tap logging used by the quick-add strip. */
  async function quickAdd(category: string, amount: number, description: string) {
    if (!amount || amount <= 0) {
      push("Enter an amount first.", "error");
      return;
    }
    const tempId = -Math.floor(Math.random() * 1_000_000);
    const optimistic: ExpenseRow & { _pending?: boolean } = {
      id: tempId,
      tripId: null,
      category,
      description,
      amount,
      currency,
      spentOn: todayISO(),
      _pending: true,
    };
    setRows((rs) => [optimistic, ...rs]);
    setQuickAmount("");
    const res = await apiFetch<{ expense: ExpenseRow }>("/api/expenses", {
      method: "POST",
      json: {
        category,
        description,
        amount,
        currency,
        spentOn: todayISO(),
        tripId: null,
      },
    });
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === tempId ? res.data.expense : r)));
      push(`Logged ${formatMoney(amount, currency)} on ${category.toLowerCase()}.`);
      router.refresh();
    } else {
      setRows((rs) => rs.filter((r) => r.id !== tempId));
      push(res.error, "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick add */}
      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[9rem]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
              Quick log today
            </p>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Amount"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className="mt-1.5 w-36"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["Food", "Transport", "Lodging", "Activities"].map((c) => (
              <button
                key={c}
                onClick={() => quickAdd(c, Number(quickAmount), `Quick ${c.toLowerCase()} log`)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink/12 bg-white px-3.5 text-xs font-bold text-ink/70 transition hover:border-lagoon-500 hover:text-lagoon-700"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: COLORS[c] ?? "#94a3b8" }}
                />
                {c}
              </button>
            ))}
          </div>
          <Button className="ml-auto" onClick={openCreate}>
            + Detailed entry
          </Button>
        </div>
      </Card>

      {/* Stats + breakdown */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
            Total tracked
          </p>
          <p className="mt-1 text-4xl font-black tracking-tight">
            {formatMoney(Math.round(totals.all), currency)}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/45">
            across {rows.length} {rows.length === 1 ? "entry" : "entries"}
            {totals.shown !== totals.all &&
              ` · ${formatMoney(Math.round(totals.shown), currency)} in view`}
          </p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-sand-100">
            {byCategory.map(([c, v]) => (
              <div
                key={c}
                style={{ width: `${(v / totals.all || 0) * 100}%`, background: COLORS[c] ?? "#94a3b8" }}
                title={`${c}: ${formatMoney(Math.round(v), currency)}`}
              />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
            By category
          </p>
          {byCategory.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Nothing logged yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {byCategory.slice(0, 5).map(([c, v]) => (
                <li key={c} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 font-semibold text-ink/70">{c}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand-100">
                    <span
                      className="block h-full rounded-full transition-all duration-700"
                      style={{ width: `${(v / maxCat) * 100}%`, background: COLORS[c] ?? "#94a3b8" }}
                    />
                  </span>
                  <span className="w-24 shrink-0 text-right font-black tabular-nums">
                    {formatMoney(Math.round(v), currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search descriptions…"
            className="pl-9"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/35">
            🔍
          </span>
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-40"
        >
          <option value="all">All categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={tripFilter} onChange={(e) => setTripFilter(e.target.value)} className="w-48">
          <option value="all">All trips</option>
          <option value="none">Unassigned</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        rows.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="No expenses yet"
            description="Log a flight, a hotel deposit or today's lunch. Every entry updates your budget bars instantly."
            action={<Button onClick={openCreate}>Add your first expense</Button>}
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No matching expenses"
            description="Loosen the filters to see the rest of your spend."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setCategoryFilter("all");
                  setTripFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-ink/8 bg-sand-50 text-left text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Trip</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b border-ink/5 transition last:border-0 hover:bg-lagoon-50/40 ${
                      r._pending ? "opacity-50" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-ink/60">
                      {formatShortDate(r.spentOn)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        style={{
                          background: `${COLORS[r.category] ?? "#94a3b8"}22`,
                          color: COLORS[r.category] ?? "#475569",
                        }}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-ink">
                      {r.description || <span className="text-ink/35">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-ink/55">
                      {r.tripId && tripById.get(r.tripId) ? (
                        <span className="line-clamp-1">{tripById.get(r.tripId)}</span>
                      ) : (
                        <Badge tone="neutral">unassigned</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-black tabular-nums">
                      {formatMoney(r.amount, r.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="rounded-lg px-2.5 py-1 text-xs font-bold text-ink/55 transition hover:bg-ink/5 hover:text-ink"
                        >
                          Edit
                        </button>
                        <ConfirmButton onConfirm={() => remove(r.id)} label="✕" confirmLabel="Delete?" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-sand-50 text-sm font-black">
                  <td className="px-5 py-3" colSpan={4}>
                    {filtered.length} shown
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {formatMoney(Math.round(totals.shown), currency)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit expense" : "New expense"}
        description="Assign it to a trip to see budget pacing update automatically."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing ? "Save changes" : "Log expense"}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Amount" hint={details.amount}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", Number(e.target.value))}
              invalid={Boolean(details.amount)}
              className="text-lg font-bold"
            />
          </Field>
          <Field label="Currency">
            <Select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {["USD", "EUR", "GBP", "JPY", "AUD", "CAD"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" hint={details.spentOn}>
            <Input
              type="date"
              value={form.spentOn}
              onChange={(e) => set("spentOn", e.target.value)}
              invalid={Boolean(details.spentOn)}
            />
          </Field>
          <Field label="Assign to trip" className="sm:col-span-2">
            <Select value={form.tripId} onChange={(e) => set("tripId", e.target.value)}>
              <option value="">— Unassigned —</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Return LIS → KIX via Doha"
            />
          </Field>
          {form.tripId && (
            <p className="sm:col-span-2 rounded-xl bg-lagoon-50 px-4 py-3 text-xs font-semibold text-lagoon-700">
              Assigned to {tripById.get(Number(form.tripId))}. Budget bars refresh on the overview.
            </p>
          )}
          <Badge tone="lagoon" className="sm:col-span-2 w-fit">
            Logged {formatDate(todayISO())}
          </Badge>
        </form>
      </Modal>
    </div>
  );
}
