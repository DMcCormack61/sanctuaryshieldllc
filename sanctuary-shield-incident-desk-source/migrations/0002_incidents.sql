create table if not exists incidents (
  id text primary key,
  title text not null,
  site_name text not null,
  occurred_on date not null,
  country text not null,
  country_code text not null,
  city text not null,
  region text not null,
  latitude double precision not null,
  longitude double precision not null,
  incident_type text not null,
  severity text not null,
  fatalities integer not null default 0,
  injured integer not null default 0,
  structures_damaged integer not null default 0,
  denomination text,
  summary text not null,
  context text,
  source_name text not null,
  source_url text,
  scope text not null default 'single',
  verified boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists incidents_occurred_on_idx on incidents (occurred_on desc);
create index if not exists incidents_region_idx on incidents (region);
create index if not exists incidents_type_idx on incidents (incident_type);
create index if not exists incidents_country_idx on incidents (country);

create table if not exists watchlist (
  user_id text not null,
  incident_id text not null references incidents (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, incident_id)
);

create table if not exists analyst_notes (
  user_id text not null,
  incident_id text not null references incidents (id) on delete cascade,
  body text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, incident_id)
);
