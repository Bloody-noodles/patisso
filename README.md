# pitãssö

A pasta-led restaurant brand experience inspired by the supplied visual reference.

## Brand and content

- **Brand:** pitãssö
- **Visual direction:** warm marble/paper texture, overhead food photography, floating garnish details, editorial serif headlines, tomato-orange accents, and spacious food-led compositions.
- **Food emphasis:** pasta 50%; cheeseburgers 5%; fries 5%; macaroni 5%; salads 5%; cakes, doughnuts, meat pies, buns and other food 30%.
- These percentages guide visual emphasis and content architecture, not a fixed number of dishes.

## Reference structure implemented

1. Header and split editorial hero.
2. Centred menu discovery section with category filters and a three-card carousel.
3. Food-led brand/story feature.
4. Centred newsletter sign-up treatment.
5. Multi-column footer.

The design follows the reference's layout language while retaining pitãssö's name and food offering hierarchy. Images and menu descriptions are editorial placeholders until final menu assets and approved menu data are supplied.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Custom responsive CSS

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
```

The newsletter form is currently a front-end interaction only; it does not persist or send email addresses. No payment, ordering, or real fulfilment is implied by this visual rebuild.

## Voice concierge (Gemini Live API)

Pâtissö includes a browser-based voice concierge prototype powered by Gemini Live API.

- The browser requests microphone permission only after the visitor starts a call.
- A server route provisions a short-lived, single-use Gemini token; the permanent API key is never sent to the browser.
- The live connection is constrained to the audio model and audio responses.
- The assistant is instructed to describe this as a simulated portfolio demo. It must not claim that real food, payment or fulfilment is available.
- Voice access requires a Google AI Studio API key in the server-only \`GEMINI_API_KEY\` environment variable. Do not add a billing account or upgrade the project. If the free-tier quota is unavailable or exhausted, the voice call should fail gracefully.

Add \`GEMINI_API_KEY\` to your local \`.env.local\` or the Vercel project's Environment Variables, then redeploy. Never commit the key.

The voice concierge uses the same shared menu catalogue as the food galleries. Gemini Live receives the current dish names and supplied descriptions, can recommend only listed dishes, and maintains conversational context during the call. A function-calling action can create a simulated order after the visitor has heard the item/quantity read-back and explicitly confirmed it. The page validates every item against the menu, limits quantities, and displays a demo receipt/reference in the voice panel. The receipt is client-side session state only: it is not stored in a database, sent to a restaurant, priced, paid for, or fulfilled.
