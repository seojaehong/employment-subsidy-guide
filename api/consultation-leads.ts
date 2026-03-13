import { nanoid } from "nanoid";

interface ConsultationLeadPayload {
  name: string;
  phone: string;
  company?: string;
  consultType: string;
  message?: string;
  subsidyName?: string;
  sessionId?: string;
  interestedProgramIds: string[];
  determinationStatuses: Record<string, string>;
  missingItems: string[];
}

interface ConsultationLeadRow {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  company: string | null;
  consult_type: string;
  message: string | null;
  subsidy_name: string | null;
  session_id: string | null;
  interested_program_ids: string[];
  determination_statuses: Record<string, string>;
  missing_items: string[];
}

declare global {
  var __employmentConsultationLeads: Array<
    ConsultationLeadPayload & { id: string; createdAt: string }
  > | undefined;
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function getLeads() {
  if (!globalThis.__employmentConsultationLeads) {
    globalThis.__employmentConsultationLeads = [];
  }

  return globalThis.__employmentConsultationLeads;
}

function readBody(req: any) {
  return new Promise<ConsultationLeadPayload>((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body as ConsultationLeadPayload);
      return;
    }

    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        resolve({} as ConsultationLeadPayload);
        return;
      }

      try {
        resolve(JSON.parse(body) as ConsultationLeadPayload);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function isSupabaseConfigured() {
  return SUPABASE_URL !== "" && SUPABASE_SERVICE_ROLE_KEY !== "";
}

async function insertConsultationLead(payload: Omit<ConsultationLeadRow, "id" | "created_at">) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/consultation_leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as ConsultationLeadRow[] | { message?: string; details?: string }) : null;

  if (!response.ok) {
    const message =
      (parsed && !Array.isArray(parsed) ? parsed.message ?? parsed.details : null) ??
      text ??
      `Supabase insert failed with status ${response.status}`;
    throw new Error(message);
  }

  return Array.isArray(parsed) ? parsed[0] ?? null : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const body = await readBody(req);
  const lead = {
    id: `lead_${nanoid(10)}`,
    createdAt: new Date().toISOString(),
    ...body,
  };

  try {
    const supabaseLead = await insertConsultationLead({
      name: body.name,
      phone: body.phone,
      company: body.company ?? null,
      consult_type: body.consultType,
      message: body.message ?? null,
      subsidy_name: body.subsidyName ?? null,
      session_id: body.sessionId ?? null,
      interested_program_ids: body.interestedProgramIds ?? [],
      determination_statuses: body.determinationStatuses ?? {},
      missing_items: body.missingItems ?? [],
    });

    if (supabaseLead) {
      res.status(201).json({
        lead: {
          id: String(supabaseLead.id ?? lead.id),
          createdAt: String(supabaseLead.created_at ?? lead.createdAt),
          ...body,
        },
        storage: "supabase",
      });
      return;
    }
  } catch (error) {
    console.warn("Supabase consultation lead insert failed, using memory fallback:", error);

    if (isSupabaseConfigured()) {
      getLeads().unshift(lead);
      res.status(201).json({
        lead,
        storage: "memory-fallback",
        warning: "Supabase insert failed; stored in runtime fallback instead.",
      });
      return;
    }
  }

  getLeads().unshift(lead);
  res.status(201).json({ lead, storage: "memory" });
}
