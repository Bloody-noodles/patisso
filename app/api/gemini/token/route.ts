import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;
  if (!origin || origin !== requestOrigin) {
    return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  }

  const now = Date.now();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientKey = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const existing = requests.get(clientKey);
  if (!existing || existing.resetAt <= now) {
    requests.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
  } else if (existing.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many call attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((existing.resetAt - now) / 1000)) } },
    );
  } else {
    existing.count += 1;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice is not configured yet. The site owner needs to add a free Gemini API key." },
      { status: 503 },
    );
  }

  try {
    const expireTime = new Date(now + 15 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(now + 60 * 1000).toISOString();

    // The v1alpha AuthTokenService endpoint accepts the AuthToken resource
    // directly. Live setup is sent by the browser after the WebSocket opens.
    const response = await fetch("https://generativelanguage.googleapis.com/v1alpha/auth_tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        uses: 1,
        expireTime,
        newSessionExpireTime,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const responseText = await response.text();
      let providerMessage = "Google did not provide an error description.";
      try {
        const providerBody = JSON.parse(responseText) as { error?: { message?: string; status?: string } };
        providerMessage = providerBody.error?.message || providerBody.error?.status || providerMessage;
      } catch {
        if (responseText) providerMessage = responseText.slice(0, 500);
      }
      console.error("[Gemini token] Provider rejected session request:", response.status, providerMessage);
      return NextResponse.json(
        { error: `Gemini rejected the voice-session request (HTTP ${response.status}): ${providerMessage}` },
        { status: 502 },
      );
    }

    const data = (await response.json()) as { name?: string };
    if (!data.name) {
      console.error("[Gemini token] Provider returned success without a token name.");
      return NextResponse.json({ error: "Gemini returned an invalid voice session." }, { status: 502 });
    }

    return NextResponse.json(
      { token: data.name },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown network error";
    console.error("[Gemini token] Request failed:", message);
    return NextResponse.json(
      { error: "The voice service is temporarily unreachable. Please try again." },
      { status: 502 },
    );
  }
}
