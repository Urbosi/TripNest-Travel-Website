"use client";

import { useState } from "react";
import { Button, Card, Field, Input, Select, Textarea, useToast } from "@/components/ui";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const SUBJECTS = [
  "General enquiry",
  "Trip planning help",
  "Partnership",
  "Bug report",
  "Press & media",
];

const initial: FormState = { name: "", email: "", subject: SUBJECTS[0], message: "" };

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { push } = useToast();

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setDetails((d) => ({ ...d, [key]: "" }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setDetails({});
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        error?: string;
        details?: Record<string, string>;
      };

      if (!res.ok) {
        setDetails(data.details ?? {});
        push(data.error ?? "Something went wrong.", "error");
        return;
      }

      setSent(true);
      setForm(initial);
      push("Message received — we usually reply within a day.");
    } catch {
      push("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <Card className="p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-lagoon-50 text-3xl">
          📬
        </div>
        <h3 className="mt-5 text-xl font-black tracking-tight">Message sent!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">
          Thanks for reaching out. A real person reads every message and you&apos;ll hear back within
          one business day.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" hint={details.name}>
            <Input
              value={form.name}
              onChange={set("name")}
              placeholder="Alex Rivera"
              invalid={Boolean(details.name)}
            />
          </Field>
          <Field label="Email" hint={details.email}>
            <Input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              invalid={Boolean(details.email)}
            />
          </Field>
        </div>

        <Field label="Subject">
          <Select value={form.subject} onChange={set("subject")}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Message" hint={details.message}>
          <Textarea
            value={form.message}
            onChange={set("message")}
            rows={6}
            placeholder="Tell us what you're planning, or what's confusing you…"
            className="min-h-[150px]"
            invalid={Boolean(details.message)}
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink/45">
            We reply to everything. No newsletters unless you ask.
          </p>
          <Button type="submit" loading={submitting} size="lg">
            {submitting ? "Sending…" : "Send message"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
