import "server-only";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseAdminReady() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export async function supabaseAdminFetch(path: string, init: RequestInit = {}) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server credentials are not configured.");
  }
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceRoleKey);
  // New sb_secret keys are opaque and must not be sent as Bearer JWTs.
  if (!serviceRoleKey.startsWith("sb_secret_")) {
    headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  }
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function getAdminUser(request: Request) {
  const accessToken = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("patisso_admin_access="))
    ?.slice("patisso_admin_access=".length);

  if (!accessToken || !process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY || !process.env.PATISSO_ADMIN_EMAIL) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${decodeURIComponent(accessToken)}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const user = await response.json() as { id?: string; email?: string };
    if (!user.id || user.email?.toLowerCase() !== process.env.PATISSO_ADMIN_EMAIL.toLowerCase()) return null;
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}
