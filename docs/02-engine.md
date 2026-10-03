# 02 — Engine (Cognitive Architecture)

Governing rule: **the LLM reasons about needs; it never asserts facts about products.** Products, prices, and dimensions come only from the catalog. The pattern is a sandwich: LLM reasoning → deterministic grounding + math → LLM explanation, with schema-validated JSON at every boundary and **confidence on every claim**.

## Stages

### 1. Understanding (LLM)
- **In:** raw brief + conversation.
- **Out:** `UnderstandingProfile` JSON — intent, budget{value, confidence}, room dims, owned items, taste tokens, exclusions, country — each field with confidence 0–1.
- **Rules:** strict schema; may emit `null` + low confidence, never fabricate a budget. Numbers typed and validated.
- **Clarify gate (deterministic):** if a *critical* field (intent, budget) < threshold → ask one targeted question. Cap at ≤2 questions total. Do not interrogate.

### 2. Plan (LLM, ontology-bounded)
- **In:** profile.
- **Out:** `PlanItem[]` { category, necessity: essential|recommended|optional, why, confidence } + **excluded items with reasons**.
- **Rules:** items must map to the bedroom ontology (bed, mattress, study table, chair, storage, lighting, rug, curtains, …). Reject off-ontology items. Subtract owned items deterministically. This stage is where Law-3 "buy less" lives.

### 3. Spec (LLM, schema-bound)
- **In:** each PlanItem.
- **Out:** `ProductSpec` { attributes, hard constraints (max price, max dims), soft prefs, query }.
- This is the *query contract* between reasoning and retrieval.

### 4. Retrieval (DETERMINISTIC)
- **In:** ProductSpec.
- **Out:** ranked real candidate `Offers` with computed `match_score`.
- Hybrid search (vector for "minimal wooden study table" + structured filters for price/dims/availability/country) over the catalog. **No LLM. No invented products.**

### 5. Allocation (DETERMINISTIC)
- **In:** all PlanItems' candidates + budget + room constraints.
- **Out:** selected offer per item + alternatives + **feasibility report** ("can't fit table + chair + lamp + rug under ₹20k — drop the rug or raise ₹1,500").
- Priority-weighted budget split; hard constraints enforced. **No LLM arithmetic.**

### 6. Decision assembly + explanation (LLM bounded to real candidates)
- **In:** selected + rejected real offers.
- **Out:** per item a `Decision`:
  - `chosen` (real offer)
  - `evidence[]` — each **typed**: `fact` (fits 120cm wall — from catalog dims), `inference` (users with similar layouts kept it), `preference` (matches requested walnut). Display confidence = driven by the **weakest load-bearing claim**, not an average.
  - `rejections[]` — real alternatives + reason ("Desk B: drawer blocks wardrobe", "Desk C: ships 6 weeks").
  - `confidence_by_claim[]` — Law 1 in data form.
- Explanation cites only real attributes. It must **expose** the weak link, never paper over it (a fluent explanation that launders a bad pick is a failure).

## Deterministic vs LLM (summary)
| Stage | Engine |
|---|---|
| Understanding, Plan, Spec | LLM (schema-bound) |
| Clarify gate | Deterministic (confidence thresholds) |
| Retrieval | Deterministic |
| Allocation / budget / fit | Deterministic |
| Explanation / coherence re-rank | LLM (over real candidates only) |
| Edits (swap/remove/budget) | Deterministic re-run of 4–5 |

## Anti-hallucination (ranked by damage)
1. Invented products/prices → impossible by construction (LLM never emits catalog data).
2. Wrong budget math → impossible (deterministic).
3. Missing required item → bounded by ontology + completeness check.
4. Fake explanation → bounded to citing real attributes + typed evidence.

## Confidence & regret
- **Confidence is per-claim** (Law 1). Surface it loudly only where load-bearing to the decision (fit, budget); quietly elsewhere — too many caveats paralyze (regret↑).
- **Expected regret** is the optimization target (Law 3), measured via **proxies** early (immediate re-edits, hesitation, non-purchase after high stated confidence, returns later). Watch the proxy-to-true-regret gap. Beware the *blandness attractor*: minimizing aggregate regret biases toward safe/median picks — respect the user's preference intensity so strong-taste users aren't homogenized.

## Eval
Every engine change runs against the benchmark suite (`06`) including the **held-out** scenario. A change that improves the tuned scenario but regresses the held-out one is a regression.
