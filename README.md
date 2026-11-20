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

## Current status

Initial Next.js foundation and responsive editorial landing-page structure. The hero still uses a temporary photographic placeholder; the final pasta animation and food imagery are part of Phase 01.
