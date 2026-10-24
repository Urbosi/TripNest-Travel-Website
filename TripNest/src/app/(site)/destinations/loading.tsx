export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
      <div className="skeleton h-3 w-40 rounded-full" />
      <div className="skeleton mt-4 h-10 w-2/3 max-w-xl rounded-xl" />
      <div className="skeleton mt-4 h-4 w-full max-w-2xl rounded-lg" />
      <div className="skeleton mt-10 h-14 w-full rounded-2xl" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
            <div className="skeleton h-48 w-full rounded-none" />
            <div className="space-y-3 p-5">
              <div className="skeleton h-4 w-2/3 rounded-lg" />
              <div className="skeleton h-3 w-full rounded-lg" />
              <div className="skeleton h-3 w-4/5 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
