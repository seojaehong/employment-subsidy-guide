interface SupabaseInsertError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface SupabaseInsertEnvelope<T> {
  data: T[] | null;
  error?: SupabaseInsertError;
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    Prefer: "return=representation",
  };
}

export function isSupabaseConfigured() {
  return SUPABASE_URL !== "" && SUPABASE_SERVICE_ROLE_KEY !== "";
}

export async function insertConsultationLead<TRecord extends Record<string, unknown>>(payload: TRecord) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/consultation_leads`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as TRecord[] | SupabaseInsertEnvelope<TRecord> | SupabaseInsertError) : null;

  const rows = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && "data" in parsed
      ? parsed.data
      : null;

  const error =
    parsed && typeof parsed === "object" && !Array.isArray(parsed) && "error" in parsed
      ? parsed.error
      : parsed && typeof parsed === "object" && !Array.isArray(parsed) && "message" in parsed
        ? parsed
        : null;

  if (!response.ok) {
    const message =
      error?.message ??
      error?.details ??
      text ??
      `Supabase insert failed with status ${response.status}`;
    throw new Error(message);
  }

  return rows?.[0] ?? null;
}
