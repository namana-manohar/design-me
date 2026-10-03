# 01 — Architecture

## Mental model
The system is **a loop around one object: the `Project`.** It is not a linear pipeline. Modules are transformations that read and write Project state; the user re-triggers them as the plan evolves.

```
                 ┌───────────────────────────────────────────┐
                 │                 PROJECT                     │
                 │  goal · understanding · decisions ·         │
                 │  evidence · rejections · budget state       │
                 └───────────────────────────────────────────┘
                        ▲                         │
        writes/edits    │                         │ reads
                        │                         ▼
   user brief ──► [Understanding] ──► [Plan] ──► [Spec] ──► [Retrieval] ──► [Allocator] ──► [Decision + Evidence]
                     (LLM)            (LLM)      (LLM)      (deterministic)  (deterministic)   (assemble + explain, LLM-bounded)
                                                              ▲
                                                              │ grounds in
                                                        ┌───────────┐
                                                        │  CATALOG  │  (products · offers · decision metadata)
                                                        └───────────┘
```

## The one non-negotiable boundary
Three engines, never mixed:
- **Reasoning (LLM):** understands needs, decides *what items are required*, writes specs, writes explanations. **Never asserts product facts or prices.**
- **Facts (Catalog + Retrieval, deterministic):** the only source of real products, prices, dimensions, availability. Everything the user can buy enters here.
- **Math (Allocator, deterministic):** budget allocation, dimensional fit, feasibility. **The LLM never does money or fit arithmetic.**

This boundary is what makes the product trustworthy and is the implementation of Law 1 and Law 2.

## Components
1. **Understanding service** — brief → structured `UnderstandingProfile` (JSON, per-field confidence). Asks a clarifying question only when a *critical* field (budget, intent) is low-confidence.
2. **Plan service** — profile → required items (essential/recommended/optional) bounded by a per-vertical ontology, with exclusions ("you said you own a mattress → not buying one").
3. **Spec service** — each plan item → a `ProductSpec` (attributes + constraints + a query).
4. **Retrieval service** — spec → real candidate offers from the catalog, constraint-filtered, ranked by match × price-fit × quality. Deterministic.
5. **Allocator** — enforces hard constraints (budget, dimensions) across all items; produces the selected offer per item + alternatives + feasibility report. Deterministic.
6. **Decision assembler** — packages each choice as a `Decision` with typed `Evidence`, claim-level confidence, and `Rejections` (with reasons). Explanations written by a *bounded* LLM pass over **real retrieved products only**.
7. **Catalog** — the substrate (see `05`).
8. **Instrumentation** — logs confidence, edits, rejections, outcomes (see `06`).

## Data flow (happy path)
brief → Understanding → Plan → Spec(per item) → Retrieval(per item) → Allocator(whole project) → Decisions+Evidence+Rejections → UI. On any user edit (swap/remove/adjust budget) → re-run Retrieval+Allocator (deterministic); only re-run LLM stages if the *goal language* changes.

## Stack recommendation (startup-optimized — choose boringly)
- **One deployable app** (modular monolith). No microservices.
- **Relational DB** (Postgres) for Project/Decision/Catalog transactional truth.
- **Search**: start with Postgres + a vector extension (pgvector) OR a managed hybrid search service. Do **not** stand up heavy infra for ~300 SKUs.
- **LLM via hosted API.** Wrap every call behind a schema-validated interface so models are swappable.
- **Object store** for product images.
- Defer: queues, event buses, time-series stores, caching layers — add only when a measured bottleneck demands it.

## What is intentionally absent
No auth system, no notification service, no payment integration, no price-tracking workers, no recommendation feed. These are post-validation (see `00` scope).

## Architectural invariants (keep true forever)
- The LLM never emits a product, price, or dimension.
- Budget/fit math is deterministic and unit-tested.
- Every `Decision` carries evidence + at least one logged rejection-with-reason.
- Confidence is per-claim, never a single decision-level number.
- Adding a vertical = new ontology + new catalog, **not** new core code.
