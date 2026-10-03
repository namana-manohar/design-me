# 00 — Overview, Build Order & Why

## What this is
A decision engine that reduces uncertainty before someone spends money.
**One-liner:** *Help people make expensive decisions they won't regret.*
First domain: furnishing a room (Phase 0 = **student bedroom under ₹20k**).

This is not an AI shopping app. Commerce is the first place the engine creates value.

## The five laws (acceptance criteria for everything)
1. **Never know more than you actually know** — confidence is attached to *claims*, not decisions. Never one number.
2. **Every recommendation must be traceable** — why → because → based on → evidence. Explanation is *debugging*, not marketing.
3. **Optimize for fewer regrets, not more confidence** — internal metric is **expected regret** (overconfidence → regret↑; underconfidence → abandonment → regret↑).
4. **Every rejected alternative is training data** — store *what was rejected and why*. This is the moat.
5. **Never confuse the engine with the company** — the engine may generalize; the company earns the right to. Stay in one vertical.

**Feature filter:** (1) claims more certainty than we have? (2) every rec explainable? (3) reduces expected regret? (4) captures rejection reasoning? (5) strengthens chosen market vs expands scope? — fails 2 of 5 → it waits. **Law 1 is a hard gate, not tradeable.**

## Build order and *why*

| # | Build | Why this order |
|---|-------|----------------|
| 0 | **Write Benchmark 001 + a held-out test scenario** (`06-benchmark.md`) | You can't build toward "excellent" without defining it. Test-first. The held-out scenario prevents overfitting to the one you tune against. Cost: a document. Do it before any code. |
| 1 | **Catalog** (`05-catalog.md`) — ~200–400 real bedroom SKUs with *decision metadata* | **Task zero.** Every recommendation is grounded in this. An average engine on an excellent catalog beats an amazing engine on a poor one. You literally cannot produce Benchmark 001 (real products, real dimensions, real alternatives) without it. The moat lives in the fields retail feeds *omit*: true dimensions, compatibility, longevity, real availability. |
| 2 | **Engine** (`02-engine.md`) — brief → traceable, claim-confident decisions | The actual product value (uncertainty reduction). The milestone is: the engine produces *one* Benchmark-001 result that passes the five-law scorecard. Build it test-first against the benchmark. |
| 3 | **Thinnest UI** (`04-ui-ux.md`) — input a brief, see/edit the decision | The only remaining question is empirical: does a real person trust it enough to act? You need the minimum surface for that and nothing more. No homepage, feed, collections, community, accounts. |
| 4 | **Instrumentation + human validation loop** (`06-benchmark.md`) | Capture confidence delta, "what would you change first?", rejections-with-reasons, would-you-buy. This is how you measure the five laws and regret proxies. |

**What gets built first, concretely:** after writing the benchmark spec (a doc), **the catalog is the first thing you build.** Nothing else can be good until it exists.

## Phase 0 scope (explicitly)
**In:** catalog (bedrooms), engine (brief → decisions with evidence + rejections + claim-confidence), thin single-page UI, swap/reject capture, the validation protocol.
**Out (deliberately):** accounts, homepage/discovery, collections, feed, community, remixing of *others'* projects, price tracking, notifications, payments/checkout, multi-vertical, premium tiers, visual canvas, mobile app.

## The validation gate (the only success metric for Phase 0)
A stranger, given a real brief, says some version of:
> *"This saved me time, I understand why each thing is here, and I trust it enough to actually buy."*
…on a scenario the engine was **not** tuned against.

If yes → the architecture is earned; expand. If no → no homepage or feature will save it; fix the engine or the catalog.

## Doc map
- `01-architecture.md` — system shape, components, data flow, stack
- `02-engine.md` — the cognitive pipeline (LLM vs deterministic, confidence, anti-hallucination)
- `03-storage.md` — data model & storage topology
- `04-ui-ux.md` — Phase 0 interface
- `05-catalog.md` — catalog spec (task zero)
- `06-benchmark.md` — Benchmark 001, scorecard, human protocol
