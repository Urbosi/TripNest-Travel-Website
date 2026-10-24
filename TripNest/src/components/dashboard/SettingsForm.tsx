"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Select, Textarea, useToast } from "@/components/ui";
import { apiFetch } from "@/lib/client";
import { CURRENCIES } from "@/lib/format";

type Profile = {
  name: string;
  email: string;
  role: string;
  homeCity: string;
  bio: string;
  currency: string;
};

export default function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState(profile);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDetails((d) => ({ ...d, [key as string]: "" }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setDetails({});
    const res = await apiFetch<{ user: Profile }>("/api/profile", {
      method: "PATCH",
      json: form,
    });
    if (res.ok) {
      setForm({ ...form, ...res.data.user });
      setSavedAt(new Date().toLocaleTimeString());
      push("Profile saved.");
      router.refresh();
    } else {
      setDetails(res.details ?? {});
      push(res.error, "error");
    }
    setSaving(false);
  }

  const initials = form.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card className="p-6 sm:p-8">
        <form onSubmit={save} className="space-y-5" noValidate>
          <div>
            <h2 className="text-base font-black tracking-tight">Profile</h2>
            <p className="mt-1 text-sm text-ink/55">
              This is what we use to personalise your dashboard and default currency.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" hint={details.name}>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                invalid={Boolean(details.name)}
              />
            </Field>
            <Field label="Email" hint="Sign-in email can't be changed in the demo.">
              <Input value={form.email} disabled />
            </Field>
            <Field label="Traveller type">
              <Select value={form.role} onChange={(e) => set("role", e.target.value)}>
                {["Traveler", "Backpacker", "Digital nomad", "Family planner", "Weekend explorer"].map(
                  (r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ),
                )}
              </Select>
            </Field>
            <Field label="Default currency">
              <Select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Home city" className="sm:col-span-2">
              <Input
                value={form.homeCity}
                onChange={(e) => set("homeCity", e.target.value)}
                placeholder="Lisbon, Portugal"
              />
            </Field>
            <Field label="Bio" className="sm:col-span-2">
              <Textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                rows={4}
                placeholder="A line or two about how you travel."
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-ink/8 pt-5">
            <Button type="submit" loading={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {savedAt && (
              <span className="text-xs font-semibold text-lagoon-700">Saved at {savedAt}</span>
            )}
          </div>
        </form>
      </Card>

      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-xl font-black text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight">{form.name}</p>
              <p className="truncate text-sm text-ink/50">{form.email}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-lagoon-600">
                {form.role}
              </p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 border-t border-ink/8 pt-5 text-sm">
            <Row label="Home city" value={form.homeCity || "—"} />
            <Row label="Default currency" value={form.currency} />
            <Row label="Member since" value={new Date().getFullYear().toString()} />
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-black uppercase tracking-wide text-ink/45">Session</h3>
          <p className="mt-2 text-sm text-ink/55">
            Sessions last 30 days. Signing out clears the cookie on this device only.
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
          >
            Sign out of this device
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink/45">{label}</dt>
      <dd className="truncate font-bold text-ink">{value}</dd>
    </div>
  );
}
