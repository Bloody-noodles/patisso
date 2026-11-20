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

- Next.js App Router
- React 19
- TypeScript
- Custom responsive CSS
- Gemini Live API for browser voice interaction
- Browser local storage for simulated demo orders

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
npm run test:e2e
```

The Playwright release suite checks desktop and mobile layout, all catalogue and overview images, alt text, external/footer links, accessibility, performance budgets, and the local order-console-to-tracking lifecycle.

## Voice concierge

Pâtissö includes a browser-based voice concierge powered by Gemini Live API.

- The browser requests microphone permission only after the visitor starts a call.
- A server route provisions a short-lived, single-use Gemini token. The permanent API key remains server-side.
- The assistant uses the shared catalogue for descriptions and prices; it must not invent ingredients, allergens, availability, opening hours or delivery promises.
- The assistant must read back the complete order and total, then obtain explicit visitor confirmation before the order tool accepts it.
- Audio interruptions stop scheduled playback, and unexpected socket disconnects release microphone/audio resources.
- Voice access requires a Google AI Studio API key in the server-only `GEMINI_API_KEY` environment variable. The current project has this configured in Production. Do not add billing or upgrade the project. Free-tier quota can be exhausted or unavailable.

## Simulated order lifecycle

- The assistant validates exact menu items and quantities, calculates authoritative line totals and grand total, and creates a simulated order reference.
- `/track` looks up the order and displays its current local status.
- `/demo-console` lists local demo orders, supports search and status changes (confirmed, completed, cancelled), and exports the currently filtered orders as CSV.
- The console and tracking page share the same browser storage; status changes are reflected in other open tabs.
- If browser storage is unavailable, the voice receipt remains visible for the current session but the app does not claim that tracking was saved.

**Important limitation:** this is browser-local storage, not a server-side database. Orders do not sync across devices or browsers, can be lost when site data is cleared, and the demo console is not an authenticated production admin system. Cross-device persistence and secure admin access require a separately provisioned database and authentication service. No paid database or storage service has been provisioned.

## No real restaurant operations

Pâtissö has no physical kitchen. No payment is taken, no restaurant is notified, no kitchen ticket is created, and no food is prepared or delivered. All ordering and tracking is simulated for portfolio demonstration only.
