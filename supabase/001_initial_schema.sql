create extension if not exists pgcrypto;

create table if not exists eligibility_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_size text not null,
  workforce_range text not null,
  location_type text not null,
  situations jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  follow_up_answers jsonb not null default '{}'::jsonb
);

create table if not exists eligibility_determinations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null references eligibility_sessions(id) on delete cascade,
  program_id text not null,
  status text not null,
  summary text not null,
  rationale jsonb not null default '[]'::jsonb,
  missing_items jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  can_generate_draft boolean not null default false
);

create table if not exists consultation_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  company text,
  consult_type text not null,
  message text,
  subsidy_name text,
  session_id uuid references eligibility_sessions(id) on delete set null,
  interested_program_ids jsonb not null default '[]'::jsonb,
  determination_statuses jsonb not null default '{}'::jsonb,
  missing_items jsonb not null default '[]'::jsonb
);

create index if not exists idx_eligibility_determinations_session_id
  on eligibility_determinations(session_id);

create index if not exists idx_consultation_leads_session_id
  on consultation_leads(session_id);

create index if not exists idx_consultation_leads_created_at
  on consultation_leads(created_at desc);
