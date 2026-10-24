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
  Input,
  useToast,
} from "@/components/ui";
import { apiFetch } from "@/lib/client";
import { relativeTime } from "@/lib/format";

export type MessageRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string | Date;
};

export default function MessagesManager({ initial }: { initial: MessageRow[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [rows, setRows] = useState<(MessageRow & { _pending?: boolean })[]>(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(initial[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q);
      const matchS = statusFilter === "all" || r.status === statusFilter;
      return matchQ && matchS;
    });
  }, [rows, query, statusFilter]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      new: rows.filter((r) => r.status === "new").length,
      read: rows.filter((r) => r.status === "read").length,
      archived: rows.filter((r) => r.status === "archived").length,
    }),
    [rows],
  );

  const active = rows.find((r) => r.id === selected) ?? filtered[0] ?? null;

  async function setStatus(m: MessageRow, status: string) {
    const snapshot = rows;
    setRows((rs) => rs.map((r) => (r.id === m.id ? { ...r, status, _pending: true } : r)));
    const res = await apiFetch<{ message: MessageRow }>(`/api/messages/${m.id}`, {
      method: "PATCH",
      json: { status },
    });
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === m.id ? res.data.message : r)));
      router.refresh();
    } else {
      setRows(snapshot);
      push(res.error, "error");
    }
  }

  async function remove(id: number) {
    const snapshot = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    if (selected === id) setSelected(null);
    push("Message deleted.", "info");
    const res = await apiFetch(`/api/messages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setRows(snapshot);
      push(res.error, "error");
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sender, subject or body…"
            className="pl-9"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/35">
            🔍
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-ink/8">
          {(["all", "new", "read", "archived"] as const).map((s) => (
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
      </div>

      {filtered.length === 0 ? (
        rows.length === 0 ? (
          <EmptyState
            icon="✉️"
            title="Inbox zero"
            description="Messages sent through the public contact form land here. Share your board to get the conversation started."
            action={
              <Button variant="outline" onClick={() => window.open("/contact", "_blank")}>
                Open the contact page
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No matching messages"
            description="Try a different search term or clear the status filter."
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
        <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
          <Card className="divide-y divide-ink/5 overflow-hidden">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m.id);
                  if (m.status === "new") setStatus(m, "read");
                }}
                className={`block w-full px-5 py-4 text-left transition ${
                  active?.id === m.id ? "bg-lagoon-50" : "hover:bg-sand-50"
                } ${m._pending ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    {m.status === "new" && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-lagoon-500" />
                    )}
                    <span
                      className={`truncate text-sm ${m.status === "new" ? "font-black text-ink" : "font-semibold text-ink/75"}`}
                    >
                      {m.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-ink/40">
                    {relativeTime(m.createdAt)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-ink/70">{m.subject}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink/45">
                  {m.message}
                </p>
                <div className="mt-2">
                  <Badge tone={statusTone(m.status)}>{m.status}</Badge>
                </div>
              </button>
            ))}
          </Card>

          {active ? (
            <Card className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-black tracking-tight">{active.subject}</h2>
                  <p className="mt-1 text-sm font-semibold text-lagoon-700">{active.email}</p>
                  <p className="text-xs text-ink/45">
                    {active.name} · {relativeTime(active.createdAt)}
                  </p>
                </div>
                <Badge tone={statusTone(active.status)}>{active.status}</Badge>
              </div>

              <p className="mt-5 flex-1 whitespace-pre-wrap rounded-2xl bg-sand-50 p-5 text-sm leading-relaxed text-ink/70">
                {active.message}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-5">
                <a
                  href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(active.subject)}`}
                  className="inline-flex h-10 items-center rounded-xl bg-lagoon-600 px-4 text-sm font-bold text-white transition hover:bg-lagoon-700"
                >
                  Reply by email
                </a>
                <Button variant="outline" onClick={() => setStatus(active, "archived")}>
                  Archive
                </Button>
                {active.status !== "new" && (
                  <Button variant="ghost" onClick={() => setStatus(active, "new")}>
                    Mark unread
                  </Button>
                )}
                <ConfirmButton
                  className="ml-auto h-10 px-4 text-sm"
                  onConfirm={() => remove(active.id)}
                />
              </div>
            </Card>
          ) : (
            <Card className="grid place-items-center p-10 text-sm text-ink/50">
              Select a message to read it.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
