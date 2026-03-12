import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { subsidyData } from "../client/src/lib/subsidyData";
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
} from "@shared/subsidy";

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

const sourceDocuments: SourceDocumentRecord[] = [
  {
    id: "doc-2026-subsidy-guide",
    title: "2026 고용장려금 지원제도",
    issuer: "고용노동부",
    기준일: "2026-01-01",
    publishedAt: "2026-01-01",
    fileName: "2026 고용장려금 지원제도.pdf",
    priority: 2,
  },
  {
    id: "doc-2026-continued-employment",
    title: "2026년 고령자 계속고용장려금 가이드북",
    issuer: "고용노동부",
    기준일: "2026-01-01",
    publishedAt: "2026-01-01",
    fileName: "'26년 고령자 계속고용장려금 가이드북.pdf",
    priority: 3,
  },
  {
    id: "doc-winners-review",
    title: "2026년도 고용장려금 적합여부검토",
    issuer: "노무법인 위너스",
    기준일: "2026-01-01",
    publishedAt: "2026-01-01",
    fileName: "2026년도_고용장려금_적합여부검토_노무법인위너스.pdf",
    priority: 1,
  },
];

function ensureDir() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

function toProgramRecord(item: (typeof subsidyData)[number]): SubsidyProgramRecord {
  const sourceDocumentIds =
    item.id === "continued-employment"
      ? ["doc-2026-subsidy-guide", "doc-2026-continued-employment", "doc-winners-review"]
      : ["doc-2026-subsidy-guide", "doc-winners-review"];

  return {
    id: `program-${item.id}`,
    legacyId: item.id,
    name: item.name,
    subName: item.subName,
    category: item.category,
    summary: item.description,
    amountLabel: item.amountLabel,
    duration: item.duration,
    applicationCycle: item.applicationCycle,
    tags: item.tags,
    highlight: item.highlight,
    baseAmount: item.amount,
    sourceDocumentIds,
    latestSourceDocumentId:
      item.id === "continued-employment"
        ? "doc-2026-continued-employment"
        : "doc-2026-subsidy-guide",
    published: true,
  };
}

function toRuleRecord(item: (typeof subsidyData)[number]): SubsidyRuleRecord {
  const followUpQuestionIds = getProgramFollowUpQuestions()
    .filter((question) => question.programId === item.id)
    .map((question) => question.id);

  return {
    id: `rule-${item.id}`,
    programId: item.id,
    requirements: item.requirements,
    exclusions: item.exclusions,
    notes: item.notes,
    followUpQuestionIds,
  };
}

function toExclusionRecords(item: (typeof subsidyData)[number]) {
  return item.exclusions.map<SubsidyExclusionRecord>((text, index) => ({
    id: `exclusion-${item.id}-${index + 1}`,
    programId: item.id,
    text,
  }));
}

function buildSeedDb(): RuntimeDb {
  const subsidyPrograms = subsidyData.map(toProgramRecord);
  const subsidyRules = subsidyData.map(toRuleRecord);
  const subsidyExclusions = subsidyData.flatMap(toExclusionRecords);

  return {
    subsidy_program: subsidyPrograms,
    subsidy_rule: subsidyRules,
    subsidy_exclusion: subsidyExclusions,
    subsidy_source_document: sourceDocuments,
    eligibility_question: [...getCommonEligibilityQuestions(), ...getProgramFollowUpQuestions()],
    eligibility_session: [],
    consultation_lead: [],
  };
}

function readDb(): RuntimeDb {
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
