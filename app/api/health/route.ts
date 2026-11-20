import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "patisso",
    voiceConfigured: Boolean(process.env.GEMINI_API_KEY),
    orderStorage: "browser-local-demo",
    realPaymentsEnabled: false,
    realFulfilmentEnabled: false,
    checkedAt: new Date().toISOString(),
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
