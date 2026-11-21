import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, PATISSO_ADMIN_EMAIL } = process.env;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !PATISSO_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Admin sign-in is not configured." }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }
  if (typeof body.email !== "string" || typeof body.password !== "string" ||
      body.email.trim().toLowerCase() !== PATISSO_ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify({ email: body.email.trim(), password: body.password }),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const session = await response.json() as { access_token?: string; expires_in?: number; user?: { email?: string } };
    if (!session.access_token || session.user?.email?.toLowerCase() !== PATISSO_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "This account is not authorised for the Pâtissö console." }, { status: 403 });
    }

    const result = NextResponse.json({ ok: true, email: session.user.email });
    result.cookies.set("patisso_admin_access", session.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
      path: "/", maxAge: Math.min(session.expires_in ?? 3600, 3600),
    });
    return result;
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}
