import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lagoon-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/55">{description}</p>
      </div>
      {action}
    </header>
  );
}
