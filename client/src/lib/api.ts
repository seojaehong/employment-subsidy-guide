import type {
  AdminSession,
  BaseEligibilityAnswers,
  ConsultationLeadRecord,
  DocumentVersionRecord,
  FollowUpAnswers,
  OperationalProgram,
  OverrideRecord,
  ProgramDraftRecord,
  QuestionSetVersion,
  RuleDefinition,
} from "@shared/subsidy";

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(input: string, init?: RequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = init?.timeoutMs ?? 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, {
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
      ...init,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function fetchPrograms() {
  return request<{ programs: OperationalProgram[] }>("/api/programs", {
    timeoutMs: 3000,
  });
}

export function fetchProgram(programId: string) {
  return request<{ program: OperationalProgram }>(`/api/programs/${programId}`);
}

export function fetchEligibilityConfig() {
  return request("/api/eligibility/config", {
    timeoutMs: 2500,
  });
}

export function createEligibilitySession(baseAnswers: BaseEligibilityAnswers) {
  return request("/api/eligibility/sessions", {
    method: "POST",
    body: JSON.stringify(baseAnswers),
    timeoutMs: 3500,
  });
}

export function fetchEligibilitySession(sessionId: string) {
  return request(`/api/eligibility/sessions/${sessionId}`);
}

export function determineEligibilitySession(sessionId: string, followUpAnswers: FollowUpAnswers) {
  return request(`/api/eligibility/sessions/${sessionId}/determine`, {
    method: "POST",
    body: JSON.stringify(followUpAnswers),
    timeoutMs: 3500,
  });
}

export function createConsultationLead(
  payload: Omit<ConsultationLeadRecord, "id" | "createdAt">,
) {
  return request<{ lead: ConsultationLeadRecord }>("/api/consultation-leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginAdmin(email: string, password: string) {
  return request<{ session: AdminSession }>("/api/admin?action=login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function bootstrapAdmin(email: string, password: string) {
  return request<{ session: AdminSession }>("/api/admin?action=bootstrap", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchAdminSession(token: string) {
  return request<{ session: AdminSession }>("/api/admin?action=session", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchAdminDocuments(token: string) {
  return request<{
    documents: DocumentVersionRecord[];
    overrides: OverrideRecord[];
    publishEvents: Array<{ id: string; document_version_id: string; author_email: string; summary?: string; created_at: string }>;
  }>("/api/admin?action=documents", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAdminDocument(
  token: string,
  payload: { title: string; issuer: string; baseDate: string; fileName: string; sourceDocumentId?: string },
) {
  return request("/api/admin?action=documents", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function fetchAdminDocumentDetail(token: string, documentId: string) {
  return request<{
    document: DocumentVersionRecord;
    programDrafts: ProgramDraftRecord[];
    questionSets: QuestionSetVersion[];
    ruleDefinitions: RuleDefinition[];
    overrides: OverrideRecord[];
    publishEvents: Array<{ id: string; document_version_id: string; author_email: string; summary?: string; created_at: string }>;
  }>(`/api/admin?action=document&documentId=${encodeURIComponent(documentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateAdminDocument(
  token: string,
  documentId: string,
  payload: Partial<{ title: string; issuer: string; baseDate: string; fileName: string; status: "draft" | "review" | "published" }>,
) {
  return request(`/api/admin?action=document&documentId=${encodeURIComponent(documentId)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function replaceAdminProgramDrafts(token: string, documentId: string, drafts: ProgramDraftRecord[]) {
  return request("/api/admin?action=program-drafts", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ documentId, drafts }),
  });
}

export function replaceAdminQuestionSets(token: string, documentId: string, questionSets: QuestionSetVersion[]) {
  return request("/api/admin?action=questions", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ documentId, questionSets }),
  });
}

export function replaceAdminRules(token: string, documentId: string, rules: RuleDefinition[]) {
  return request("/api/admin?action=rules", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ documentId, rules }),
  });
}

export function createAdminOverride(
  token: string,
  payload: { documentVersionId?: string | null; targetType: string; targetId: string; fieldName: string; value: string; reason: string; effectiveFrom: string },
) {
  return request<{ override: OverrideRecord }>("/api/admin?action=overrides", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function publishAdminDocument(token: string, documentId: string) {
  return request("/api/admin?action=publish", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ documentId }),
  });
}
