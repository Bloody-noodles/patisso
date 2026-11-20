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

The design follows the reference's layout language while retaining pitãssö's name and food offering hierarchy. Images, descriptions and TSh prices are illustrative portfolio-demo content, not an approved live restaurant menu or commercial price list.

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

The voice concierge and food galleries use one shared catalogue containing food, drinks, descriptions and illustrative Tanzanian Shilling (TSh) prices. Gemini Live can recommend a drink to accompany a meal, but must only use the supplied catalogue. After the visitor has heard the item, quantity, unit price, line total and grand total read-back and explicitly confirmed, the app validates the order and calculates the authoritative total from the catalogue. A demo receipt/reference is saved in browser local storage and can be looked up on the `/track` page in the same browser and device. This is browser-local demo tracking, not a server-side order database: clearing browser storage or switching devices removes access to the record. No payment, restaurant notification, kitchen processing, delivery or real fulfilment takes place.
