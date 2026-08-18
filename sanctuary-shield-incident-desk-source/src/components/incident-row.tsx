import { Link } from "@tanstack/react-router";
import { SeverityBadge } from "@/components/severity-badge";
import { typeLabel, type Incident } from "@/lib/incidents";
import { formatCompact, formatDate } from "@/lib/format";

export function IncidentRow({ incident }: { incident: Incident }) {
  return (
    <Link
      to="/incidents/$id"
      params={{ id: incident.id }}
      className="grid grid-cols-1 gap-2 rounded-lg px-3 py-3 transition-[background-color,box-shadow] duration-150 hover:bg-elevated sm:grid-cols-[6.5rem_1fr_auto] sm:items-center sm:gap-4"
    >
      <time dateTime={incident.occurredOn} className="tabular-nums text-xs text-subtle">
        {formatDate(incident.occurredOn)}
      </time>
      <div className="min-w-0">
        <p className="truncate font-medium text-fg">{incident.title}</p>
        <p className="truncate text-sm text-muted">
          {incident.city}, {incident.country}
          <span className="text-subtle"> · {typeLabel(incident.incidentType)}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        {incident.fatalities > 0 ? (
          <span className="tabular-nums text-sm text-muted">
            {formatCompact(incident.fatalities)} killed
          </span>
        ) : incident.structuresDamaged > 1 ? (
          <span className="tabular-nums text-sm text-muted">
            {formatCompact(incident.structuresDamaged)} sites
          </span>
        ) : (
          <span className="text-sm text-subtle">No deaths recorded</span>
        )}
        <SeverityBadge severity={incident.severity} />
      </div>
    </Link>
  );
}
