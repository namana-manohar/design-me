# 05 — Catalog (Task Zero)

The catalog is the substrate and the moat. **Build this first.** An average engine on an excellent catalog beats an amazing engine on a poor one. The defensibility is not the products — it's the **decision metadata that retail feeds omit.**

## Scope for Phase 0
- **One vertical: bedrooms.**
- **~200–400 real, currently-buyable SKUs** across the bedroom ontology: bed/frame, mattress, study table, chair, wardrobe/storage, bedside table, lighting (ceiling/task/ambient), rug, curtains, organization, décor.
- **India, real prices, real links.** Hand-curated. Quality over count.

## The two kinds of fields

### A. Commodity fields (hard but mechanical — from listings)
title, brand, category, price, url, provider, images, availability, rating.

### B. Decision metadata (THE MOAT — usually missing from feeds; you add it)
- **True dimensions** (W×D×H, in cm) — the basis of every "will it fit?" claim.
- **Compatibility** — what it works with (monitor-arm-mountable? fits-under-loft-bed? mattress size for frame?).
- **Spatial behavior** — door/drawer swing, clearance needed, wall vs corner.
- **Longevity signal** — material quality, expected lifespan tier (budget/standard/durable), assembly difficulty.
- **Style tokens** — minimal / warm-wood / Scandinavian / dark-modern, finish/color (walnut/white/oak).
- **Real availability & lead time** — in stock? ships in X days? (not the listing's optimistic claim).
- **Functional fit** — small-space suitable? rental-friendly (no drilling)? dual-function (work+sleep)?

Field B is what lets the engine make *fact-typed* evidence (Law 1) and answer the six fits: physical, aesthetic, budget, lifestyle, compatibility, longevity.

## Product vs Offer (do not conflate)
- **Product** = the real-world item + all fields above.
- **Offer** = Product sold by a Provider at a price/url/availability. Same desk, 3 sellers = 1 Product, 3 Offers.

## Quality bar ("excellent catalog")
A catalog entry is *done* only when:
1. Dimensions are real (measured/verified, not guessed).
2. At least 2–3 genuine **alternatives** exist in its category and price band (so retrieval and "rejections" are real).
3. Style tokens and compatibility are filled.
4. Availability reflects reality.
5. Price and link work today.

If you can't fill the decision metadata for an item, it doesn't belong in Phase 0 — a half-known product produces a low-confidence decision, which fails the validation gate.

## Sourcing approach
- Manual curation by a human with taste + a tape-measure mentality. This is not glamorous; it is the highest-leverage work in the company.
- Pull commodity fields from listings; **verify dimensions** from spec sheets / manufacturer pages; **add** the B-fields by hand.
- Capture *why an item is good/bad* as you go — this seeds the engine's reasoning and the benchmark alternatives.

## Coverage check
Before building the engine, confirm the catalog can fully furnish **Benchmark 001** (student bedroom, ₹20k, 10×10, owns mattress, needs study table) *and* the held-out scenario — with real alternatives for every required item. If it can't, the catalog isn't done.

## Later (not now)
Automated feeds, freshness SLAs, multi-provider dedup, more verticals, more countries. All deferred until the single-vertical catalog has proven the engine.
