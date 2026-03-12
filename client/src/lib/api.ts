import type {
  BaseEligibilityAnswers,
  ConsultationLeadRecord,
  FollowUpAnswers,
  OperationalProgram,
} from "@shared/subsidy";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchPrograms() {
  return request<{ programs: OperationalProgram[] }>("/api/programs");
}

export function fetchProgram(programId: string) {
  return request<{ program: OperationalProgram }>(`/api/programs/${programId}`);
}

export function fetchEligibilityConfig() {
  return request("/api/eligibility/config");
}

export function createEligibilitySession(baseAnswers: BaseEligibilityAnswers) {
  return request("/api/eligibility/sessions", {
    method: "POST",
    body: JSON.stringify(baseAnswers),
  });
}

export function fetchEligibilitySession(sessionId: string) {
  return request(`/api/eligibility/sessions/${sessionId}`);
}

export function determineEligibilitySession(sessionId: string, followUpAnswers: FollowUpAnswers) {
  return request(`/api/eligibility/sessions/${sessionId}/determine`, {
    method: "POST",
    body: JSON.stringify(followUpAnswers),
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
