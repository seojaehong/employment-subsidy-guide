import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import seedDb from "./data/seed-db.json";
import {
  determinePrograms,
  getCommonEligibilityQuestions,
  getEligibilityConfig,
  getProgramFollowUpQuestions,
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

interface RuntimeDb {
  subsidy_program: SubsidyProgramRecord[];
  subsidy_rule: SubsidyRuleRecord[];
  subsidy_exclusion: SubsidyExclusionRecord[];
  subsidy_source_document: SourceDocumentRecord[];
  eligibility_question: EligibilityQuestionRecord[];
  eligibility_session: EligibilitySessionRecord[];
  consultation_lead: ConsultationLeadRecord[];
}

const DB_PATH = path.resolve(process.cwd(), "server", "data", "runtime-db.json");
const IS_SERVERLESS_RUNTIME =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true" ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

declare global {
  // Reuse a single in-memory store inside a warm serverless instance.
  var __employmentSubsidyRuntimeDb: RuntimeDb | undefined;
}

function ensureDir() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

function buildSeedDb(): RuntimeDb {
  return {
    subsidy_program: seedDb.subsidy_program as SubsidyProgramRecord[],
    subsidy_rule: seedDb.subsidy_rule as SubsidyRuleRecord[],
    subsidy_exclusion: seedDb.subsidy_exclusion as SubsidyExclusionRecord[],
    subsidy_source_document: seedDb.subsidy_source_document as SourceDocumentRecord[],
    eligibility_question: seedDb.eligibility_question as EligibilityQuestionRecord[],
    eligibility_session: [],
    consultation_lead: [],
  };
}

function readDb(): RuntimeDb {
  if (IS_SERVERLESS_RUNTIME) {
    if (!globalThis.__employmentSubsidyRuntimeDb) {
      globalThis.__employmentSubsidyRuntimeDb = buildSeedDb();
    }
    return globalThis.__employmentSubsidyRuntimeDb;
  }

  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const seed = buildSeedDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }

  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw) as RuntimeDb;
}

function writeDb(db: RuntimeDb) {
  if (IS_SERVERLESS_RUNTIME) {
    globalThis.__employmentSubsidyRuntimeDb = db;
    return;
  }

  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function getLatestSource(db: RuntimeDb, program: SubsidyProgramRecord) {
  const source =
    db.subsidy_source_document.find((item) => item.id === program.latestSourceDocumentId) ??
    db.subsidy_source_document[0];

  return source;
}

export function listOperationalPrograms(): OperationalProgram[] {
  const db = readDb();

  return db.subsidy_program
    .filter((program) => program.published)
    .map((program) => ({
      program,
      rule: db.subsidy_rule.find((rule) => rule.programId === program.legacyId)!,
      exclusions: db.subsidy_exclusion.filter((entry) => entry.programId === program.legacyId),
      latestSource: getLatestSource(db, program),
    }));
}

export function getProgramByLegacyId(programId: string) {
  return listOperationalPrograms().find((entry) => entry.program.legacyId === programId) ?? null;
}

export function getEligibilityPayload() {
  return {
    config: getEligibilityConfig(),
    questions: readDb().eligibility_question,
  };
}

export function createEligibilitySession(baseAnswers: BaseEligibilityAnswers) {
  const db = readDb();
  const recommendations = recommendProgramIds(baseAnswers);
  const session: EligibilitySessionRecord = {
    id: `session_${nanoid(10)}`,
    createdAt: new Date().toISOString(),
    baseAnswers,
    recommendations,
    followUpAnswers: {},
    determinations: [],
  };

  db.eligibility_session.unshift(session);
  writeDb(db);

  const followUpQuestions = db.eligibility_question.filter(
    (question) =>
      question.scope === "program" &&
      question.programId &&
      recommendations.some((recommendation) => recommendation.programId === question.programId),
  );

  return {
    session,
    recommendedPrograms: recommendations.map((recommendation) => {
      const operationalProgram = getProgramByLegacyId(recommendation.programId);
      return {
        ...recommendation,
        program: operationalProgram,
      };
    }),
    followUpQuestions,
  };
}

export function determineEligibilitySession(sessionId: string, followUpAnswers: FollowUpAnswers) {
  const db = readDb();
  const session = db.eligibility_session.find((item) => item.id === sessionId);

  if (!session) {
    return null;
  }

  session.followUpAnswers = followUpAnswers;
  session.determinations = determinePrograms(
    session.recommendations.map((recommendation) => recommendation.programId),
    session.baseAnswers,
    followUpAnswers,
  );

  writeDb(db);

  return {
    session,
    reports: session.determinations.map((determination) => ({
      ...determination,
      program: getProgramByLegacyId(determination.programId),
    })),
  };
}

export function getEligibilitySession(sessionId: string) {
  const db = readDb();
  const session = db.eligibility_session.find((item) => item.id === sessionId);
  if (!session) return null;

  return {
    session,
    reports: session.determinations.map((determination) => ({
      ...determination,
      program: getProgramByLegacyId(determination.programId),
    })),
  };
}

export function createConsultationLead(
  payload: Omit<ConsultationLeadRecord, "id" | "createdAt">,
) {
  const db = readDb();
  const lead: ConsultationLeadRecord = {
    id: `lead_${nanoid(10)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  db.consultation_lead.unshift(lead);
  writeDb(db);

  return lead;
}

export function getProgramQuestions(programId: string) {
  return readDb().eligibility_question.filter((question) => question.programId === programId);
}

export function getRuleCoverage() {
  const db = readDb();
  return {
    priorityProgramIds: db.subsidy_program
      .filter((program) => isPriorityProgram(program.legacyId))
      .map((program) => program.legacyId),
    questionCount: db.eligibility_question.length,
    documentCount: db.subsidy_source_document.length,
  };
}
