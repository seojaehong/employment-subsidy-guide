create table if not exists subsidy_source_documents (
  id text primary key,
  title text not null,
  issuer text not null,
  base_date text not null,
  published_at timestamptz not null,
  file_name text not null,
  priority integer not null default 0
);

create table if not exists subsidy_programs (
  id text primary key,
  legacy_id text not null unique,
  name text not null,
  sub_name text,
  category text not null,
  summary text not null,
  amount_label text not null,
  duration text not null,
  application_cycle text not null,
  tags jsonb not null default '[]'::jsonb,
  highlight boolean not null default false,
  base_amount jsonb not null default '{}'::jsonb,
  source_document_ids jsonb not null default '[]'::jsonb,
  latest_source_document_id text not null references subsidy_source_documents(id),
  override_amount_label text,
  override_summary text,
  published boolean not null default false
);

create table if not exists subsidy_rules (
  id text primary key,
  program_id text not null references subsidy_programs(legacy_id) on delete cascade,
  requirements jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  follow_up_question_ids jsonb not null default '[]'::jsonb
);

create table if not exists subsidy_exclusions (
  id text primary key,
  program_id text not null references subsidy_programs(legacy_id) on delete cascade,
  text text not null
);

create index if not exists idx_subsidy_programs_published
  on subsidy_programs(published);

create index if not exists idx_subsidy_programs_category
  on subsidy_programs(category);

create index if not exists idx_subsidy_rules_program_id
  on subsidy_rules(program_id);

create index if not exists idx_subsidy_exclusions_program_id
  on subsidy_exclusions(program_id);
