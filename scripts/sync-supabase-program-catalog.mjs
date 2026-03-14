import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const seedDbPath = path.join(rootDir, "server", "data", "seed-db.json");
const seedDb = JSON.parse(await fs.readFile(seedDbPath, "utf8"));

async function upsert(table, rows, onConflict) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${table} upsert failed: ${text || response.status}`);
  }
}

const sourceDocuments = seedDb.subsidy_source_document.map((item) => ({
  id: item.id,
  title: item.title,
  issuer: item.issuer,
  base_date: item["기준일"],
  published_at: item.publishedAt,
  file_name: item.fileName,
  priority: item.priority,
}));

const programs = seedDb.subsidy_program.map((item) => ({
  id: item.id,
  legacy_id: item.legacyId,
  name: item.name,
  sub_name: item.subName ?? null,
  category: item.category,
  summary: item.summary,
  amount_label: item.amountLabel,
  duration: item.duration,
  application_cycle: item.applicationCycle,
  tags: item.tags,
  highlight: item.highlight ?? false,
  base_amount: item.baseAmount,
  source_document_ids: item.sourceDocumentIds,
  latest_source_document_id: item.latestSourceDocumentId,
  override_amount_label: item.overrideAmountLabel ?? null,
  override_summary: item.overrideSummary ?? null,
  published: item.published,
}));

const rules = seedDb.subsidy_rule.map((item) => ({
  id: item.id,
  program_id: item.programId,
  requirements: item.requirements,
  exclusions: item.exclusions,
  notes: item.notes,
  follow_up_question_ids: item.followUpQuestionIds,
}));

const exclusions = seedDb.subsidy_exclusion.map((item) => ({
  id: item.id,
  program_id: item.programId,
  text: item.text,
}));

await upsert("subsidy_source_documents", sourceDocuments, "id");
await upsert("subsidy_programs", programs, "id");
await upsert("subsidy_rules", rules, "id");
await upsert("subsidy_exclusions", exclusions, "id");

console.log(
  JSON.stringify(
    {
      synced: true,
      sourceDocuments: sourceDocuments.length,
      programs: programs.length,
      rules: rules.length,
      exclusions: exclusions.length,
    },
    null,
    2,
  ),
);
