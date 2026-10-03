# 04 — UI / UX (Phase 0)

Goal of the UI: the **thinnest possible shell** that lets a stranger give a brief and react to a decision. It exists to answer one empirical question (the validation gate), not to be a product surface. Build nothing here that isn't required to get a stranger to "I trust this enough to buy."

## What to build: a single page, three states

### State 1 — Brief input
- One open box: *"Describe the room you're trying to set up."*
- 2–3 *real, buildable* example chips (bedroom briefs only — never show a vertical you can't deliver).
- No accounts, no homepage, no feed, no collections.

### State 2 — Understanding (Law 1 + trust)
- Not "Searching…". Show *"Understanding your priorities"* with extracted items as they resolve:
  `✓ Budget ₹20,000  ✓ 10×10 room  ✓ Already own: mattress  ? Calm — fewer items, or natural textures?`
- **Each ✓ must be traceable to a decision later, or don't show it.** Where genuinely ambiguous, *ask* (the `?`) rather than assert a confident-wrong checkmark.
- Max one clarifying question.

### State 3 — The Decision view (the product)
Grouped list of decisions (this is the "canvas" — a list, not a drag-and-drop tool). Per item:
```
Study Table — Desk A · ₹4,200
Why this
  ✓ Fits your 120 cm wall            (fact — high confidence)
  ✓ Leaves ₹3,800 in budget          (fact)
  ~ Matches the calm/wooden look      (preference — your call)
  ~ Similar layouts kept it           (inference — moderate)
Not chosen
  Desk B — would block the wardrobe door
  Desk C — ships in 6 weeks
[ Swap ]  [ Remove ]  [ Why? ]
```
- A live **budget bar** with the feasibility message ("₹1,200 left" / "over by ₹900 — drop the rug?").
- Confidence shown **loudly on load-bearing claims** (fit, budget), quietly elsewhere. Never a single "92%".
- **Swap** opens the real alternatives (from retrieval) and re-runs allocation live.
- **Remove / adjust budget** re-runs allocation live.

## Capturing the gold (Laws 3 & 4) — without friction
- When the user **swaps or removes**, capture *why* via a lightweight reason chip (too_expensive / wrong_size / don't_like / ships_slow / other). Optional free text. **Infer** the reason where obvious; ask only when ambiguous. This is rejection-with-reason data.
- Capture a **confidence delta**: a one-tap "How sure are you about this plan?" before the result and after (slider or 1–5). This feeds Law 3.

## End of flow
- **"Buy"** = outbound deep links to the real offers (+ affiliate tag for telemetry only — never influences ranking) + "mark as bought."
- **Save** = persist the project (magic link, no account wall).
- **"What would you change first?"** — one question at the end. Qualitative signal at this stage, not a statistic.

## Explicitly NOT in Phase 0
Homepage / discovery / collections / feed, community, remixing others' projects, profiles, likes/metrics, price-tracking UI, notifications, in-app checkout, visual room canvas, native app, settings, onboarding tours.

## Visual tone
Calm, minimal, lots of whitespace — but the *mechanism* is action (decide / swap), never scroll. Style is allowed to be soothing; the page must still converge to a decision.

## Future surfaces (documented, not built)
- **Acquisition homepage** (intent-first, real examples) — when you expand past the validation gate.
- **Ownership homepage** ("Continue building" — personalized by the project graph; every problem shown *with* a resolution).
- These are two different homepages for two different states (new vs returning) and include the missing **loop** (a satisfied owner starting project #2). Not now.
