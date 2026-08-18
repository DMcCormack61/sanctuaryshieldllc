export const REGIONS = [
  "Sub-Saharan Africa",
  "Middle East & North Africa",
  "South Asia",
  "East & Southeast Asia",
  "Europe",
  "North America",
  "Latin America",
  "Oceania",
] as const;

export const INCIDENT_TYPES = [
  "shooting",
  "bombing",
  "arson",
  "raid",
  "vandalism",
  "stabbing",
  "siege",
  "demolition",
  "shelling",
] as const;

export const SEVERITIES = ["critical", "high", "moderate", "low"] as const;

export type Region = (typeof REGIONS)[number];
export type IncidentType = (typeof INCIDENT_TYPES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type IncidentScope = "single" | "campaign";

export type Incident = {
  id: string;
  title: string;
  siteName: string;
  occurredOn: string;
  country: string;
  countryCode: string;
  city: string;
  region: Region;
  latitude: number;
  longitude: number;
  incidentType: IncidentType;
  severity: Severity;
  fatalities: number;
  injured: number;
  structuresDamaged: number;
  denomination: string | null;
  summary: string;
  context: string | null;
  sourceName: string;
  sourceUrl: string | null;
  scope: IncidentScope;
  verified: boolean;
};

export type IncidentRow = {
  id: string;
  title: string;
  site_name: string;
  occurred_on: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  incident_type: string;
  severity: string;
  fatalities: number;
  injured: number;
  structures_damaged: number;
  denomination: string | null;
  summary: string;
  context: string | null;
  source_name: string;
  source_url: string | null;
  scope: string;
  verified: boolean;
};

export type IncidentFilters = {
  q?: string;
  region?: string;
  type?: string;
  severity?: string;
  year?: string;
  country?: string;
};

export const WWL_2026 = {
  source: "Open Doors World Watch List 2026",
  killed: 4849,
  detained: 4712,
  churchesAttacked: 3632,
  facingPersecutionMillions: 388,
  nigeriaShareKilled: 3490,
};

export function mapIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    title: row.title,
    siteName: row.site_name,
    occurredOn: row.occurred_on,
    country: row.country,
    countryCode: row.country_code,
    city: row.city,
    region: row.region as Region,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    incidentType: row.incident_type as IncidentType,
    severity: row.severity as Severity,
    fatalities: Number(row.fatalities),
    injured: Number(row.injured),
    structuresDamaged: Number(row.structures_damaged),
    denomination: row.denomination,
    summary: row.summary,
    context: row.context,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    scope: row.scope === "campaign" ? "campaign" : "single",
    verified: Boolean(row.verified),
  };
}

export function typeLabel(type: string): string {
  return type.replace(/^\w/, (c) => c.toUpperCase());
}

export function severityLabel(severity: string): string {
  return severity.replace(/^\w/, (c) => c.toUpperCase());
}
