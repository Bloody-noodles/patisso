import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { supabaseAdminFetch, supabaseAdminReady } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!supabaseAdminReady()) return NextResponse.json({ error: "Order tracking is not configured." }, { status: 503 });
  const url = new URL(request.url);
  const reference = (url.searchParams.get("reference") ?? "").trim().toUpperCase();
  const token = url.searchParams.get("token") ?? "";
  if (!/^[A-F0-9]{8}$/.test(reference) || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Enter a valid order reference and private tracking link." }, { status: 400 });
  }

  try {
    const query = new URLSearchParams({
      select: "reference,items,total_naira,special_instructions,status,created_at,tracking_token_hash",
      reference: `eq.${reference}`,
      limit: "1",
    });
    const response = await supabaseAdminFetch(`patisso_demo_orders?${query.toString()}`);
    if (!response.ok) return NextResponse.json({ error: "Tracking is temporarily unavailable." }, { status: 503 });
    const rows = await response.json() as Array<{
      reference: string; items: unknown; total_naira: number; special_instructions: string;
      status: string; created_at: string; tracking_token_hash: string;
    }>;
    const row = rows[0];
    if (!row) return NextResponse.json({ error: "We couldn't find that order." }, { status: 404 });
    const supplied = Buffer.from(createHash("sha256").update(token).digest("hex"), "hex");
    const stored = Buffer.from(row.tracking_token_hash, "hex");
    if (stored.length !== supplied.length || !timingSafeEqual(stored, supplied)) {
      return NextResponse.json({ error: "We couldn't find that order." }, { status: 404 });
    }
    return NextResponse.json({
      order: {
        reference: row.reference,
        items: row.items,
        totalNaira: row.total_naira,
        specialInstructions: row.special_instructions,
        status: row.status,
        createdAt: row.created_at,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Tracking is temporarily unavailable." }, { status: 503 });
  }
}
