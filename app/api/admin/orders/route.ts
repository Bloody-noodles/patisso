import { NextResponse } from "next/server";
import { getAdminUser, supabaseAdminFetch, supabaseAdminReady } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Sign in to access the operations console." }, { status: 401 });
  if (!supabaseAdminReady()) return NextResponse.json({ error: "Order database is not configured." }, { status: 503 });

  const query = new URLSearchParams({ select: "reference,items,total_naira,special_instructions,status,created_at,updated_at", order: "created_at.desc", limit: "200" });
  const response = await supabaseAdminFetch(`patisso_demo_orders?${query.toString()}`);
  if (!response.ok) return NextResponse.json({ error: "Could not load demo orders." }, { status: 502 });
  const rows = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ orders: rows.map((row) => ({
    reference: row.reference, items: row.items, totalNaira: row.total_naira,
    specialInstructions: row.special_instructions, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Sign in to manage demo orders." }, { status: 401 });
  if (!supabaseAdminReady()) return NextResponse.json({ error: "Order database is not configured." }, { status: 503 });

  let body: { reference?: unknown; status?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid update request." }, { status: 400 });
  }
  if (typeof body.reference !== "string" || !/^[A-F0-9]{8}$/.test(body.reference) ||
      !["confirmed", "completed", "cancelled"].includes(String(body.status))) {
    return NextResponse.json({ error: "Invalid order reference or status." }, { status: 400 });
  }

  const query = new URLSearchParams({ reference: `eq.${body.reference}` });
  const response = await supabaseAdminFetch(`patisso_demo_orders?${query.toString()}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status: body.status }),
  });
  if (!response.ok) return NextResponse.json({ error: "Could not update this demo order." }, { status: 502 });
  const rows = await response.json() as unknown[];
  if (rows.length === 0) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
