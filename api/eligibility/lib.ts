import { ensureDefaultPublishedEligibilityArtifacts } from "../admin-lib.js";
import { supabaseDelete, supabaseInsert, supabasePatch, supabaseSelect } from "../supabase-rest.js";
import { determinePrograms as determineProgramsFallback, recommendProgramIds as recommendProgramIdsFallback } from "./engine.js";
import {
  getEligibilityConfig as getLocalEligibilityConfig,
  getProgramFollowUpQuestions as getLocalProgramFollowUpQuestions,
  type BaseEligibilityAnswers,
  type DeterminationResult,
  type EligibilityQuestionRecord,
  type FollowUpAnswers,
  type RecommendationRecord,
} from "./types.js";

declare global {
  var __employmentEligibilitySessions: Map<string, StoredSession> | undefined;
}

interface StoredSession {
  id: string;
  createdAt: string;
  baseAnswers: BaseEligibilityAnswers;
  recommendations: RecommendationRecord[];
  followUpAnswers: FollowUpAnswers;
  determinations: DeterminationResult[];
}

interface SessionRow {
  id: string;
  created_at: string;
  company_size: string;
  workforce_range: string;
  location_type: string;
  situations: string[];
  recommendations: RecommendationRecord[];
  follow_up_answers: FollowUpAnswers;
}

interface DeterminationRow {
  id: string;
  created_at: string;
  session_id: string;
  program_id: string;
  status: string;
  summary: string;
  rationale: string[];
  missing_items: string[];
  next_actions: string[];
  can_generate_draft: boolean;
}

interface QuestionRow {
  id: string;
  document_version_id: string | null;
  question_id: string;
  scope: "common" | "program";
  program_id: string | null;
  prompt: string;
  helper: string | null;
  type: "single" | "multi";
  options: Array<{ value: string; label: string; description?: string }>;
  published: boolean;
  draft_status: "draft" | "in_review" | "published";
}

interface RuleRow {
  id: string;
  document_version_id: string | null;
  target_program_id: string;
  rule_type: "recommendation" | "determination";
  input_key: string;
  operator: "equals" | "not_equals" | "includes" | "not_includes";
  expected_value: string;
  effect_status: DeterminationResult["status"] | null;
  effect_summary: string | null;
  effect_missing_item: string | null;
  effect_rationale: string | null;
  effect_next_action: string | null;
  effect_reason: string | null;
  effect_match_score: number | null;
  priority: number;
  published: boolean;
  draft_status: "draft" | "in_review" | "published";
}

function getRuntimeStore() {
  if (!globalThis.__employmentEligibilitySessions) {
    globalThis.__employmentEligibilitySessions = new Map<string, StoredSession>();
  }
  return globalThis.__employmentEligibilitySessions;
}

function mapSessionRow(row: SessionRow): StoredSession {
  return {
    id: row.id,
    createdAt: row.created_at,
    baseAnswers: {
      companySize: row.company_size as BaseEligibilityAnswers["companySize"],
      workforceRange: row.workforce_range as BaseEligibilityAnswers["workforceRange"],
      locationType: row.location_type as BaseEligibilityAnswers["locationType"],
      situations: row.situations as BaseEligibilityAnswers["situations"],
    },
    recommendations: row.recommendations ?? [],
    followUpAnswers: row.follow_up_answers ?? {},
    determinations: [],
  };
}

function mapDeterminationRow(row: DeterminationRow): DeterminationResult {
  return {
    programId: row.program_id,
    status: row.status as DeterminationResult["status"],
    summary: row.summary,
    rationale: row.rationale ?? [],
    missingItems: row.missing_items ?? [],
    nextActions: row.next_actions ?? [],
    canGenerateDraft: row.can_generate_draft,
  };
}

function mapQuestionRow(row: QuestionRow): EligibilityQuestionRecord {
  return {
    id: row.question_id,
    scope: row.scope,
    programId: row.program_id ?? undefined,
    prompt: row.prompt,
    helper: row.helper ?? undefined,
    type: row.type,
    options: row.options ?? [],
  };
}

function isSupabaseConfigured() {
  return process.env.SUPABASE_URL !== "" && process.env.SUPABASE_SERVICE_ROLE_KEY !== "";
}

function getProgramFollowUpQuestionsFromList(
  questions: EligibilityQuestionRecord[],
  recommendations: RecommendationRecord[],
) {
  const programIds = new Set(recommendations.map((recommendation) => recommendation.programId));
  return questions.filter((question) => question.scope === "program" && question.programId && programIds.has(question.programId));
}

function getInputValue(baseAnswers: BaseEligibilityAnswers, followUpAnswers: FollowUpAnswers, key: string) {
  if (key === "companySize") return baseAnswers.companySize;
  if (key === "workforceRange") return baseAnswers.workforceRange;
  if (key === "locationType") return baseAnswers.locationType;
  if (key === "situations") return baseAnswers.situations;
  return followUpAnswers[key];
}

function matchesRule(value: string | string[] | undefined, operator: RuleRow["operator"], expectedValue: string) {
  if (Array.isArray(value)) {
    if (operator === "includes") return value.includes(expectedValue);
    if (operator === "not_includes") return !value.includes(expectedValue);
    return false;
  }

  if (operator === "equals") return String(value ?? "") === expectedValue;
  if (operator === "not_equals") return String(value ?? "") !== expectedValue;
  if (operator === "includes") return false;
  if (operator === "not_includes") return true;
  return false;
}

function getStatusWeight(status: DeterminationResult["status"]) {
  switch (status) {
    case "ineligible":
      return 4;
    case "manual_review":
      return 3;
    case "needs_followup":
      return 2;
    case "eligible":
    default:
      return 1;
  }
}

async function getPublishedQuestions() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  await ensureDefaultPublishedEligibilityArtifacts();
  const rows = await supabaseSelect<QuestionRow[]>(
    "subsidy_question_sets",
    "?select=*&published=eq.true&order=scope.asc,question_id.asc",
  );
  return rows.map(mapQuestionRow);
}

async function getPublishedRules() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  await ensureDefaultPublishedEligibilityArtifacts();
  return supabaseSelect<RuleRow[]>(
    "eligibility_rule_definitions",
    "?select=*&published=eq.true&order=priority.asc",
  );
}

async function getEligibilityArtifacts() {
  try {
    const [questions, rules] = await Promise.all([getPublishedQuestions(), getPublishedRules()]);
    if (questions && questions.length > 0 && rules && rules.length > 0) {
      return { questions, rules, source: "supabase" as const };
    }
  } catch {
    // fall back below
  }

  const localQuestions = getLocalEligibilityConfig().commonQuestions.concat(getLocalProgramFollowUpQuestions());
  return { questions: localQuestions, rules: [] as RuleRow[], source: "fallback" as const };
}

async function recommendProgramIds(baseAnswers: BaseEligibilityAnswers) {
  const artifacts = await getEligibilityArtifacts();
  const recommendationRules = artifacts.rules.filter((rule) => rule.rule_type === "recommendation");
  if (recommendationRules.length === 0) {
    return {
      recommendations: recommendProgramIdsFallback(baseAnswers),
      questions: artifacts.questions,
      source: "fallback" as const,
    };
  }

  const recommendations = recommendationRules
    .filter((rule) => matchesRule(getInputValue(baseAnswers, {}, rule.input_key), rule.operator, rule.expected_value))
    .map((rule) => ({
      programId: rule.target_program_id,
      reason: rule.effect_reason ?? "DB 규칙 추천 결과입니다.",
      matchScore: rule.effect_match_score ?? Math.max(50, 100 - rule.priority),
      priority: rule.priority,
    }))
    .sort((a, b) => a.priority - b.priority || b.matchScore - a.matchScore);

  const deduped = Array.from(
    new Map(recommendations.map((recommendation) => [recommendation.programId, recommendation])).values(),
  ).map(({ priority: _priority, ...recommendation }) => recommendation);

  return {
    recommendations: deduped.length > 0 ? deduped : recommendProgramIdsFallback(baseAnswers),
    questions: artifacts.questions,
    source: deduped.length > 0 ? "supabase" as const : "fallback" as const,
  };
}

async function determineProgramsWithRules(
  programIds: string[],
  baseAnswers: BaseEligibilityAnswers,
  followUpAnswers: FollowUpAnswers,
) {
  const artifacts = await getEligibilityArtifacts();
  const determinationRules = artifacts.rules.filter((rule) => rule.rule_type === "determination");

  const results = programIds.map((programId) => {
    const programRules = determinationRules.filter((rule) => rule.target_program_id === programId);
    if (programRules.length === 0) {
      return determineProgramsFallback([programId], baseAnswers, followUpAnswers)[0];
    }

    const matched = programRules
      .filter((rule) =>
        matchesRule(getInputValue(baseAnswers, followUpAnswers, rule.input_key), rule.operator, rule.expected_value),
      )
      .sort((a, b) => a.priority - b.priority);

    let status: DeterminationResult["status"] = "eligible";
    let summary = "핵심 요건 기준으로 신청 가능성이 있습니다.";
    const rationale: string[] = [];
    const missingItems: string[] = [];
    const nextActions: string[] = [];

    for (const rule of matched) {
      if (rule.effect_status && getStatusWeight(rule.effect_status) >= getStatusWeight(status)) {
        status = rule.effect_status;
      }
      if (rule.effect_summary && getStatusWeight(rule.effect_status ?? status) >= getStatusWeight(status)) {
        summary = rule.effect_summary;
      }
      if (rule.effect_rationale) rationale.push(rule.effect_rationale);
      if (rule.effect_missing_item) missingItems.push(rule.effect_missing_item);
      if (rule.effect_next_action) nextActions.push(rule.effect_next_action);
    }

    if (matched.length === 0) {
      return determineProgramsFallback([programId], baseAnswers, followUpAnswers)[0];
    }

    return {
      programId,
      status,
      summary,
      rationale: Array.from(new Set(rationale.length > 0 ? rationale : ["DB 규칙 기반 판정 결과입니다."])),
      missingItems: Array.from(new Set(missingItems)),
      nextActions: Array.from(new Set(nextActions.length > 0 ? nextActions : ["전문가 상담으로 세부 요건을 점검하세요."])),
      canGenerateDraft: status === "eligible" || status === "needs_followup",
    } satisfies DeterminationResult;
  });

  return {
    reports: results,
    questions: artifacts.questions,
  };
}

export async function getEligibilityQuestions(): Promise<EligibilityQuestionRecord[]> {
  const artifacts = await getEligibilityArtifacts();
  return artifacts.questions;
}

export async function getEligibilityRuntimeConfig() {
  const questions = await getEligibilityQuestions();
  return {
    config: {
      commonQuestions: questions.filter((question) => question.scope === "common"),
      priorityProgramIds: Array.from(new Set(questions.flatMap((question) => (question.programId ? [question.programId] : [])))),
    },
    questions,
  };
}

export async function createEligibilitySessionRecord(baseAnswers: BaseEligibilityAnswers) {
  const recommendationPayload = await recommendProgramIds(baseAnswers);
  const followUpQuestions = getProgramFollowUpQuestionsFromList(
    recommendationPayload.questions,
    recommendationPayload.recommendations,
  );

  if (isSupabaseConfigured()) {
    const rows = await supabaseInsert<SessionRow[]>("eligibility_sessions", {
      company_size: baseAnswers.companySize,
      workforce_range: baseAnswers.workforceRange,
      location_type: baseAnswers.locationType,
      situations: baseAnswers.situations,
      recommendations: recommendationPayload.recommendations,
      follow_up_answers: {},
    });

    return {
      session: mapSessionRow(rows[0]),
      followUpQuestions,
      storage: "supabase" as const,
      source: recommendationPayload.source,
    };
  }

  const session: StoredSession = {
    id: `session_${Date.now()}`,
    createdAt: new Date().toISOString(),
    baseAnswers,
    recommendations: recommendationPayload.recommendations,
    followUpAnswers: {},
    determinations: [],
  };
  getRuntimeStore().set(session.id, session);
  return {
    session,
    followUpQuestions,
    storage: "memory" as const,
    source: recommendationPayload.source,
  };
}

export async function determineEligibilitySessionRecord(sessionId: string, followUpAnswers: FollowUpAnswers) {
  if (isSupabaseConfigured()) {
    const sessionRows = await supabaseSelect<SessionRow[]>(
      "eligibility_sessions",
      `?select=*&id=eq.${encodeURIComponent(sessionId)}`,
    );
    const row = sessionRows[0];
    if (!row) return null;

    const session = mapSessionRow(row);
    const evaluated = await determineProgramsWithRules(
      session.recommendations.map((recommendation) => recommendation.programId),
      session.baseAnswers,
      followUpAnswers,
    );

    await supabasePatch(
      "eligibility_sessions",
      `?id=eq.${encodeURIComponent(sessionId)}`,
      { follow_up_answers: followUpAnswers },
      "return=minimal",
    );
    await supabaseDelete("eligibility_determinations", `?session_id=eq.${encodeURIComponent(sessionId)}`);
    await supabaseInsert(
      "eligibility_determinations",
      evaluated.reports.map((determination) => ({
        session_id: sessionId,
        program_id: determination.programId,
        status: determination.status,
        summary: determination.summary,
        rationale: determination.rationale,
        missing_items: determination.missingItems,
        next_actions: determination.nextActions,
        can_generate_draft: determination.canGenerateDraft,
      })),
    );

    return {
      session: {
        ...session,
        followUpAnswers,
        determinations: evaluated.reports,
      },
      reports: evaluated.reports,
      storage: "supabase" as const,
    };
  }

  const session = getRuntimeStore().get(sessionId);
  if (!session) return null;
  const evaluated = await determineProgramsWithRules(
    session.recommendations.map((recommendation) => recommendation.programId),
    session.baseAnswers,
    followUpAnswers,
  );
  const updated = { ...session, followUpAnswers, determinations: evaluated.reports };
  getRuntimeStore().set(sessionId, updated);
  return {
    session: updated,
    reports: evaluated.reports,
    storage: "memory" as const,
  };
}

export async function getEligibilitySessionRecord(sessionId: string) {
  if (isSupabaseConfigured()) {
    const [sessionRows, reportRows] = await Promise.all([
      supabaseSelect<SessionRow[]>("eligibility_sessions", `?select=*&id=eq.${encodeURIComponent(sessionId)}`),
      supabaseSelect<DeterminationRow[]>(
        "eligibility_determinations",
        `?select=*&session_id=eq.${encodeURIComponent(sessionId)}`,
      ),
    ]);
    const row = sessionRows[0];
    if (!row) return null;
    const reports = reportRows.map(mapDeterminationRow);
    return {
      session: { ...mapSessionRow(row), determinations: reports },
      reports,
      storage: "supabase" as const,
    };
  }

  const session = getRuntimeStore().get(sessionId);
  if (!session) return null;
  return { session, reports: session.determinations, storage: "memory" as const };
}
