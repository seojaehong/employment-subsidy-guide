const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

export function getSupabaseUrl() {
  return SUPABASE_URL;
}

export function isSupabaseRestConfigured() {
  return SUPABASE_URL !== "" && SUPABASE_SERVICE_ROLE_KEY !== "";
}

export function getServiceHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra,
  };
}

export function getAnonHeaders(extra?: Record<string, string>) {
  const apiKey = SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;
  return {
    "Content-Type": "application/json",
    apikey: apiKey,
    ...extra,
  };
}

export async function supabaseRest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}${path}`, init);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `${path} failed with status ${response.status}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

export async function supabaseInsert<T>(table: string, rows: object | object[], prefer = "return=representation") {
  return supabaseRest<T>(`/rest/v1/${table}`, {
    method: "POST",
    headers: getServiceHeaders({ Prefer: prefer }),
    body: JSON.stringify(rows),
  });
}

export async function supabaseUpsert<T>(table: string, rows: object | object[], onConflict: string) {
  return supabaseRest<T>(`/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: getServiceHeaders({ Prefer: "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify(rows),
  });
}

export async function supabaseSelect<T>(table: string, query: string) {
  return supabaseRest<T>(`/rest/v1/${table}${query}`, {
    method: "GET",
    headers: getServiceHeaders(),
  });
}

export async function supabasePatch<T>(table: string, query: string, payload: object, prefer = "return=representation") {
  return supabaseRest<T>(`/rest/v1/${table}${query}`, {
    method: "PATCH",
    headers: getServiceHeaders({ Prefer: prefer }),
    body: JSON.stringify(payload),
  });
}

export async function supabaseDelete(table: string, query: string, prefer = "return=minimal") {
  return supabaseRest<null>(`/rest/v1/${table}${query}`, {
    method: "DELETE",
    headers: getServiceHeaders({ Prefer: prefer }),
  });
}

export async function supabaseAuthLogin(email: string, password: string) {
  return supabaseRest<{
    access_token: string;
    refresh_token: string;
    user: { id: string; email: string };
  }>(`/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: getAnonHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export async function supabaseGetUser(accessToken: string) {
  return supabaseRest<{ id: string; email?: string }>(`/auth/v1/user`, {
    method: "GET",
    headers: getAnonHeaders({ Authorization: `Bearer ${accessToken}` }),
  });
}
