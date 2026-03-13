create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null unique,
  role text not null check (role in ('editor', 'publisher')),
  created_at timestamptz not null default now()
);

create table if not exists subsidy_document_versions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  issuer text not null,
  base_date text not null,
  file_name text not null,
  status text not null default 'draft' check (status in ('draft', 'review', 'published')),
  source_document_id text not null,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subsidy_program_drafts (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references subsidy_document_versions(id) on delete cascade,
  legacy_id text not null,
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
  requirements jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  follow_up_question_ids jsonb not null default '[]'::jsonb,
  source_document_ids jsonb not null default '[]'::jsonb,
  latest_source_document_id text not null,
  draft_status text not null default 'draft' check (draft_status in ('draft', 'in_review', 'published')),
  unique(document_version_id, legacy_id)
);

create table if not exists subsidy_rule_drafts (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references subsidy_document_versions(id) on delete cascade,
  program_id text not null,
  requirements jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  follow_up_question_ids jsonb not null default '[]'::jsonb,
  draft_status text not null default 'draft' check (draft_status in ('draft', 'in_review', 'published')),
  unique(document_version_id, program_id)
);

create table if not exists subsidy_question_sets (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid references subsidy_document_versions(id) on delete cascade,
  question_id text not null,
  scope text not null check (scope in ('common', 'program')),
  program_id text,
  prompt text not null,
  helper text,
  type text not null check (type in ('single', 'multi')),
  options jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  draft_status text not null default 'draft' check (draft_status in ('draft', 'in_review', 'published')),
  unique(document_version_id, question_id, coalesce(program_id, 'common'))
);

create table if not exists eligibility_rule_definitions (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid references subsidy_document_versions(id) on delete cascade,
  target_program_id text not null,
  rule_type text not null check (rule_type in ('recommendation', 'determination')),
  input_key text not null,
  operator text not null check (operator in ('equals', 'not_equals', 'includes', 'not_includes')),
  expected_value text not null,
  effect_status text check (effect_status in ('eligible', 'needs_followup', 'ineligible', 'manual_review')),
  effect_summary text,
  effect_missing_item text,
  effect_rationale text,
  effect_next_action text,
  effect_reason text,
  effect_match_score integer,
  priority integer not null default 100,
  published boolean not null default false,
  draft_status text not null default 'draft' check (draft_status in ('draft', 'in_review', 'published'))
);

create table if not exists subsidy_publish_events (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references subsidy_document_versions(id) on delete cascade,
  author_email text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists subsidy_overrides (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid references subsidy_document_versions(id) on delete set null,
  target_type text not null,
  target_id text not null,
  field_name text not null,
  value text not null,
  reason text not null,
  author_email text not null,
  effective_from timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_subsidy_document_versions_status
  on subsidy_document_versions(status);

create index if not exists idx_subsidy_program_drafts_document
  on subsidy_program_drafts(document_version_id);

create index if not exists idx_subsidy_rule_drafts_document
  on subsidy_rule_drafts(document_version_id);

create index if not exists idx_subsidy_question_sets_document
  on subsidy_question_sets(document_version_id);

create index if not exists idx_subsidy_question_sets_published
  on subsidy_question_sets(published);

create index if not exists idx_eligibility_rule_definitions_program
  on eligibility_rule_definitions(target_program_id);

create index if not exists idx_eligibility_rule_definitions_published
  on eligibility_rule_definitions(published);
