# Design Me

**Help people make expensive decisions they won't regret.**

Design Me is a decision engine that reduces uncertainty before someone spends money. The first domain is furnishing a room, and Phase 0 is narrow on purpose: a bedroom on a tight budget.

**Live prototype:** https://design-me-three.vercel.app

Describe the room ("Student, ₹20,000, 10 × 10 ft, I already own a mattress, need a study table, chair, lighting and storage, no space for a wardrobe, minimal and calm"). It shows what it understood, asks one question if something critical is missing, then gives a decision for each item: what it picked, why, how sure it is about each claim, and which alternatives it rejected and why.

## Design docs

The full Phase 0 design, written before any code: [overview and build order](docs/00-overview.md), [architecture](docs/01-architecture.md), [engine](docs/02-engine.md), [storage and data model](docs/03-storage.md), [UI](docs/04-ui-ux.md), [catalog](docs/05-catalog.md), [Benchmark 001 and the validation protocol](docs/06-benchmark.md). This prototype follows them; where it simplifies (rules instead of LLM calls, a sample catalog), the README says so.

## The five laws

Every feature is checked against these.

1. **Never know more than you actually know.** Confidence belongs to claims, not decisions. A decision is only as sure as its weakest load-bearing claim, and the page shows that weak link instead of hiding it.
2. **Every recommendation must be traceable.** Each pick lists its evidence, typed as fact (from the catalog and your room), inference (likely but unverified) or preference (your call).
3. **Optimise for fewer regrets, not more confidence.** Buy less: optional pieces are offered, never bought by default, and quality on the essentials beats adding extras.
4. **Every rejected alternative is data.** Each decision lists the real alternatives it beat, with reasons. When you swap or remove something, it asks why (too expensive, wrong size, don't like it, ships slowly) and records it.
5. **Never confuse the engine with the company.** One vertical, bedrooms, until it earns more.

## How it works

Three engines that never mix:

| Stage | What it does | In this prototype |
|---|---|---|
| Understanding | Brief to a profile with a confidence per field: budget, room size, what you own, must-haves, exclusions, style | Visible rules (`understand()`); in the full design, a schema-bound LLM call |
| Clarify gate | Ask one question only if budget or room size is missing | Deterministic |
| Plan | Items as essential, recommended or optional, bounded by a bedroom ontology; owned and excluded items subtracted | Rules (`plan()`); LLM in the full design |
| Retrieval | Real catalog items that pass hard constraints (fits the room with clearance, no disliked finish, lumbar support for back trouble, a task lamp for studying) | Deterministic |
| Allocation | Picks one item per need within budget, wall length and floor space; bed and mattress sizes must match; a feasibility report when it can't be done ("raise ₹1,500, or drop the bed frame") | Deterministic |
| Decision | Typed evidence, per-claim confidence, rejections with reasons | Deterministic; in the full design an LLM writes the explanation, bounded to real attributes |

The rule that holds everything together: **the reasoning layer never emits a product, a price or a dimension.** Those come only from the catalog, and all money and fit arithmetic is plain code.

## Benchmarks

`npm test` runs the scorecard on:

- **Benchmark 001:** student, ₹20,000 (hard), 10 × 10 ft, owns a mattress, needs a study table, chair, lighting and storage, no wardrobe, minimal and calm.
- **A second scenario:** working professional with back issues, owns a bed frame, 9 × 11 ft, ₹35,000, dislikes white furniture.
- **100 generated briefs** across budgets from ₹12,000 to ₹2 lakh, room sizes and constraints.

Checks include: never over budget; totals are exact catalog arithmetic; every product, price and size is the catalog's, unchanged; everything fits with clearance; no essential is forgotten, or the failure says what to change; every decision has evidence and at least one rejected alternative; decision confidence equals the weakest load-bearing claim; an unverifiable fit (an owned mattress of unknown size) is never claimed with confidence; bed and mattress sizes match; optional items are not bought by default.

One honest caveat: in a real evaluation the second scenario would be held out and never inspected while tuning. Here both live in the test suite, so it works as a regression check. A true held-out set needs fresh briefs from real people.

## Run it

Static site, no build step, no API key.

```bash
npx serve .
npm test
```

## Files

- [`engine.js`](engine.js): understanding, clarify gate, plan, retrieval, allocation, decisions.
- [`catalog.js`](catalog.js): 34 bedroom items with decision metadata: true dimensions, clearance, style tokens, finish, longevity tier, assembly, lead time, compatibility. **Sample data: prices and sizes are illustrative, not real listings.** The Phase 0 catalog in the design is 200 to 400 hand-curated, currently buyable items with verified dimensions.
- [`index.html`](index.html): the single page: brief, understanding, decisions, swap and remove with reasons, confidence before and after, "what would you change first?".
- [`test/engine.test.mjs`](test/engine.test.mjs): the scorecard.

## Next

- Replace the rule-based understanding and plan with schema-bound LLM calls, keeping the same contracts.
- A real, hand-measured catalog with live prices and outbound links.
- The validation protocol: strangers rate confidence before and after, say whether they'd buy, and what they'd change first, on briefs the engine was never tuned on.

Designed and built by [Namana Manohar](https://namana-manohar.vercel.app).
