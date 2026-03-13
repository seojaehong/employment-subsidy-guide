import type {
  AdminRole,
  AdminSession,
  DocumentVersionRecord,
  OperationalProgram,
  OverrideRecord,
  ProgramDraftRecord,
  QuestionSetVersion,
  RuleDefinition,
} from "../shared/subsidy";
import { nanoid } from "nanoid";
import { getDefaultQuestionSeeds, getDefaultRuleSeeds } from "./admin-seed.js";
import { fetchOperationalPrograms } from "./programs-lib.js";
import {
  getSupabaseUrl,
  getServiceHeaders,
  isSupabaseRestConfigured,
  supabaseAuthLogin,
  supabaseDelete,
  supabaseGetUser,
  supabaseInsert,
  supabasePatch,
  supabaseSelect,
  supabaseUpsert,
} from "./supabase-rest.js";

interface AdminUserRow {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
}

interface DocumentRow {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  base_date: string;
  file_name: string;
  status: DocumentVersionRecord["status"];
  source_document_id: string;
  created_at: string;
  updated_at: string;
}

interface ProgramDraftRow {
  id: string;
  document_version_id: string;
  legacy_id: string;
  name: string;
  sub_name: string | null;
  category: ProgramDraftRecord["category"];
  summary: string;
  amount_label: string;
  duration: string;
  application_cycle: string;
  tags: string[];
  highlight: boolean;
  base_amount: ProgramDraftRecord["baseAmount"];
  requirements: string[];
  exclusions: string[];
  notes: string[];
  follow_up_question_ids: string[];
  latest_source_document_id: string;
  source_document_ids: string[];
  draft_status: ProgramDraftRecord["draftStatus"];
}

interface QuestionRow {
  id: string;
  document_version_id: string | null;
  question_id: string;
  scope: QuestionSetVersion["scope"];
  program_id: string | null;
  prompt: string;
  helper: string | null;
  type: QuestionSetVersion["type"];
  options: QuestionSetVersion["options"];
  published: boolean;
  draft_status: QuestionSetVersion["draftStatus"];
}

interface RuleRow {
  id: string;
  document_version_id: string | null;
  target_program_id: string;
  rule_type: RuleDefinition["ruleType"];
  input_key: string;
  operator: RuleDefinition["operator"];
  expected_value: string;
  effect_status: RuleDefinition["effectStatus"] | null;
  effect_summary: string | null;
  effect_missing_item: string | null;
  effect_rationale: string | null;
  effect_next_action: string | null;
  effect_reason: string | null;
  effect_match_score: number | null;
  priority: number;
  published: boolean;
  draft_status: RuleDefinition["draftStatus"];
}

interface OverrideRow {
  id: string;
  document_version_id: string | null;
  target_type: string;
  target_id: string;
  field_name: string;
  value: string;
  reason: string;
  author_email: string;
  effective_from: string;
  created_at: string;
}

interface PublishEventRow {
  id: string;
  document_version_id: string;
  author_email: string;
  summary: string | null;
  created_at: string;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function mapDocument(row: DocumentRow): DocumentVersionRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    issuer: row.issuer,
    baseDate: row.base_date,
    fileName: row.file_name,
    status: row.status,
    sourceDocumentId: row.source_document_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProgramDraft(row: ProgramDraftRow): ProgramDraftRecord {
  return {
    id: row.id,
    documentVersionId: row.document_version_id,
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
    requirements: row.requirements ?? [],
    exclusions: row.exclusions ?? [],
    notes: row.notes ?? [],
    followUpQuestionIds: row.follow_up_question_ids ?? [],
    latestSourceDocumentId: row.latest_source_document_id,
    sourceDocumentIds: row.source_document_ids ?? [],
    draftStatus: row.draft_status,
  };
}

function mapQuestion(row: QuestionRow): QuestionSetVersion {
  return {
    id: row.id,
    documentVersionId: row.document_version_id,
    questionId: row.question_id,
    scope: row.scope,
    programId: row.program_id ?? undefined,
    prompt: row.prompt,
    helper: row.helper ?? undefined,
    type: row.type,
    options: row.options ?? [],
    published: row.published,
    draftStatus: row.draft_status,
  };
}

function mapRule(row: RuleRow): RuleDefinition {
  return {
    id: row.id,
    documentVersionId: row.document_version_id,
    targetProgramId: row.target_program_id,
    ruleType: row.rule_type,
    inputKey: row.input_key,
    operator: row.operator,
    expectedValue: row.expected_value,
    effectStatus: row.effect_status ?? undefined,
    effectSummary: row.effect_summary ?? undefined,
    effectMissingItem: row.effect_missing_item ?? undefined,
    effectRationale: row.effect_rationale ?? undefined,
    effectNextAction: row.effect_next_action ?? undefined,
    effectReason: row.effect_reason ?? undefined,
    effectMatchScore: row.effect_match_score ?? undefined,
    priority: row.priority,
    published: row.published,
    draftStatus: row.draft_status,
  };
}

function mapOverride(row: OverrideRow): OverrideRecord {
  return {
    id: row.id,
    documentVersionId: row.document_version_id,
    targetType: row.target_type,
    targetId: row.target_id,
    fieldName: row.field_name,
    value: row.value,
    reason: row.reason,
    authorEmail: row.author_email,
    effectiveFrom: row.effective_from,
    createdAt: row.created_at,
  };
}

export function readBody<T>(req: any) {
  return new Promise<T>((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body as T);
      return;
    }

    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        resolve({} as T);
        return;
      }

      try {
        resolve(JSON.parse(body) as T);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export function getBearerToken(req: any) {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export async function requireAdminSession(req: any, minimumRole: AdminRole = "editor"): Promise<AdminSession> {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error("관리자 로그인 정보가 없습니다.");
  }

  const user = await supabaseGetUser(token);
  const rows = await supabaseSelect<AdminUserRow[]>(
    "admin_users",
    `?select=*&user_id=eq.${encodeURIComponent(user.id)}`,
  );
  const admin = rows[0];
  if (!admin) {
    throw new Error("관리자 권한이 없습니다.");
  }
  if (minimumRole === "publisher" && admin.role !== "publisher") {
    throw new Error("게시 권한이 없습니다.");
  }

  return {
    accessToken: token,
    userId: user.id,
    email: admin.email,
    role: admin.role,
  };
}

export async function loginAdmin(email: string, password: string) {
  const auth = await supabaseAuthLogin(email, password);
  const rows = await supabaseSelect<AdminUserRow[]>(
    "admin_users",
    `?select=*&user_id=eq.${encodeURIComponent(auth.user.id)}`,
  );
  const admin = rows[0];
  if (!admin) {
    return {
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      userId: auth.user.id,
      email: auth.user.email,
      bootstrapNeeded: true,
    } satisfies AdminSession;
  }

  return {
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    userId: auth.user.id,
    email: auth.user.email,
    role: admin.role,
  } satisfies AdminSession;
}

export async function bootstrapAdmin(email: string, password: string, role: AdminRole = "publisher") {
  if (!isSupabaseRestConfigured()) {
    throw new Error("Supabase 설정이 필요합니다.");
  }

  const existing = await supabaseSelect<AdminUserRow[]>("admin_users", "?select=*");
  if (existing.length > 0) {
    throw new Error("이미 관리자 계정이 등록되어 있습니다.");
  }

  const response = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users`, {
    method: "POST",
    headers: getServiceHeaders(),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || "관리자 계정 생성에 실패했습니다.");
  }
  const created = JSON.parse(text) as { id: string; email: string };
  await supabaseInsert("admin_users", {
    user_id: created.id,
    email: created.email,
    role,
  });
  return loginAdmin(email, password);
}

function toProgramDraftRows(documentVersionId: string, programs: OperationalProgram[]) {
  return programs.map((entry) => ({
    document_version_id: documentVersionId,
    legacy_id: entry.program.legacyId,
    name: entry.program.name,
    sub_name: entry.program.subName ?? null,
    category: entry.program.category,
    summary: entry.program.summary,
    amount_label: entry.program.amountLabel,
    duration: entry.program.duration,
    application_cycle: entry.program.applicationCycle,
    tags: entry.program.tags,
    highlight: entry.program.highlight ?? false,
    base_amount: entry.program.baseAmount,
    requirements: entry.rule.requirements,
    exclusions: entry.rule.exclusions,
    notes: entry.rule.notes,
    follow_up_question_ids: entry.rule.followUpQuestionIds,
    latest_source_document_id: entry.program.latestSourceDocumentId,
    source_document_ids: entry.program.sourceDocumentIds,
    draft_status: "draft",
  }));
}

export async function ensureDefaultPublishedEligibilityArtifacts() {
  const [questions, rules] = await Promise.all([
    supabaseSelect<QuestionRow[]>("subsidy_question_sets", "?select=*&published=eq.true"),
    supabaseSelect<RuleRow[]>("eligibility_rule_definitions", "?select=*&published=eq.true"),
  ]);

  if (questions.length === 0) {
    await supabaseInsert(
      "subsidy_question_sets",
      getDefaultQuestionSeeds().map((question) => ({
        document_version_id: null,
        question_id: question.questionId,
        scope: question.scope,
        program_id: question.programId ?? null,
        prompt: question.prompt,
        helper: question.helper ?? null,
        type: question.type,
        options: question.options,
        published: true,
        draft_status: "published",
      })),
      "return=minimal",
    );
  }

  if (rules.length === 0) {
    await supabaseInsert(
      "eligibility_rule_definitions",
      getDefaultRuleSeeds().map((rule) => ({
        document_version_id: null,
        target_program_id: rule.targetProgramId,
        rule_type: rule.ruleType,
        input_key: rule.inputKey,
        operator: rule.operator,
        expected_value: rule.expectedValue,
        effect_status: rule.effectStatus ?? null,
        effect_summary: rule.effectSummary ?? null,
        effect_missing_item: rule.effectMissingItem ?? null,
        effect_rationale: rule.effectRationale ?? null,
        effect_next_action: rule.effectNextAction ?? null,
        effect_reason: rule.effectReason ?? null,
        effect_match_score: rule.effectMatchScore ?? null,
        priority: rule.priority,
        published: true,
        draft_status: "published",
      })),
      "return=minimal",
    );
  }
}

export async function listDocuments() {
  const [documents, overrides, publishEvents] = await Promise.all([
    supabaseSelect<DocumentRow[]>("subsidy_document_versions", "?select=*&order=updated_at.desc"),
    supabaseSelect<OverrideRow[]>("subsidy_overrides", "?select=*&order=created_at.desc"),
    supabaseSelect<PublishEventRow[]>("subsidy_publish_events", "?select=*&order=created_at.desc"),
  ]);

  return {
    documents: documents.map(mapDocument),
    overrides: overrides.map(mapOverride),
    publishEvents,
  };
}

export async function createDocument(input: {
  title: string;
  issuer: string;
  baseDate: string;
  fileName: string;
  sourceDocumentId?: string;
  createdByEmail: string;
}) {
  const slug = `${slugify(input.title)}-${nanoid(6)}`;
  const sourceDocumentId = input.sourceDocumentId ?? `doc-${slug}`;
  const rows = await supabaseInsert<DocumentRow[]>("subsidy_document_versions", {
    slug,
    title: input.title,
    issuer: input.issuer,
    base_date: input.baseDate,
    file_name: input.fileName,
    status: "draft",
    source_document_id: sourceDocumentId,
    created_by_email: input.createdByEmail,
  });
  const document = rows[0];
  const currentPrograms = await fetchOperationalPrograms();
  await ensureDefaultPublishedEligibilityArtifacts();

  await Promise.all([
    supabaseInsert("subsidy_program_drafts", toProgramDraftRows(document.id, currentPrograms.programs), "return=minimal"),
    supabaseInsert(
      "subsidy_rule_drafts",
      currentPrograms.programs.map((entry) => ({
        document_version_id: document.id,
        program_id: entry.program.legacyId,
        requirements: entry.rule.requirements,
        exclusions: entry.rule.exclusions,
        notes: entry.rule.notes,
        follow_up_question_ids: entry.rule.followUpQuestionIds,
        draft_status: "draft",
      })),
      "return=minimal",
    ),
    supabaseInsert(
      "subsidy_question_sets",
      getDefaultQuestionSeeds().map((question) => ({
        document_version_id: document.id,
        question_id: question.questionId,
        scope: question.scope,
        program_id: question.programId ?? null,
        prompt: question.prompt,
        helper: question.helper ?? null,
        type: question.type,
        options: question.options,
        published: false,
        draft_status: "draft",
      })),
      "return=minimal",
    ),
    supabaseInsert(
      "eligibility_rule_definitions",
      getDefaultRuleSeeds().map((rule) => ({
        document_version_id: document.id,
        target_program_id: rule.targetProgramId,
        rule_type: rule.ruleType,
        input_key: rule.inputKey,
        operator: rule.operator,
        expected_value: rule.expectedValue,
        effect_status: rule.effectStatus ?? null,
        effect_summary: rule.effectSummary ?? null,
        effect_missing_item: rule.effectMissingItem ?? null,
        effect_rationale: rule.effectRationale ?? null,
        effect_next_action: rule.effectNextAction ?? null,
        effect_reason: rule.effectReason ?? null,
        effect_match_score: rule.effectMatchScore ?? null,
        priority: rule.priority,
        published: false,
        draft_status: "draft",
      })),
      "return=minimal",
    ),
  ]);

  return getDocumentDetail(document.id);
}

export async function getDocumentDetail(documentId: string) {
  const [documents, programDrafts, questionSets, rules, overrides, publishEvents] = await Promise.all([
    supabaseSelect<DocumentRow[]>("subsidy_document_versions", `?select=*&id=eq.${encodeURIComponent(documentId)}`),
    supabaseSelect<ProgramDraftRow[]>("subsidy_program_drafts", `?select=*&document_version_id=eq.${encodeURIComponent(documentId)}&order=name.asc`),
    supabaseSelect<QuestionRow[]>("subsidy_question_sets", `?select=*&document_version_id=eq.${encodeURIComponent(documentId)}&order=question_id.asc`),
    supabaseSelect<RuleRow[]>("eligibility_rule_definitions", `?select=*&document_version_id=eq.${encodeURIComponent(documentId)}&order=priority.asc`),
    supabaseSelect<OverrideRow[]>("subsidy_overrides", `?select=*&document_version_id=eq.${encodeURIComponent(documentId)}&order=created_at.desc`),
    supabaseSelect<PublishEventRow[]>("subsidy_publish_events", `?select=*&document_version_id=eq.${encodeURIComponent(documentId)}&order=created_at.desc`),
  ]);
  const document = documents[0];
  if (!document) {
    throw new Error("문서를 찾을 수 없습니다.");
  }

  return {
    document: mapDocument(document),
    programDrafts: programDrafts.map(mapProgramDraft),
    questionSets: questionSets.map(mapQuestion),
    ruleDefinitions: rules.map(mapRule),
    overrides: overrides.map(mapOverride),
    publishEvents,
  };
}

export async function updateDocument(documentId: string, payload: Partial<Pick<DocumentVersionRecord, "title" | "issuer" | "baseDate" | "fileName" | "status">>) {
  await supabasePatch(
    "subsidy_document_versions",
    `?id=eq.${encodeURIComponent(documentId)}`,
    {
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.issuer ? { issuer: payload.issuer } : {}),
      ...(payload.baseDate ? { base_date: payload.baseDate } : {}),
      ...(payload.fileName ? { file_name: payload.fileName } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      updated_at: new Date().toISOString(),
    },
    "return=minimal",
  );
  return getDocumentDetail(documentId);
}

export async function replaceProgramDrafts(documentId: string, drafts: ProgramDraftRecord[]) {
  await supabaseDelete("subsidy_program_drafts", `?document_version_id=eq.${encodeURIComponent(documentId)}`);
  await supabaseDelete("subsidy_rule_drafts", `?document_version_id=eq.${encodeURIComponent(documentId)}`);
  if (drafts.length > 0) {
    await supabaseInsert(
      "subsidy_program_drafts",
      drafts.map((draft) => ({
        document_version_id: documentId,
        legacy_id: draft.legacyId,
        name: draft.name,
        sub_name: draft.subName ?? null,
        category: draft.category,
        summary: draft.summary,
        amount_label: draft.amountLabel,
        duration: draft.duration,
        application_cycle: draft.applicationCycle,
        tags: draft.tags,
        highlight: draft.highlight ?? false,
        base_amount: draft.baseAmount,
        requirements: draft.requirements,
        exclusions: draft.exclusions,
        notes: draft.notes,
        follow_up_question_ids: draft.followUpQuestionIds,
        latest_source_document_id: draft.latestSourceDocumentId,
        source_document_ids: draft.sourceDocumentIds,
        draft_status: draft.draftStatus,
      })),
      "return=minimal",
    );
    await supabaseInsert(
      "subsidy_rule_drafts",
      drafts.map((draft) => ({
        document_version_id: documentId,
        program_id: draft.legacyId,
        requirements: draft.requirements,
        exclusions: draft.exclusions,
        notes: draft.notes,
        follow_up_question_ids: draft.followUpQuestionIds,
        draft_status: draft.draftStatus,
      })),
      "return=minimal",
    );
  }
  return getDocumentDetail(documentId);
}

export async function replaceQuestionSets(documentId: string, questionSets: QuestionSetVersion[]) {
  await supabaseDelete("subsidy_question_sets", `?document_version_id=eq.${encodeURIComponent(documentId)}`);
  if (questionSets.length > 0) {
    await supabaseInsert(
      "subsidy_question_sets",
      questionSets.map((question) => ({
        document_version_id: documentId,
        question_id: question.questionId,
        scope: question.scope,
        program_id: question.programId ?? null,
        prompt: question.prompt,
        helper: question.helper ?? null,
        type: question.type,
        options: question.options,
        published: false,
        draft_status: question.draftStatus,
      })),
      "return=minimal",
    );
  }
  return getDocumentDetail(documentId);
}

export async function replaceRuleDefinitions(documentId: string, rules: RuleDefinition[]) {
  await supabaseDelete("eligibility_rule_definitions", `?document_version_id=eq.${encodeURIComponent(documentId)}`);
  if (rules.length > 0) {
    await supabaseInsert(
      "eligibility_rule_definitions",
      rules.map((rule) => ({
        document_version_id: documentId,
        target_program_id: rule.targetProgramId,
        rule_type: rule.ruleType,
        input_key: rule.inputKey,
        operator: rule.operator,
        expected_value: rule.expectedValue,
        effect_status: rule.effectStatus ?? null,
        effect_summary: rule.effectSummary ?? null,
        effect_missing_item: rule.effectMissingItem ?? null,
        effect_rationale: rule.effectRationale ?? null,
        effect_next_action: rule.effectNextAction ?? null,
        effect_reason: rule.effectReason ?? null,
        effect_match_score: rule.effectMatchScore ?? null,
        priority: rule.priority,
        published: false,
        draft_status: rule.draftStatus,
      })),
      "return=minimal",
    );
  }
  return getDocumentDetail(documentId);
}

export async function createOverride(payload: Omit<OverrideRecord, "id" | "createdAt">) {
  const rows = await supabaseInsert<OverrideRow[]>("subsidy_overrides", {
    document_version_id: payload.documentVersionId ?? null,
    target_type: payload.targetType,
    target_id: payload.targetId,
    field_name: payload.fieldName,
    value: payload.value,
    reason: payload.reason,
    author_email: payload.authorEmail,
    effective_from: payload.effectiveFrom,
  });
  return mapOverride(rows[0]);
}

export async function publishDocument(documentId: string, authorEmail: string) {
  const detail = await getDocumentDetail(documentId);
  const { document, programDrafts, questionSets, ruleDefinitions } = detail;

  await supabaseUpsert(
    "subsidy_source_documents",
    {
      id: document.sourceDocumentId,
      title: document.title,
      issuer: document.issuer,
      base_date: document.baseDate,
      published_at: new Date().toISOString(),
      file_name: document.fileName,
      priority: 10,
    },
    "id",
  );

  if (programDrafts.length > 0) {
    await supabaseUpsert(
      "subsidy_programs",
      programDrafts.map((draft) => ({
        id: `program-${draft.legacyId}`,
        legacy_id: draft.legacyId,
        name: draft.name,
        sub_name: draft.subName ?? null,
        category: draft.category,
        summary: draft.summary,
        amount_label: draft.amountLabel,
        duration: draft.duration,
        application_cycle: draft.applicationCycle,
        tags: draft.tags,
        highlight: draft.highlight ?? false,
        base_amount: draft.baseAmount,
        source_document_ids: draft.sourceDocumentIds,
        latest_source_document_id: document.sourceDocumentId,
        override_amount_label: null,
        override_summary: null,
        published: true,
      })),
      "legacy_id",
    );

    await supabaseDelete("subsidy_rules", "?id=neq.__never__");
    await supabaseDelete("subsidy_exclusions", "?id=neq.__never__");

    await supabaseInsert(
      "subsidy_rules",
      programDrafts.map((draft) => ({
        id: `rule-${draft.legacyId}`,
        program_id: draft.legacyId,
        requirements: draft.requirements,
        exclusions: draft.exclusions,
        notes: draft.notes,
        follow_up_question_ids: draft.followUpQuestionIds,
      })),
      "return=minimal",
    );

    const exclusionRows = programDrafts.flatMap((draft) =>
      draft.exclusions.map((text, index) => ({
        id: `exclusion-${draft.legacyId}-${index + 1}`,
        program_id: draft.legacyId,
        text,
      })),
    );

    if (exclusionRows.length > 0) {
      await supabaseInsert("subsidy_exclusions", exclusionRows, "return=minimal");
    }
  }

  await supabasePatch("subsidy_question_sets", "?published=eq.true", { published: false }, "return=minimal");
  await supabasePatch("eligibility_rule_definitions", "?published=eq.true", { published: false }, "return=minimal");
  await supabasePatch(
    "subsidy_question_sets",
    `?document_version_id=eq.${encodeURIComponent(documentId)}`,
    { published: true, draft_status: "published" },
    "return=minimal",
  );
  await supabasePatch(
    "eligibility_rule_definitions",
    `?document_version_id=eq.${encodeURIComponent(documentId)}`,
    { published: true, draft_status: "published" },
    "return=minimal",
  );
  await supabasePatch(
    "subsidy_document_versions",
    `?id=eq.${encodeURIComponent(documentId)}`,
    { status: "published", updated_at: new Date().toISOString() },
    "return=minimal",
  );
  await supabaseInsert(
    "subsidy_publish_events",
    {
      document_version_id: documentId,
      author_email: authorEmail,
      summary: `${document.title} 게시`,
    },
    "return=minimal",
  );

  return getDocumentDetail(documentId);
}
