import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { IncidentAtlas } from "@/components/incident-atlas";
import { SeverityBadge } from "@/components/severity-badge";
import { WatchButton } from "@/components/watch-button";
import { AnalystNote } from "@/components/analyst-note";
import { Badge } from "@/components/ui/badge";
import { getDashboard, getIncident } from "@/lib/incidents-server";
import { typeLabel } from "@/lib/incidents";
import { formatCompact, formatDate } from "@/lib/format";

export const Route = createFileRoute("/incidents/$id")({
  loader: async ({ params }) => {
    const [incident, dash] = await Promise.all([
      getIncident({ data: params.id }),
      getDashboard(),
    ]);
    if (!incident) throw notFound();
    return { incident, mapPoints: dash.mapPoints };
  },
  component: IncidentDetail,
});

function IncidentDetail() {
  const { incident, mapPoints } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/incidents"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Back to incidents
      </Link>

      <div className="grid gap-6 lg:grid-cols-5">
        <article className="flex flex-col gap-5 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <Badge>{typeLabel(incident.incidentType)}</Badge>
            {incident.scope === "campaign" ? <Badge variant="outline">Campaign</Badge> : null}
            {incident.verified ? <Badge variant="outline">Documented</Badge> : null}
          </div>
          <header>
            <p className="text-sm text-muted">
              <time dateTime={incident.occurredOn}>{formatDate(incident.occurredOn)}</time>
              {" · "}
              {incident.city}, {incident.country}
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight text-fg sm:text-4xl">
              {incident.title}
            </h1>
            <p className="mt-2 text-muted">{incident.siteName}</p>
          </header>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Killed" value={formatCompact(incident.fatalities)} />
            <Fact label="Injured" value={formatCompact(incident.injured)} />
            <Fact label="Structures" value={formatCompact(incident.structuresDamaged)} />
            <Fact label="Denomination" value={incident.denomination ?? "—"} />
          </dl>

          <div className="space-y-3 text-base leading-relaxed text-fg">
            <p>{incident.summary}</p>
            {incident.context ? <p className="text-muted">{incident.context}</p> : null}
          </div>

          <p className="text-sm text-subtle">
            Source: {incident.sourceName}
            {incident.sourceUrl ? (
              <>
                {" · "}
                <a
                  href={incident.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted underline-offset-4 hover:text-fg hover:underline"
                >
                  Open report <ExternalLink className="size-3" />
                </a>
              </>
            ) : null}
          </p>

          <WatchButton incidentId={incident.id} />
          <AnalystNote incidentId={incident.id} />
        </article>

        <aside className="flex flex-col gap-4 lg:col-span-2">
          <IncidentAtlas points={mapPoints} highlightId={incident.id} />
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">Location</p>
            <p className="mt-2 font-display text-xl text-fg">
              {incident.city}, {incident.country}
            </p>
            <p className="mt-1 text-sm text-muted">{incident.region}</p>
            <p className="mt-3 font-mono text-xs tabular-nums text-subtle">
              {incident.latitude.toFixed(3)}°, {incident.longitude.toFixed(3)}°
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
      <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-fg">{value}</dd>
    </div>
  );
}
