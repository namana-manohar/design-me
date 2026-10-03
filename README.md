# Design Me

Furnish a room inside a fixed budget, and see why every piece was picked.

**Live demo:** https://design-me-three.vercel.app

You give it a room (type and size), a budget, a style and a sentence or two about how you live. It returns a full set of furniture that fits the budget and the floor, a to-scale sketch of the room, and a reason for every pick and every skip.

## The idea

I first designed Design Me between February and May 2026. The rule at its centre: **the model can reason about what a room needs, but plain code owns every price and every size**, so the system can never invent a product fact. This repository is a small working prototype of that idea, rebuilt in October 2026 so anyone can run it.

## How it works

1. **Needs.** Each room type starts with a list of must-haves, nice-to-haves and optional pieces. The brief can change that list: "I work from home" makes a desk and chair must-haves, "light sleeper" adds blackout curtains. The page shows which words it heard. In the full design a language model reads the brief; here that step is a short list of visible rules ([`engine.js`](engine.js), `BRIEF_RULES`), so the prototype runs without an API key.
2. **Picks.** A small search tries every combination of catalog items, never goes over the budget, keeps at least half the floor free, only picks pieces that physically fit the room, and only pairs a mattress with a bed it fits. Must-haves come first, then nice-to-haves, then style match. Ties go to the cheaper set.
3. **Reasons.** Every pick says why it is there (a must-have for the room, or something you said) and how it matches your style. Every skipped item says why it was left out (over budget, too big, or traded for a higher priority). If the room cannot be done at all, it says what would have to change.
4. **Sketch.** A rough top-down layout, to scale, with furniture along the walls and the rug underneath.

## Run it

It is a static site with no build step.

```bash
npx serve .
```

Then open the printed address. Tests use Node's built-in runner:

```bash
npm test
```

The tests check the promises the page makes, across 1,080 combinations of room, size, budget, style and brief: it never spends more than the budget, every price and size matches the catalog exactly, every pick fits the room, half the floor stays free, must-haves are always included or the failure is explained, every pick and skip has a reason, and the sketch never overlaps furniture.

## Files

- [`engine.js`](engine.js): needs, search, reasons and layout. No dependencies.
- [`catalog.js`](catalog.js): 40 sample items. **Prices and sizes are illustrative sample data, not a real store's listings.**
- [`index.html`](index.html): the page.
- [`test/engine.test.mjs`](test/engine.test.mjs): the tests.

## What I would do next

- Put a language model back on the brief step, with its output limited to the same needs list the rules produce, so it can only ask for categories, never invent products.
- Swap the sample catalog for a real one, with prices refreshed daily.
- Let people drag pieces around the sketch and keep the budget live.

Built by [Namana Manohar](https://namana-manohar.vercel.app).
