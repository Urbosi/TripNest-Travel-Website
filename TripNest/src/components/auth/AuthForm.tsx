"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, useToast } from "@/components/ui";
import { DEMO_PASSWORD, DEMO_EMAIL } from "@/lib/demo";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { push } = useToast();
  const isLogin = mode === "login";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    homeCity: "",
  });
  const [details, setDetails] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setDetails((d) => ({ ...d, [key]: "" }));
      setError("");
    };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDetails({});

    try {
      const res = await fetch(isLogin ? "/api/auth/login" : "/api/auth/signup", {
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
        setError(data.error ?? "Something went wrong.");
        push(data.error ?? "Something went wrong.", "error");
        return;
      }

      push(isLogin ? "Welcome back!" : "Account created — enjoy your board!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      push("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  function useDemo() {
    setForm((f) => ({ ...f, email: DEMO_EMAIL, password: DEMO_PASSWORD }));
    push("Demo credentials filled in — hit sign in.", "info");
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-black tracking-tight">
        {isLogin ? "Welcome back" : "Create your board"}
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        {isLogin
          ? "Sign in to your destinations, trips and expense log."
          : "Free forever while we're in beta. No card, no trial timer."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        {!isLogin && (
          <Field label="Full name" hint={details.name}>
            <Input
              value={form.name}
              onChange={set("name")}
              placeholder="Alex Rivera"
              autoComplete="name"
              invalid={Boolean(details.name)}
            />
          </Field>
        )}

        <Field label="Email" hint={details.email}>
          <Input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            autoComplete="email"
            invalid={Boolean(details.email)}
          />
        </Field>

        <Field label="Password" hint={details.password}>
          <Input
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            invalid={Boolean(details.password)}
          />
        </Field>

        {!isLogin && (
          <Field label="Home city" hint="Optional — helps us tune cost estimates.">
            <Input
              value={form.homeCity}
              onChange={set("homeCity")}
              placeholder="Lisbon, Portugal"
              autoComplete="address-level2"
            />
          </Field>
        )}

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>

      {isLogin && (
        <button
          onClick={useDemo}
          type="button"
          className="mt-4 w-full rounded-xl border border-dashed border-lagoon-300 bg-lagoon-50/60 px-4 py-3 text-left transition hover:bg-lagoon-50"
        >
          <span className="block text-xs font-bold uppercase tracking-wide text-lagoon-700">
            Try the demo account
          </span>
          <span className="mt-0.5 block font-mono text-xs text-ink/60">
            {DEMO_EMAIL} · {DEMO_PASSWORD}
          </span>
        </button>
      )}

      <p className="mt-8 text-sm text-ink/55">
        {isLogin ? "New to TripNest? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-bold text-lagoon-700 underline-offset-4 hover:underline"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
