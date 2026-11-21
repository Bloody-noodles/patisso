import { NextResponse } from "next/server";
import { supabaseAdminReady } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "patisso",
    voiceConfigured: Boolean(process.env.GEMINI_API_KEY),
    orderStorage: supabaseAdminReady() ? "supabase-central-demo" : "not-configured",
    adminAuthConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.PATISSO_ADMIN_EMAIL),
    realPaymentsEnabled: false,
    realFulfilmentEnabled: false,
    checkedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
