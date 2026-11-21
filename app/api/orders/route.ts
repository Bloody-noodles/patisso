import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { menuItems } from "@/lib/menu";
import { supabaseAdminFetch, supabaseAdminReady } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingLine = { name?: unknown; quantity?: unknown };

export async function POST(request: Request) {
  if (!supabaseAdminReady()) {
    return NextResponse.json({ error: "Order database is not configured yet." }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: { visitorConfirmed?: unknown; items?: unknown; specialInstructions?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.visitorConfirmed !== true || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 8) {
    return NextResponse.json({ error: "A confirmed order with 1–8 menu lines is required." }, { status: 400 });
  }

  const lines: { name: string; quantity: number; unitPrice: number; lineTotal: number }[] = [];
  for (const raw of body.items as IncomingLine[]) {
    const rawName = raw?.name;
    const quantity = raw?.quantity;
    if (typeof rawName !== "string" || typeof quantity !== "number") {
      return NextResponse.json({ error: "Each order line needs a menu item and quantity." }, { status: 400 });
    }
    const match = menuItems.find((item) => item.name.toLowerCase() === rawName.trim().toLowerCase());
    if (!match || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: "An item or quantity does not match the current menu." }, { status: 400 });
    }
    const existing = lines.find((line) => line.name === match.name);
    if (existing) {
      existing.quantity += quantity;
      existing.lineTotal = existing.quantity * existing.unitPrice;
    } else {
      lines.push({ name: match.name, quantity, unitPrice: match.price, lineTotal: match.price * quantity });
    }
  }

  if (lines.reduce((sum, line) => sum + line.quantity, 0) > 20) {
    return NextResponse.json({ error: "The maximum demo order quantity is 20." }, { status: 400 });
  }

  const specialInstructions = typeof body.specialInstructions === "string"
    ? body.specialInstructions.trim().slice(0, 240)
    : "";
  const reference = randomBytes(4).toString("hex").toUpperCase();
  const trackingToken = randomBytes(32).toString("hex");
  const trackingTokenHash = createHash("sha256").update(trackingToken).digest("hex");
  const totalTsh = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  try {
    const response = await supabaseAdminFetch("patisso_demo_orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        reference,
        items: lines,
        total_tsh: totalTsh,
        special_instructions: specialInstructions,
        tracking_token_hash: trackingTokenHash,
        status: "confirmed",
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Pâtissö order insert failed:", response.status, detail);
      return NextResponse.json({ error: "The demo order could not be saved. Please try again." }, { status: 502 });
    }
    const rows = await response.json() as Array<{ id: string; created_at: string; status: string }>;
    const saved = rows[0];
    if (!saved) return NextResponse.json({ error: "The database did not confirm the order." }, { status: 502 });

    return NextResponse.json({
      ok: true,
      order: {
        reference,
        items: lines,
        totalTsh,
        specialInstructions,
        createdAt: saved.created_at,
        status: saved.status,
      },
      trackingToken,
      trackingUrl: `/track?reference=${reference}&token=${trackingToken}`,
      simulated: true,
      message: "Saved as a simulated portfolio order. No restaurant, kitchen, payment or delivery service received it.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Pâtissö order API error:", error);
    return NextResponse.json({ error: "Order storage is temporarily unavailable." }, { status: 503 });
  }
}
