import { createRequire } from "node:module";
import type {
  OperationalProgram,
  SourceDocumentRecord,
  SubsidyExclusionRecord,
  SubsidyProgramRecord,
  SubsidyRuleRecord,
} from "../../shared/subsidy";

const require = createRequire(import.meta.url);
const seedDb = require("../data/seed-db.json") as {
  subsidy_program: SubsidyProgramRecord[];
  subsidy_rule: SubsidyRuleRecord[];
  subsidy_exclusion: SubsidyExclusionRecord[];
  subsidy_source_document: SourceDocumentRecord[];
};

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface ProgramRow {
  id: string;
  legacy_id: string;
  name: string;
  sub_name: string | null;
  category: SubsidyProgramRecord["category"];
  summary: string;
  amount_label: string;
  duration: string;
  application_cycle: string;
  tags: string[];
  highlight: boolean;
  base_amount: SubsidyProgramRecord["baseAmount"];
  source_document_ids: string[];
  latest_source_document_id: string;
  override_amount_label: string | null;
  override_summary: string | null;
  published: boolean;
}

interface RuleRow {
  id: string;
  program_id: string;
  requirements: string[];
  exclusions: string[];
  notes: string[];
  follow_up_question_ids: string[];
}

interface ExclusionRow {
  id: string;
  program_id: string;
  text: string;
}

interface SourceRow {
  id: string;
  title: string;
  issuer: string;
  base_date: string;
  published_at: string;
  file_name: string;
  priority: number;
}

interface OverrideRow {
  target_type: string;
  target_id: string;
  field_name: string;
  value: string;
  effective_from: string;
}

function isSupabaseConfigured() {
  return SUPABASE_URL !== "" && SUPABASE_SERVICE_ROLE_KEY !== "";
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
}

function buildSeedPrograms(): OperationalProgram[] {
  return seedDb.subsidy_program
    .filter((program) => program.published)
    .map((program) => ({
      program,
      rule: seedDb.subsidy_rule.find((rule) => rule.programId === program.legacyId)!,
      exclusions: seedDb.subsidy_exclusion.filter((entry) => entry.programId === program.legacyId),
      latestSource:
        seedDb.subsidy_source_document.find((source) => source.id === program.latestSourceDocumentId) ??
        seedDb.subsidy_source_document[0],
    }));
}

function mapProgramRow(row: ProgramRow): SubsidyProgramRecord {
  return {
    id: row.id,
    legacyId: row.legacy_id,
    name: row.name,
    subName: row.sub_name ?? undefined,
    category: row.category,
    summary: row.summary,
    amountLabel: row.amount_label,
    duration: row.duration,
    applicationCycle: row.application_cycle,
    tags: row.tags ?? [],
    highlight: row.highlight,
    baseAmount: row.base_amount ?? {},
    sourceDocumentIds: row.source_document_ids ?? [],
    latestSourceDocumentId: row.latest_source_document_id,
    overrideAmountLabel: row.override_amount_label ?? undefined,
    overrideSummary: row.override_summary ?? undefined,
    published: row.published,
  };
}

function mapRuleRow(row: RuleRow): SubsidyRuleRecord {
  return {
    id: row.id,
    programId: row.program_id,
    requirements: row.requirements ?? [],
    exclusions: row.exclusions ?? [],
    notes: row.notes ?? [],
    followUpQuestionIds: row.follow_up_question_ids ?? [],
  };
}

function mapExclusionRow(row: ExclusionRow): SubsidyExclusionRecord {
  return {
    id: row.id,
    programId: row.program_id,
    text: row.text,
  };
}

function mapSourceRow(row: SourceRow): SourceDocumentRecord {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    기준일: row.base_date,
    publishedAt: row.published_at,
    fileName: row.file_name,
    priority: row.priority,
  };
}

function buildOperationalPrograms(
  programs: SubsidyProgramRecord[],
  rules: SubsidyRuleRecord[],
  exclusions: SubsidyExclusionRecord[],
  sources: SourceDocumentRecord[],
) {
  return programs
    .filter((program) => program.published)
    .map((program) => ({
      program,
      rule: rules.find((rule) => rule.programId === program.legacyId)!,
      exclusions: exclusions.filter((entry) => entry.programId === program.legacyId),
      latestSource: sources.find((source) => source.id === program.latestSourceDocumentId) ?? sources[0],
    }))
    .filter((entry) => Boolean(entry.rule));
}

function parseOverrideValue(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function applyOverrides(
  programs: SubsidyProgramRecord[],
  rules: SubsidyRuleRecord[],
  overrides: OverrideRow[],
) {
  const now = Date.now();
  const activeOverrides = overrides.filter((override) => Date.parse(override.effective_from) <= now);

  const nextPrograms = programs.map((program) => {
    const matching = activeOverrides.filter(
      (override) => override.target_type === "program" && override.target_id === program.legacyId,
    );
    if (matching.length === 0) return program;
    const patched = { ...program } as SubsidyProgramRecord & Record<string, unknown>;
    for (const override of matching) {
      const key = override.field_name === "amountLabel" ? "overrideAmountLabel" : override.field_name === "summary" ? "overrideSummary" : override.field_name;
      patched[key] = parseOverrideValue(override.value);
    }
    return patched;
  });

  const nextRules = rules.map((rule) => {
    const matching = activeOverrides.filter(
      (override) => override.target_type === "rule" && override.target_id === rule.programId,
    );
    if (matching.length === 0) return rule;
    const patched = { ...rule } as SubsidyRuleRecord & Record<string, unknown>;
    for (const override of matching) {
      patched[override.field_name] = parseOverrideValue(override.value);
    }
    return patched;
  });

  return { programs: nextPrograms, rules: nextRules };
}

export async function fetchOperationalPrograms() {
  if (!isSupabaseConfigured()) {
    return { programs: buildSeedPrograms(), source: "seed" as const };
  }

  try {
    const [programsResponse, rulesResponse, exclusionsResponse, sourcesResponse, overridesResponse] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/subsidy_programs?select=*&published=eq.true&order=category.asc,name.asc`, { headers: getHeaders() }),
      fetch(`${SUPABASE_URL}/rest/v1/subsidy_rules?select=*`, { headers: getHeaders() }),
      fetch(`${SUPABASE_URL}/rest/v1/subsidy_exclusions?select=*`, { headers: getHeaders() }),
      fetch(`${SUPABASE_URL}/rest/v1/subsidy_source_documents?select=*`, { headers: getHeaders() }),
      fetch(`${SUPABASE_URL}/rest/v1/subsidy_overrides?select=*`, { headers: getHeaders() }),
    ]);

    const responses = [programsResponse, rulesResponse, exclusionsResponse, sourcesResponse, overridesResponse];
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(await response.text());
      }
    }

    const [programRows, ruleRows, exclusionRows, sourceRows, overrideRows] = await Promise.all([
      programsResponse.json() as Promise<ProgramRow[]>,
      rulesResponse.json() as Promise<RuleRow[]>,
      exclusionsResponse.json() as Promise<ExclusionRow[]>,
      sourcesResponse.json() as Promise<SourceRow[]>,
      overridesResponse.json() as Promise<OverrideRow[]>,
    ]);

    const mappedPrograms = programRows.map(mapProgramRow);
    const mappedRules = ruleRows.map(mapRuleRow);
    const patched = applyOverrides(mappedPrograms, mappedRules, overrideRows);

    return {
      programs: buildOperationalPrograms(
        patched.programs,
        patched.rules,
        exclusionRows.map(mapExclusionRow),
        sourceRows.map(mapSourceRow),
      ),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("fetchOperationalPrograms failed", error);
    return { programs: buildSeedPrograms(), source: "seed-fallback" as const };
  }
}

export async function fetchOperationalProgram(programId: string) {
  const payload = await fetchOperationalPrograms();
  return {
    program: payload.programs.find((entry) => entry.program.legacyId === programId) ?? null,
    source: payload.source,
  };
}
