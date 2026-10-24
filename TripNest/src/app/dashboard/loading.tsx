import { Skeleton, SkeletonCard } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-md rounded-lg" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-ink/8 bg-white p-5">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="mt-4 h-7 w-24 rounded-lg" />
            <Skeleton className="mt-2 h-3 w-20 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-ink/8 bg-white p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="space-y-4 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-ink/8 bg-white p-6">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
