import {
  determinePrograms,
  getEligibilityConfig,
  getProgramFollowUpQuestions,
  recommendProgramIds,
  type BaseEligibilityAnswers,
  type DeterminationResult,
  type EligibilityQuestionRecord,
  type FollowUpAnswers,
  type RecommendationRecord,
} from "../../shared/subsidy.ts";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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

function isSupabaseConfigured() {
  return SUPABASE_URL !== "" && SUPABASE_SERVICE_ROLE_KEY !== "";
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    Prefer: "return=representation",
  };
}

function getRuntimeStore() {
  if (!globalThis.__employmentEligibilitySessions) {
    globalThis.__employmentEligibilitySessions = new Map<string, StoredSession>();
  }
  return globalThis.__employmentEligibilitySessions;
}

function buildFollowUpQuestions(recommendations: RecommendationRecord[]) {
  const programIds = new Set(recommendations.map((recommendation) => recommendation.programId));
  return getProgramFollowUpQuestions().filter((question) => question.programId && programIds.has(question.programId));
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

export function getEligibilityQuestions(): EligibilityQuestionRecord[] {
  return getEligibilityConfig().commonQuestions.concat(getProgramFollowUpQuestions());
}

export function getEligibilityRuntimeConfig() {
  return {
    config: getEligibilityConfig(),
    questions: getEligibilityQuestions(),
  };
}

export async function createEligibilitySessionRecord(baseAnswers: BaseEligibilityAnswers) {
  const recommendations = recommendProgramIds(baseAnswers);
  const followUpQuestions = buildFollowUpQuestions(recommendations);

  if (isSupabaseConfigured()) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/eligibility_sessions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        company_size: baseAnswers.companySize,
        workforce_range: baseAnswers.workforceRange,
        location_type: baseAnswers.locationType,
        situations: baseAnswers.situations,
        recommendations,
        follow_up_answers: {},
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Eligibility session insert failed with status ${response.status}`);
    }

    const rows = text ? (JSON.parse(text) as SessionRow[]) : [];
    const session = mapSessionRow(rows[0]);
    return {
      session,
      followUpQuestions,
      storage: "supabase" as const,
    };
  }

  const session: StoredSession = {
    id: `session_${Date.now()}`,
    createdAt: new Date().toISOString(),
    baseAnswers,
    recommendations,
    followUpAnswers: {},
    determinations: [],
  };
  getRuntimeStore().set(session.id, session);
  return {
    session,
    followUpQuestions,
    storage: "memory" as const,
  };
}

export async function determineEligibilitySessionRecord(sessionId: string, followUpAnswers: FollowUpAnswers) {
  if (isSupabaseConfigured()) {
    const sessionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/eligibility_sessions?id=eq.${encodeURIComponent(sessionId)}&select=*`,
      { headers: getHeaders() },
    );
    const sessionText = await sessionResponse.text();
    if (!sessionResponse.ok) {
      throw new Error(sessionText || `Eligibility session fetch failed with status ${sessionResponse.status}`);
    }

    const sessionRows = sessionText ? (JSON.parse(sessionText) as SessionRow[]) : [];
    const row = sessionRows[0];
    if (!row) return null;

    const session = mapSessionRow(row);
    const determinations = determinePrograms(
      session.recommendations.map((recommendation) => recommendation.programId),
      session.baseAnswers,
      followUpAnswers,
    );

    const patchResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/eligibility_sessions?id=eq.${encodeURIComponent(sessionId)}`,
      {
        method: "PATCH",
        headers: { ...getHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ follow_up_answers: followUpAnswers }),
      },
    );
    if (!patchResponse.ok) {
      throw new Error(await patchResponse.text());
    }

    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/eligibility_determinations?session_id=eq.${encodeURIComponent(sessionId)}`,
      {
        method: "DELETE",
        headers: { ...getHeaders(), Prefer: "return=minimal" },
      },
    );
    if (!deleteResponse.ok) {
      throw new Error(await deleteResponse.text());
    }

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/eligibility_determinations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(
        determinations.map((determination) => ({
          session_id: sessionId,
          program_id: determination.programId,
          status: determination.status,
          summary: determination.summary,
          rationale: determination.rationale,
          missing_items: determination.missingItems,
          next_actions: determination.nextActions,
          can_generate_draft: determination.canGenerateDraft,
        })),
      ),
    });
    const insertText = await insertResponse.text();
    if (!insertResponse.ok) {
      throw new Error(insertText || `Eligibility determination insert failed with status ${insertResponse.status}`);
    }

    const determinationRows = insertText ? (JSON.parse(insertText) as DeterminationRow[]) : [];

    return {
      session: {
        ...session,
        followUpAnswers,
        determinations,
      },
      reports: determinationRows.map(mapDeterminationRow),
      storage: "supabase" as const,
    };
  }

  const session = getRuntimeStore().get(sessionId);
  if (!session) return null;

  const determinations = determinePrograms(
    session.recommendations.map((recommendation) => recommendation.programId),
    session.baseAnswers,
    followUpAnswers,
  );

  const updated: StoredSession = {
    ...session,
    followUpAnswers,
    determinations,
  };
  getRuntimeStore().set(sessionId, updated);

  return {
    session: updated,
    reports: determinations,
    storage: "memory" as const,
  };
}

export async function getEligibilitySessionRecord(sessionId: string) {
  if (isSupabaseConfigured()) {
    const sessionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/eligibility_sessions?id=eq.${encodeURIComponent(sessionId)}&select=*`,
      { headers: getHeaders() },
    );
    const sessionText = await sessionResponse.text();
    if (!sessionResponse.ok) {
      throw new Error(sessionText || `Eligibility session fetch failed with status ${sessionResponse.status}`);
    }

    const sessionRows = sessionText ? (JSON.parse(sessionText) as SessionRow[]) : [];
    const row = sessionRows[0];
    if (!row) return null;

    const reportsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/eligibility_determinations?session_id=eq.${encodeURIComponent(sessionId)}&select=*`,
      { headers: getHeaders() },
    );
    const reportsText = await reportsResponse.text();
    if (!reportsResponse.ok) {
      throw new Error(reportsText || `Eligibility determinations fetch failed with status ${reportsResponse.status}`);
    }

    const reportRows = reportsText ? (JSON.parse(reportsText) as DeterminationRow[]) : [];
    return {
      session: {
        ...mapSessionRow(row),
        determinations: reportRows.map(mapDeterminationRow),
      },
      reports: reportRows.map(mapDeterminationRow),
      storage: "supabase" as const,
    };
  }

  const session = getRuntimeStore().get(sessionId);
  if (!session) return null;

  return {
    session,
    reports: session.determinations,
    storage: "memory" as const,
  };
}
