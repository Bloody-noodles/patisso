# pãtissö

A premium, pasta-led food destination and AI-assisted ordering experience.

## Brand system

- **Wordmark:** pãtissö
- **Repository slug:** patisso
- **Primary wine:** `#7F011F`
- **Light sand:** `#F5EBD0`
- **Visual direction:** cinematic food imagery, editorial typography, generous negative space, and scroll-led storytelling.

## Product direction

The website is designed to stand on its own as a polished food brand experience. The longer-term product includes:

- An editorial menu with pasta as the primary category.
- Supporting food collections: burgers, fries, macaroni, salads, cakes, doughnuts, meat pies, buns and more.
- Responsive cart and order review.
- AI ordering assistant with text and conversational voice interfaces.
- Order confirmation and tracking.
- A clearly labelled demo checkout until a real payment and fulfilment integration exists.

The assistant must use verified menu, ingredient and allergen data. It must not invent availability or make unsupported allergy assurances.

## Food emphasis

- Pasta — 50%
- Burgers — 5%
- French fries — 5%
- Macaroni — 5%
- Salads — 5%
- Bakery and other food — 30%

These percentages guide the visual emphasis and content architecture, not a fixed number of menu items.

## Stack

- Next.js App Router
- React
- TypeScript
- Custom CSS foundation
- Motion and realtime voice dependencies will be selected when their requirements are implemented.

## Local development

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build phases

1. **Brand and cinematic hero:** establish the visual system and pasta-led opening sequence.
2. **Editorial menu:** build the full vertical food story with distinct motion treatments for each category.
3. **Ordering experience:** menu data, cart, AI text and voice ordering.
4. **Operations:** checkout, persistence, order tracking and admin tools.

## Milestone status

### Milestone 01 — Brand experience and cinematic hero

- [x] Establish wine-red and light-sand design tokens.
- [x] Establish bold grotesque display typography with an editorial serif contrast.
- [x] Build responsive brand navigation and a responsive hero composition.
- [x] Add an animated pasta/fork line-art gesture and motion-aware entrance sequence.
- [x] Add a reduced-motion fallback.
- [ ] Replace the temporary hero photograph with approved final cinematic food media.
- [x] GitHub Actions quality workflow passed (lint and production build).

**Status:** automated quality check passed; final cinematic media and responsive visual review remain open.

### Milestone 02 — The pasta collection

- [x] Establish a pasta-first editorial collection section.
- [x] Create four image-led pasta showcases with varied compositions.
- [x] Preserve pasta as the dominant food story.
- [ ] Verify image selection and visual crop on desktop and mobile.
- [ ] Run lint and production build after implementation.

**Status:** first implementation pushed; visual review and CI verification pending.

The hero currently uses a temporary remote photograph and an original SVG/CSS motion treatment. The final cinematic fork-to-plate footage or image sequence is a separate asset decision, not represented as completed. Pasta dish imagery and descriptions are editorial concept content pending confirmation against the final restaurant menu.
