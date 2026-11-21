import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAdminUser(request);
  return NextResponse.json(user ? { authenticated: true, email: user.email } : { authenticated: false }, {
    status: user ? 200 : 401,
    headers: { "Cache-Control": "no-store" },
  });
}
