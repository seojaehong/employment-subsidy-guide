import { nanoid } from "nanoid";
import { insertConsultationLead, isSupabaseConfigured } from "../server/supabase.ts";

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

declare global {
  var __employmentConsultationLeads: Array<
    ConsultationLeadPayload & { id: string; createdAt: string }
  > | undefined;
}

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
