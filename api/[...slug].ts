import { createRequire } from "node:module";
import { nanoid } from "nanoid";
import {
  determinePrograms,
  getEligibilityConfig,
  isPriorityProgram,
  recommendProgramIds,
  type BaseEligibilityAnswers,
  type ConsultationLeadRecord,
  type EligibilityQuestionRecord,
  type EligibilitySessionRecord,
  type FollowUpAnswers,
  type OperationalProgram,
  type SourceDocumentRecord,
  type SubsidyExclusionRecord,
  type SubsidyProgramRecord,
  type SubsidyRuleRecord,
} from "../shared/subsidy";

interface SeedDb {
  subsidy_program: SubsidyProgramRecord[];
  subsidy_rule: SubsidyRuleRecord[];
  subsidy_exclusion: SubsidyExclusionRecord[];
  subsidy_source_document: SourceDocumentRecord[];
  eligibility_question: EligibilityQuestionRecord[];
}

interface ApiRuntimeState {
  eligibilitySessions: EligibilitySessionRecord[];
  consultationLeads: ConsultationLeadRecord[];
}

declare global {
  var __employmentSubsidyApiState: ApiRuntimeState | undefined;
}

const require = createRequire(import.meta.url);
const seedDb = require("../server/data/seed-db.json") as SeedDb;

const operationalPrograms: OperationalProgram[] = seedDb.subsidy_program
  .filter((program) => program.published)
  .map((program) => ({
    program,
    rule: seedDb.subsidy_rule.find((rule) => rule.programId === program.legacyId)!,
    exclusions: seedDb.subsidy_exclusion.filter((entry) => entry.programId === program.legacyId),
    latestSource:
      seedDb.subsidy_source_document.find((source) => source.id === program.latestSourceDocumentId) ??
      seedDb.subsidy_source_document[0],
  }));

function getState() {
  if (!globalThis.__employmentSubsidyApiState) {
    globalThis.__employmentSubsidyApiState = {
      eligibilitySessions: [],
      consultationLeads: [],
    };
  }

  return globalThis.__employmentSubsidyApiState;
}

function getProgramByLegacyId(programId: string) {
  return operationalPrograms.find((entry) => entry.program.legacyId === programId) ?? null;
}

function getEligibilityPayload() {
  return {
    config: getEligibilityConfig(),
    questions: seedDb.eligibility_question,
  };
}

function getRuleCoverage() {
  return {
    priorityProgramIds: operationalPrograms
      .filter((entry) => isPriorityProgram(entry.program.legacyId))
      .map((entry) => entry.program.legacyId),
    questionCount: seedDb.eligibility_question.length,
    documentCount: seedDb.subsidy_source_document.length,
  };
}

function createEligibilitySession(baseAnswers: BaseEligibilityAnswers) {
  const recommendations = recommendProgramIds(baseAnswers);
  const session: EligibilitySessionRecord = {
    id: `session_${nanoid(10)}`,
    createdAt: new Date().toISOString(),
    baseAnswers,
    recommendations,
    followUpAnswers: {},
    determinations: [],
  };

  getState().eligibilitySessions.unshift(session);

  return {
    session,
    recommendedPrograms: recommendations.map((recommendation) => ({
      ...recommendation,
      program: getProgramByLegacyId(recommendation.programId),
    })),
    followUpQuestions: seedDb.eligibility_question.filter(
      (question) =>
        question.scope === "program" &&
        question.programId &&
        recommendations.some((recommendation) => recommendation.programId === question.programId),
    ),
  };
}

function getEligibilitySession(sessionId: string) {
  const session = getState().eligibilitySessions.find((item) => item.id === sessionId);
  if (!session) return null;

  return {
    session,
    reports: session.determinations.map((determination) => ({
      ...determination,
      program: getProgramByLegacyId(determination.programId),
    })),
  };
}

function determineEligibilitySession(sessionId: string, followUpAnswers: FollowUpAnswers) {
  const session = getState().eligibilitySessions.find((item) => item.id === sessionId);
  if (!session) return null;

  session.followUpAnswers = followUpAnswers;
  session.determinations = determinePrograms(
    session.recommendations.map((recommendation) => recommendation.programId),
    session.baseAnswers,
    followUpAnswers,
  );

  return {
    session,
    reports: session.determinations.map((determination) => ({
      ...determination,
      program: getProgramByLegacyId(determination.programId),
    })),
  };
}

function createConsultationLead(payload: Omit<ConsultationLeadRecord, "id" | "createdAt">) {
  const lead: ConsultationLeadRecord = {
    id: `lead_${nanoid(10)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  getState().consultationLeads.unshift(lead);
  return lead;
}

function sendJson(res: any, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function readBody(req: any) {
  return new Promise<any>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname.replace(/\/+$/, "");

  try {
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true, coverage: getRuleCoverage() });
      return;
    }

    if (req.method === "GET" && pathname === "/api/programs") {
      sendJson(res, 200, { programs: operationalPrograms });
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/programs/")) {
      const programId = pathname.replace("/api/programs/", "");
      const program = getProgramByLegacyId(programId);
      if (!program) {
        sendJson(res, 404, { message: "Program not found" });
        return;
      }
      sendJson(res, 200, { program });
      return;
    }

    if (req.method === "GET" && pathname === "/api/eligibility/config") {
      sendJson(res, 200, getEligibilityPayload());
      return;
    }

    if (req.method === "POST" && pathname === "/api/eligibility/sessions") {
      const body = await readBody(req);
      sendJson(res, 201, createEligibilitySession(body));
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/eligibility/sessions/")) {
      const parts = pathname.split("/");
      if (parts.length === 5) {
        const payload = getEligibilitySession(parts[4]);
        if (!payload) {
          sendJson(res, 404, { message: "Session not found" });
          return;
        }
        sendJson(res, 200, payload);
        return;
      }
    }

    if (req.method === "POST" && pathname.endsWith("/determine")) {
      const parts = pathname.split("/");
      if (
        parts.length === 6 &&
        parts[1] === "api" &&
        parts[2] === "eligibility" &&
        parts[3] === "sessions"
      ) {
        const body = await readBody(req);
        const payload = determineEligibilitySession(parts[4], body);
        if (!payload) {
          sendJson(res, 404, { message: "Session not found" });
          return;
        }
        sendJson(res, 200, payload);
        return;
      }
    }

    if (req.method === "POST" && pathname === "/api/consultation-leads") {
      const body = await readBody(req);
      sendJson(res, 201, { lead: createConsultationLead(body) });
      return;
    }

    sendJson(res, 404, { message: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    sendJson(res, 500, { message });
  }
}
