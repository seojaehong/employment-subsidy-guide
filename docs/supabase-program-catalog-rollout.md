# Supabase Program Catalog Rollout

## 1. Run SQL
Open Supabase `SQL Editor` and run:

- `supabase/002_program_catalog.sql`

This creates:

- `subsidy_source_documents`
- `subsidy_programs`
- `subsidy_rules`
- `subsidy_exclusions`

## 2. Sync seed data
From the repo root, run:

```powershell
$env:SUPABASE_URL=[Environment]::GetEnvironmentVariable('SUPABASE_URL','User')
$env:SUPABASE_SERVICE_ROLE_KEY=[Environment]::GetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY','User')
node scripts\sync-supabase-program-catalog.mjs
```

Expected result:

```json
{
  "synced": true
}
```

## 3. Verify APIs
Check:

- `GET /api/programs`
- `GET /api/programs/{legacyId}`

If Supabase tables are not ready or fetch fails, the API falls back to `server/data/seed-db.json`.

## 4. Next step
After catalog sync is stable, move admin-side update flow to:

- source document versioning
- override publishing
- program hide/show controls
