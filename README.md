# Pâtissö

A pasta-led, food-first restaurant brand and voice-ordering portfolio demo. It is an independent concept build, not a live restaurant.

## Brand and visual direction

- **Brand:** Pâtissö (repository/project slug: `patisso`)
- **Palette:** wine red and light sand.
- **Typography:** bold condensed display headings with an elegant editorial serif.
- **Structure:** cinematic food hero, category overview, separate long-scroll galleries for Pasta, Savoury, Bakery & Sweets, and Drinks, editorial story, social CTA and footer.
- **Catalogue:** 36 illustrative items across four categories, with Tanzanian Shilling prices and dish-matched photography.

Images, descriptions and prices are illustrative portfolio-demo content, not an approved commercial menu or price list.

## Stack

- Next.js App Router, React 19 and TypeScript
- Custom responsive CSS
- Gemini Live API for browser voice interaction
- Supabase Postgres for central simulated order storage
- Supabase Auth for the private admin sign-in
- Server-only Supabase service-role access for trusted order operations

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and supply the required secrets. Never commit real secrets.

## Environment variables

- `GEMINI_API_KEY` — Gemini Live token provisioning (already configured in Vercel Production).
- `SUPABASE_URL` — Pâtissö Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY` — public Supabase publishable key; safe for server Auth requests.
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only secret** used by trusted API routes. Never prefix it with `NEXT_PUBLIC_`, expose it to browser code, or commit it.
- `PATISSO_ADMIN_EMAIL` — exact email address allowed to access the operations console. Create that user in Supabase Auth first.

## Quality checks

```bash
npm run lint
npm run build
npm run test:e2e
```

The Playwright release suite checks desktop and mobile layout, catalogue and overview images, alt text, external/footer links, accessibility and performance budgets. The order-console flow is tested against isolated API fixtures so CI does not require production credentials or create real database rows.

## Voice concierge

Pâtissö includes a browser-based voice concierge powered by Gemini Live API.

- The browser requests microphone permission only after the visitor starts a call.
- A server route provisions a short-lived, single-use Gemini token. The permanent API key remains server-side.
- The assistant uses the shared catalogue for descriptions and prices; it must not invent ingredients, allergens, availability, opening hours or delivery promises.
- The assistant must read back the complete order and total, then obtain explicit visitor confirmation before the order tool accepts it.
- The browser sends only menu item names, quantities and the confirmation flag to the server. The server independently validates the menu and calculates all prices and totals.
- Audio interruptions stop scheduled playback, and unexpected socket disconnects release microphone/audio resources.
- Voice access requires a Google AI Studio API key in the server-only `GEMINI_API_KEY` environment variable. Do not add billing or upgrade the project. Free-tier quota can be exhausted or unavailable.

## Simulated order lifecycle

- `POST /api/orders` validates the visitor-confirmed order against the server-side menu, calculates authoritative prices, creates a private tracking token and persists the order in Supabase.
- Only a SHA-256 hash of the tracking token is stored. Tracking requires both the order reference and the private token; a reference alone does not expose order details.
- `/track` uses the private receipt link to retrieve central order status from the server.
- `/demo-console` requires a Supabase Auth session for the configured admin email. It lists central orders, supports search, status changes (confirmed, completed, cancelled), and CSV export.
- The admin API checks the signed-in Supabase user on the server. Database reads and writes use the service-role key only in server routes; the key is never returned to the browser.
- The console refreshes the central queue every 15 seconds while visible.

## Database security

- `public.patisso_demo_orders` has Row Level Security enabled and no anon/authenticated policies.
- The Data API is accessed only by trusted server routes using `SUPABASE_SERVICE_ROLE_KEY`.
- Order creation recalculates item prices from `lib/menu.ts`; client-supplied totals are never trusted.
- Tracking tokens are high-entropy random values. Only their hashes are stored and compared in constant time.
- Admin access is restricted by `PATISSO_ADMIN_EMAIL` and Supabase Auth password sign-in.
- Never place a service-role or secret key in a `NEXT_PUBLIC_` variable.

## No real restaurant operations

Pâtissö has no physical kitchen. No payment is taken, no restaurant is notified, no kitchen ticket is created, and no food is prepared or delivered. All ordering and tracking is simulated for portfolio demonstration only.
