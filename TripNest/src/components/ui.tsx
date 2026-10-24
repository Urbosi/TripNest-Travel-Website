"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { toneClass, type Tone } from "@/lib/status";

/* ---------------------------------- Button --------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-lagoon-600 text-white shadow-sm shadow-lagoon-600/25 hover:bg-lagoon-700 active:bg-lagoon-700",
  secondary: "bg-ink text-white hover:bg-ink/90",
  ghost: "text-ink/70 hover:bg-ink/5 hover:text-ink",
  outline: "border border-ink/15 bg-white text-ink hover:border-lagoon-500 hover:text-lagoon-700",
  danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lagoon-500 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ----------------------------------- Card ---------------------------------- */

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink/8 bg-white shadow-[0_1px_2px_rgb(16_24_40/0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- Badge ---------------------------------- */

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${toneClass(tone)} ${className}`}
    >
      {children}
    </span>
  );
}

/* -------------------------------- EmptyState ------------------------------- */

export function EmptyState({
  icon = "🧭",
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lagoon-50 text-2xl">{icon}</div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink/55">{description}</p>
      {action}
    </div>
  );
}

/* --------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------- Inputs --------------------------------- */

const fieldBase =
  "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:border-lagoon-500 focus:ring-4 focus:ring-lagoon-500/12 disabled:bg-slate-50";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/55">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

export function Input({
  className = "",
  invalid = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || props["aria-invalid"]}
      className={`${fieldBase} ${
        invalid ? "border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-rose-400/15" : ""
      } ${className}`}
    />
  );
}

export function Textarea({
  className = "",
  invalid = false,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || props["aria-invalid"]}
      className={`${fieldBase} min-h-[92px] resize-y ${
        invalid ? "border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-rose-400/15" : ""
      } ${className}`}
    />
  );
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${fieldBase} appearance-none pr-9 ${className}`}>
      {children}
    </select>
  );
}

/* ---------------------------------- Modal ---------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={`animate-fade-up relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${wide ? "sm:max-w-3xl" : "sm:max-w-xl"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/8 px-6 py-5">
          <div>
            <h2 id={id} className="text-lg font-bold text-ink">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/40 transition hover:bg-ink/5 hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-ink/8 bg-sand-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Toasts --------------------------------- */

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };
type ToastContextValue = { push: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastContextValue>({ push: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-up pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              t.tone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : t.tone === "info"
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-lagoon-300 bg-lagoon-50 text-lagoon-700"
            }`}
          >
            <span>{t.tone === "error" ? "⚠️" : t.tone === "info" ? "ℹ️" : "✅"}</span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------- Confirm dialog ---------------------------- */

export function ConfirmButton({
  onConfirm,
  label = "Delete",
  className = "",
  confirmLabel = "Yes, delete",
}: {
  onConfirm: () => void;
  label?: string;
  className?: string;
  confirmLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={`inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition ${
        armed
          ? "bg-rose-600 text-white"
          : "text-rose-600 hover:bg-rose-50"
      } ${className}`}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
