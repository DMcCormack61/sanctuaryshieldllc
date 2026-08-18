import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { IncidentRow } from "@/components/incident-row";
import { Input } from "@/components/ui/input";
import {
  INCIDENT_TYPES,
  REGIONS,
  SEVERITIES,
  type IncidentFilters,
  typeLabel,
  severityLabel,
} from "@/lib/incidents";
import { listCountries, listIncidents, listYears } from "@/lib/incidents-server";
import { formatCompact } from "@/lib/format";

type Search = IncidentFilters;

function parseSearch(raw: Record<string, unknown>): Search {
  const str = (key: string) =>
    typeof raw[key] === "string" && raw[key] ? (raw[key] as string) : undefined;
  return {
    q: str("q"),
    region: str("region"),
    type: str("type"),
    severity: str("severity"),
    year: str("year"),
    country: str("country"),
  };
}

export const Route = createFileRoute("/incidents/")({
  validateSearch: (raw: Record<string, unknown>) => parseSearch(raw),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [incidents, years, countries] = await Promise.all([
      listIncidents({ data: deps }),
      listYears(),
      listCountries(),
    ]);
    return { incidents, years, countries };
  },
  component: Ledger,
});

function Ledger() {
  const { incidents, years, countries } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/incidents/" });

  function patch(next: Partial<Search>) {
    void navigate({
      search: (prev) => {
        const merged = { ...prev, ...next };
        const cleaned: Search = {};
        for (const [k, v] of Object.entries(merged)) {
          if (v) cleaned[k as keyof Search] = v;
        }
        return cleaned;
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-subtle">Incidents</p>
        <h1 className="font-display text-3xl tracking-tight text-fg">All documented filings</h1>
        <p className="max-w-2xl text-muted">
          Filter the curated record by place, type, year, and severity.
        </p>
      </header>

      <div className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={search.q ?? ""}
            onChange={(e) => patch({ q: e.target.value || undefined })}
            placeholder="Search church, city, country…"
            className="pl-10"
            aria-label="Search incidents"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <FilterSelect
            label="Region"
            value={search.region ?? ""}
            onChange={(v) => patch({ region: v || undefined })}
            options={REGIONS.map((r) => ({ value: r, label: r }))}
          />
          <FilterSelect
            label="Type"
            value={search.type ?? ""}
            onChange={(v) => patch({ type: v || undefined })}
            options={INCIDENT_TYPES.map((t) => ({ value: t, label: typeLabel(t) }))}
          />
          <FilterSelect
            label="Severity"
            value={search.severity ?? ""}
            onChange={(v) => patch({ severity: v || undefined })}
            options={SEVERITIES.map((s) => ({ value: s, label: severityLabel(s) }))}
          />
          <FilterSelect
            label="Year"
            value={search.year ?? ""}
            onChange={(v) => patch({ year: v || undefined })}
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
          />
          <FilterSelect
            label="Country"
            value={search.country ?? ""}
            onChange={(v) => patch({ country: v || undefined })}
            options={countries.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </div>

      <p className="tabular-nums text-sm text-muted">
        {formatCompact(incidents.length)}{" "}
        {incidents.length === 1 ? "incident" : "incidents"}
      </p>

      <div className="divide-y divide-border rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]">
        {incidents.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted">
            No incidents match these filters.
          </p>
        ) : (
          incidents.map((inc) => <IncidentRow key={inc.id} incident={inc} />)
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-h-11 flex-col gap-1">
      <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md bg-elevated px-2 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
