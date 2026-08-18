import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  mapIncident,
  type Incident,
  type IncidentFilters,
  type IncidentRow,
} from "@/lib/incidents";
import { INCIDENT_SEED } from "@/lib/incidents-seed";

async function seedIfEmpty(): Promise<void> {
  const sql = await getSql();
  const counts = await sql<{ n: number }>`select count(*)::int as n from incidents`;
  if ((counts[0]?.n ?? 0) > 0) return;

  for (const inc of INCIDENT_SEED) {
    await sql`
      insert into incidents (
        id, title, site_name, occurred_on, country, country_code, city, region,
        latitude, longitude, incident_type, severity, fatalities, injured,
        structures_damaged, denomination, summary, context, source_name,
        source_url, scope, verified
      ) values (
        ${inc.id}, ${inc.title}, ${inc.siteName}, ${inc.occurredOn}::date,
        ${inc.country}, ${inc.countryCode}, ${inc.city}, ${inc.region},
        ${inc.latitude}, ${inc.longitude}, ${inc.incidentType}, ${inc.severity},
        ${inc.fatalities}, ${inc.injured}, ${inc.structuresDamaged},
        ${inc.denomination}, ${inc.summary}, ${inc.context}, ${inc.sourceName},
        ${inc.sourceUrl}, ${inc.scope}, true
      )
      on conflict (id) do nothing
    `;
  }
}

export type MapPoint = {
  id: string;
  title: string;
  city: string;
  country: string;
  occurredOn: string;
  incidentType: string;
  severity: string;
  fatalities: number;
  latitude: number;
  longitude: number;
};

export type RegionStat = { region: string; incidents: number; fatalities: number };
export type TypeStat = { type: string; incidents: number };
export type YearStat = { year: number; incidents: number; fatalities: number };
export type CountryStat = {
  country: string;
  countryCode: string;
  incidents: number;
  fatalities: number;
};

export type DashboardData = {
  totals: {
    incidents: number;
    fatalities: number;
    injured: number;
    countries: number;
    last12Months: number;
    structures: number;
  };
  recent: Incident[];
  mapPoints: MapPoint[];
  byRegion: RegionStat[];
  byType: TypeStat[];
  byYear: YearStat[];
  byCountry: CountryStat[];
};

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardData> => {
    await seedIfEmpty();
    const sql = await getSql();

    const [totals] = await sql<{
      incidents: number;
      fatalities: number;
      injured: number;
      countries: number;
      last12: number;
      structures: number;
    }>`
      select
        count(*)::int as incidents,
        coalesce(sum(fatalities), 0)::int as fatalities,
        coalesce(sum(injured), 0)::int as injured,
        count(distinct country)::int as countries,
        count(*) filter (where occurred_on >= date '2025-01-01')::int as last12,
        coalesce(sum(structures_damaged), 0)::int as structures
      from incidents
    `;

    const recent = await sql<IncidentRow>`
      select id, title, site_name, occurred_on, country, country_code, city, region,
        latitude, longitude, incident_type, severity, fatalities, injured,
        structures_damaged, denomination, summary, context, source_name,
        source_url, scope, verified
      from incidents
      order by occurred_on desc
      limit 8
    `;

    const points = await sql<MapPoint>`
      select id, title, city, country, occurred_on as "occurredOn",
        incident_type as "incidentType", severity, fatalities,
        latitude, longitude
      from incidents
      order by occurred_on desc
    `;

    const byRegion = await sql<RegionStat>`
      select region, count(*)::int as incidents, coalesce(sum(fatalities), 0)::int as fatalities
      from incidents
      group by region
      order by incidents desc
    `;

    const byType = await sql<TypeStat>`
      select incident_type as type, count(*)::int as incidents
      from incidents
      group by incident_type
      order by incidents desc
    `;

    const byYear = await sql<YearStat>`
      select extract(year from occurred_on)::int as year,
        count(*)::int as incidents,
        coalesce(sum(fatalities), 0)::int as fatalities
      from incidents
      group by 1
      order by 1
    `;

    const byCountry = await sql<CountryStat>`
      select country, country_code as "countryCode",
        count(*)::int as incidents,
        coalesce(sum(fatalities), 0)::int as fatalities
      from incidents
      group by country, country_code
      order by fatalities desc, incidents desc
    `;

    return {
      totals: {
        incidents: totals?.incidents ?? 0,
        fatalities: totals?.fatalities ?? 0,
        injured: totals?.injured ?? 0,
        countries: totals?.countries ?? 0,
        last12Months: totals?.last12 ?? 0,
        structures: totals?.structures ?? 0,
      },
      recent: recent.map(mapIncident),
      mapPoints: points.map((p) => ({
        ...p,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        fatalities: Number(p.fatalities),
      })),
      byRegion,
      byType,
      byYear,
      byCountry,
    };
  },
);

export const listIncidents = createServerFn({ method: "GET" })
  .validator((input: IncidentFilters) => input)
  .handler(async ({ data }): Promise<Incident[]> => {
    await seedIfEmpty();
    const sql = await getSql();
    const q = data.q?.trim().toLowerCase() ?? "";
    const region = data.region || "";
    const type = data.type || "";
    const severity = data.severity || "";
    const year = data.year || "";
    const country = data.country || "";

    const rows = await sql<IncidentRow>`
      select id, title, site_name, occurred_on, country, country_code, city, region,
        latitude, longitude, incident_type, severity, fatalities, injured,
        structures_damaged, denomination, summary, context, source_name,
        source_url, scope, verified
      from incidents
      where
        (${q} = '' or lower(title) like ${"%" + q + "%"}
          or lower(city) like ${"%" + q + "%"}
          or lower(country) like ${"%" + q + "%"}
          or lower(site_name) like ${"%" + q + "%"}
          or lower(summary) like ${"%" + q + "%"})
        and (${region} = '' or region = ${region})
        and (${type} = '' or incident_type = ${type})
        and (${severity} = '' or severity = ${severity})
        and (${year} = '' or extract(year from occurred_on)::text = ${year})
        and (${country} = '' or country = ${country})
      order by occurred_on desc
    `;
    return rows.map(mapIncident);
  });

export const getIncident = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<Incident | null> => {
    await seedIfEmpty();
    const sql = await getSql();
    const rows = await sql<IncidentRow>`
      select id, title, site_name, occurred_on, country, country_code, city, region,
        latitude, longitude, incident_type, severity, fatalities, injured,
        structures_damaged, denomination, summary, context, source_name,
        source_url, scope, verified
      from incidents
      where id = ${id}
      limit 1
    `;
    return rows[0] ? mapIncident(rows[0]) : null;
  });

export const listYears = createServerFn({ method: "GET" }).handler(
  async (): Promise<number[]> => {
    await seedIfEmpty();
    const sql = await getSql();
    const rows = await sql<{ year: number }>`
      select distinct extract(year from occurred_on)::int as year
      from incidents
      order by year desc
    `;
    return rows.map((r) => r.year);
  },
);

export const listCountries = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    await seedIfEmpty();
    const sql = await getSql();
    const rows = await sql<{ country: string }>`
      select distinct country from incidents order by country
    `;
    return rows.map((r) => r.country);
  },
);

export const getWatchIds = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<string[]> => {
    const sql = await getSql();
    const rows = await sql<{ incident_id: string }>`
      select incident_id from watchlist where user_id = ${context.userId}
    `;
    return rows.map((r) => r.incident_id);
  });

export const toggleWatch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((incidentId: string) => incidentId)
  .handler(async ({ context, data: incidentId }): Promise<{ watching: boolean }> => {
    const sql = await getSql();
    const existing = await sql<{ incident_id: string }>`
      select incident_id from watchlist
      where user_id = ${context.userId} and incident_id = ${incidentId}
    `;
    if (existing.length > 0) {
      await sql`
        delete from watchlist
        where user_id = ${context.userId} and incident_id = ${incidentId}
      `;
      return { watching: false };
    }
    await sql`
      insert into watchlist (user_id, incident_id)
      values (${context.userId}, ${incidentId})
    `;
    return { watching: true };
  });

export const getWatchlist = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Incident[]> => {
    await seedIfEmpty();
    const sql = await getSql();
    const rows = await sql<IncidentRow>`
      select i.id, i.title, i.site_name, i.occurred_on, i.country, i.country_code,
        i.city, i.region, i.latitude, i.longitude, i.incident_type, i.severity,
        i.fatalities, i.injured, i.structures_damaged, i.denomination, i.summary,
        i.context, i.source_name, i.source_url, i.scope, i.verified
      from watchlist w
      join incidents i on i.id = w.incident_id
      where w.user_id = ${context.userId}
      order by w.created_at desc
    `;
    return rows.map(mapIncident);
  });

export const getNote = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((incidentId: string) => incidentId)
  .handler(async ({ context, data: incidentId }): Promise<string> => {
    const sql = await getSql();
    const rows = await sql<{ body: string }>`
      select body from analyst_notes
      where user_id = ${context.userId} and incident_id = ${incidentId}
    `;
    return rows[0]?.body ?? "";
  });

export const saveNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { incidentId: string; body: string }) => input)
  .handler(async ({ context, data }): Promise<void> => {
    const sql = await getSql();
    const body = data.body.trim();
    if (!body) {
      await sql`
        delete from analyst_notes
        where user_id = ${context.userId} and incident_id = ${data.incidentId}
      `;
      return;
    }
    await sql`
      insert into analyst_notes (user_id, incident_id, body, updated_at)
      values (${context.userId}, ${data.incidentId}, ${body}, now())
      on conflict (user_id, incident_id)
      do update set body = excluded.body, updated_at = now()
    `;
  });
