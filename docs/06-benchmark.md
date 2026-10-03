# 06 — Benchmark 001 & Validation Protocol

Write this **before** building the engine. It is the target and the acceptance contract. Treat it like an ML benchmark — including a **train/test split**: a benchmark you tune against is a training set, not a benchmark.

## Benchmark 001 (the scenario you develop against)
```
Problem:        Student moving into a first apartment bedroom.
Budget:         ₹20,000 (hard)
Room:           10 × 10 ft
Already owns:    Mattress
Must have:      Study table, study chair, lighting, storage
Cannot buy:     Wardrobe (no space)
Style:          Minimal, calm
Country:        India
```

### Success criteria
- ✓ Everything fits the room (real dimensions, real clearances)
- ✓ Total under ₹20,000
- ✓ No essential item forgotten
- ✓ The set is stylistically coherent
- ✓ The user can explain *why* each item was chosen
- ✓ Confidence claims are honest (high where justified, hedged where not)

### Failure criteria
- ✗ Over budget
- ✗ Missing an essential item
- ✗ Something doesn't physically fit
- ✗ Random style mismatch
- ✗ User cannot explain why the AI chose something
- ✗ A confident claim turns out wrong ("it fits" → it doesn't) ← **Law 1 violation, automatic fail**

Note: no mention of Amazon, affiliate, or AI. Only uncertainty reduction.

## Held-out test scenario(s) (you may NOT tune against these)
Keep ≥1 scenario you never inspect the engine's output for until you "ship." Example held-out:
```
Problem:  Working professional, calm bedroom, has back issues (wants a good chair),
          owns a bed frame, 9 × 11 ft room, ₹35,000, dislikes white furniture.
```
"Passing" only counts on the held-out scenario. If the engine aces 001 but fails held-out, it overfit.

## Difficulty tiers (classify scenarios by constraint conflict, not style)
| Tier | Example | What it tests |
|---|---|---|
| Easy | Luxury bedroom, ₹2L | Flexibility (engine shouldn't waste it) |
| Medium | Minimal bedroom, ₹50k | Mild tradeoffs |
| Hard | **Student, ₹20k (001)** | Tight budget → real cuts |
| Very hard | Tiny room + existing furniture | Spatial + subtraction |
| Extreme | Family of 3, one-room apartment | Competing objectives |

Weight your suite toward Hard/Very-hard/Extreme — that's where the engine beats 30 min of manual work and where "this saved me hours" comes from. Pretty style-variants test almost nothing.

## The five-law scorecard (run on every engine version)
1. **Honesty** — does any claim assert more certainty than the data supports? (pass/fail gate)
2. **Traceability** — can every decision be explained from evidence?
3. **Regret** — projected regret proxies low? (see below)
4. **Rejection capture** — are rejected alternatives + reasons recorded?
5. **Scope** — did we solve it within the chosen vertical without scope creep?

## Metrics
- **Confidence delta** = confidence_after − confidence_before (per session).
- **Regret proxies (fast):** immediate re-edits, hesitation, **non-purchase after high stated confidence**, items swapped within first minute.
- **Regret ground truth (slow):** kept / returned / changed at follow-up. Lagging + noisy; use to *calibrate* the proxies, not to steer in real time.
- **Calibration check (the real prize):** when the engine says a claim is high-confidence, is it right that often? Bucket claims by stated confidence, compare to outcome.

## Human validation protocol (the only Phase-0 success metric)
For each tester, real brief, on a scenario the engine wasn't tuned on:
1. Ask **confidence before** (1–5: "how sure are you what to buy?").
2. Let them use the product.
3. Ask **confidence after**.
4. Ask **"Would you actually buy this?"** (yes/no/partly).
5. Ask **"What would you change first?"** (qualitative — *why* this person changed it; not yet a statistic).
6. Note every place they **ignored an explanation, rejected an obvious pick, or trusted a weak one** — these surprises are the real next-insight source.

**Gate passed when:** strangers consistently show a real confidence increase, say they'd buy, and can explain the choices — on held-out scenarios. Then, and only then, expand past Phase 0.
