import { Badge } from "@/components/ui";
import { statusTone } from "@/lib/status";
import { mapsSearchUrl } from "@/lib/maps";
import { formatMoney } from "@/lib/format";

export type DestinationLite = {
  id: number;
  name: string;
  country: string;
  continent: string;
  division?: string;
  summary: string;
  imageUrl: string;
  avgDailyCost: number;
  currency: string;
  rating: number;
  bestSeason: string;
  tags: string[];
  status: string;
  latitude?: number;
  longitude?: number;
};

export default function DestinationCard({
  destination,
}: {
  destination: DestinationLite;
}) {
  return (
    <article className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[0_1px_2px_rgb(16_24_40/0.06)]">
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={destination.imageUrl}
          alt={`${destination.name}, ${destination.country}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="lagoon" className="bg-white/90 backdrop-blur">
            {destination.division ?? destination.continent}
          </Badge>
          <Badge tone={statusTone(destination.status)} className="bg-white/90 backdrop-blur">
            {destination.status}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
          <div className="min-w-0">
            <h3 className="text-lg font-black leading-tight drop-shadow">{destination.name}</h3>
            <p className="text-xs font-medium text-white/80">
              {destination.division ? `${destination.division} · ` : ""}
              {destination.country}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-ink">
            ★ {destination.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink/60">
          {destination.summary || "No notes yet — add your first impression."}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {destination.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-semibold text-ink/55"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-ink/8 pt-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
              Avg / day
            </p>
            <p className="text-sm font-black text-lagoon-700">
              {formatMoney(destination.avgDailyCost, destination.currency)}
            </p>
          </div>
          <span className="text-right text-xs font-semibold text-ink/45">
            🌤 {destination.bestSeason}
          </span>
        </div>

        {typeof destination.latitude === "number" && typeof destination.longitude === "number" && (
          <a
            href={mapsSearchUrl(destination.latitude, destination.longitude, destination.name)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-ink/12 text-xs font-bold text-ink/65 transition hover:border-lagoon-500 hover:bg-lagoon-50 hover:text-lagoon-700"
          >
            📍 View on Google Maps
          </a>
        )}
      </div>
    </article>
  );

}
