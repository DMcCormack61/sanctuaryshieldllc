import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { IncidentAtlas } from "@/components/incident-atlas";
import { IncidentRow } from "@/components/incident-row";
import { YearChart, TypeChart } from "@/components/desk-charts";
import { getDashboard } from "@/lib/incidents-server";
import { WWL_2026 } from "@/lib/incidents";
import { formatCompact } from "@/lib/format";

export const Route = createFileRoute("/")({
  loader: () => getDashboard(),
  component: Desk,
});

function Desk() {
  const data = Route.useLoaderData();
  const { totals } = data;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-subtle">
          Testimony · People · Resources
        </p>
        <h1 className="max-w-3xl font-display text-3xl leading-tight tracking-tight text-fg sm:text-4xl">
          Documented attacks on churches, so leadership can see the field.
        </h1>
        <p className="max-w-2xl text-base text-muted">
          A Sanctuary Shield desk of bombings, shootings, arson, raids, and vandalism
          against Christian churches worldwide — drawn from public reporting, not a
          complete census of persecution.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Incidents filed" value={formatCompact(totals.incidents)} />
        <Kpi label="Killed" value={formatCompact(totals.fatalities)} />
        <Kpi label="Injured" value={formatCompact(totals.injured)} />
        <Kpi label="Countries" value={formatCompact(totals.countries)} />
        <Kpi label="Since 2025" value={formatCompact(totals.last12Months)} />
        <Kpi label="Structures hit" value={formatCompact(totals.structures)} />
      </section>

      <IncidentAtlas points={data.mapPoints} />

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] lg:col-span-3">
          <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">By year</p>
          <h2 className="font-display text-xl text-fg">Volume on the desk</h2>
          <YearChart data={data.byYear} />
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] lg:col-span-2">
          <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">By type</p>
          <h2 className="font-display text-xl text-fg">How they arrive</h2>
          <TypeChart data={data.byType} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl bg-surface p-2 shadow-[var(--shadow-border)] lg:col-span-3">
          <div className="flex items-end justify-between px-3 pb-2 pt-3">
            <div>
              <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">Latest</p>
              <h2 className="font-display text-xl text-fg">Recent incidents</h2>
            </div>
            <Link
              to="/incidents"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
            >
              Full list <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.recent.map((inc) => (
              <IncidentRow key={inc.id} incident={inc} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">
              {WWL_2026.source}
            </p>
            <h2 className="mt-1 font-display text-xl text-fg">Wider picture</h2>
            <p className="mt-2 text-sm text-muted">
              This desk files notable, publicly documented incidents. Open Doors counts a
              much larger field:
            </p>
            <dl className="mt-4 space-y-3">
              <StatLine label="Christians killed" value={formatCompact(WWL_2026.killed)} />
              <StatLine
                label="of those in Nigeria"
                value={formatCompact(WWL_2026.nigeriaShareKilled)}
              />
              <StatLine
                label="Churches & properties attacked"
                value={formatCompact(WWL_2026.churchesAttacked)}
              />
              <StatLine
                label="Facing high persecution"
                value={`${WWL_2026.facingPersecutionMillions} million`}
              />
            </dl>
            <Link
              to="/briefing"
              className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              Read the briefing <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">
              Hardest-hit in this file
            </p>
            <h2 className="mt-1 font-display text-xl text-fg">By fatalities</h2>
            <ol className="mt-4 space-y-2">
              {data.byCountry.slice(0, 6).map((c, i) => (
                <li key={c.country} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-muted">
                    <span className="mr-2 tabular-nums text-subtle">{i + 1}</span>
                    {c.country}
                  </span>
                  <span className="tabular-nums text-fg">{formatCompact(c.fatalities)}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-4 shadow-[var(--shadow-border)] sm:px-4">
      <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums tracking-tight text-fg sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="tabular-nums text-sm text-fg">{value}</dd>
    </div>
  );
}
