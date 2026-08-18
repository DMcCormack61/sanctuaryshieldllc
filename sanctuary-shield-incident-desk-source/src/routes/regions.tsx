import { createFileRoute, Link } from "@tanstack/react-router";
import { IncidentAtlas } from "@/components/incident-atlas";
import { getDashboard } from "@/lib/incidents-server";
import { REGIONS } from "@/lib/incidents";
import { formatCompact } from "@/lib/format";

export const Route = createFileRoute("/regions")({
  loader: () => getDashboard(),
  component: Regions,
});

function Regions() {
  const data = Route.useLoaderData();
  const byRegion = new Map(data.byRegion.map((r) => [r.region, r]));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-subtle">Regions</p>
        <h1 className="font-display text-3xl tracking-tight text-fg">Where the field sits</h1>
        <p className="max-w-2xl text-muted">
          Counts below are for this curated file, not national crime totals. Open a
          region to read every incident filed there.
        </p>
      </header>

      <IncidentAtlas points={data.mapPoints} />

      <div className="grid gap-3 sm:grid-cols-2">
        {REGIONS.map((region) => {
          const stat = byRegion.get(region);
          const incidents = stat?.incidents ?? 0;
          const fatalities = stat?.fatalities ?? 0;
          return (
            <Link
              key={region}
              to="/incidents"
              search={{ region }}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <p className="font-display text-xl text-fg">{region}</p>
              <p className="mt-2 text-sm text-muted">
                <span className="tabular-nums text-fg">{formatCompact(incidents)}</span>{" "}
                {incidents === 1 ? "incident" : "incidents"}
                <span className="text-subtle"> · </span>
                <span className="tabular-nums">{formatCompact(fatalities)}</span> killed
              </p>
            </Link>
          );
        })}
      </div>

      <section>
        <h2 className="font-display text-xl text-fg">Countries in the file</h2>
        <div className="mt-4 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
          {data.byCountry.map((c) => (
            <Link
              key={c.country}
              to="/incidents"
              search={{ country: c.country }}
              className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm hover:bg-elevated"
            >
              <span className="text-fg">{c.country}</span>
              <span className="tabular-nums text-muted">
                {formatCompact(c.incidents)} filed · {formatCompact(c.fatalities)} killed
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
