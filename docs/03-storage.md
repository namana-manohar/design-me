# 03 — Storage & Data Model

Conceptual model only (no SQL). Think years ahead in the *shape*; build only the Phase-0 tables now.

## The decision hierarchy (the spine)
```
Goal  →  Project  →  Decision  →  Evidence
```
- **Goal** — what the user is trying to achieve ("bedroom under ₹25k"). Measurable.
- **Project** — a working attempt at a goal; versioned. Container for many decisions.
- **Decision** — one choice (this desk), the atomic, most valuable record.
- **Evidence** — typed justification for a decision.

## Core entities

### User (thin in Phase 0 — can be anonymous/magic-link)
country (default), optional taste/budget priors.

### Goal
{ user_id, statement, vertical, created_at }

### Project
{ goal_id, version, status, understanding_snapshot_id } — versioned snapshots (immutable) for audit + compare.

### UnderstandingProfile (versioned)
{ project_id, intent, budget{value,confidence}, room_dims, owned_items[], taste_tokens[], exclusions[], country, per_field_confidence, source_brief }

### Decision  ← crown jewel
{ project_id, plan_item, chosen_offer_id, status }
- → **Evidence[]**: { type: fact|inference|preference, claim, confidence, source } — *display confidence = weakest load-bearing claim.*
- → **Rejection[]**: { offer_id, reason_code, reason_text } — **log this for every decision; it is the moat (Law 4).** Reason codes: too_expensive, wrong_dimensions, ships_slow, style_mismatch, low_durability, incompatible, partner_disliked, other.

### Product (canonical) — see `05`
The real-world item, independent of seller: title, category, canonical attributes, **dimensions**, **compatibility metadata**, **longevity signal**, images, brand.

### Provider
{ name, country, affiliate_config, feed_config, reliability_score }

### Offer (Product × Provider)
{ product_id, provider_id, price, url, availability, last_seen, sku } — same desk from 3 sellers = 1 Product, 3 Offers. **Never conflate Product and Offer.**

### PriceHistory (append-only) — *schema now, populate later*
{ offer_id, ts, price, availability }

### Feedback / Outcome signals (Law 3 measurement)
- ConfidenceSnapshot { project_id, stage: before|after, value, ts } → enables **confidence delta**.
- DecisionOutcome { decision_id, kept|returned|changed, ts } — arrives slowly; proxies first.
- Edit { decision_id, type: swap|remove|adjust, ts } — fast regret proxy.

## Relationships
- User 1—N Goal 1—N Project 1—N Decision.
- Decision N—1 Product (chosen); Decision N—N Product (rejected, via Rejection).
- Product 1—N Offer N—1 Provider. Offer 1—N PriceHistory.
- Project self-ref `forked_from` (for future remix; column exists, unused in Phase 0).

## Storage topology
- **Relational (Postgres):** everything above. Single DB in Phase 0.
- **Search index:** Product/Offer projection for retrieval (pgvector or managed). Rebuildable — not source of truth.
- **Object store:** images.
- **Later, when volume demands:** move PriceHistory to a time-series/append-only store; move Edit/Outcome events to an analytics warehouse. Don't build these now.

## Indexes (Phase 0)
- Project by user_id, status.
- Decision by project_id; Rejection by decision_id.
- Offer by product_id; Offer by (country, availability) for retrieval filters.
- Product attribute + vector indexes in the search layer.

## Multi-everything from the schema, not the code
Put `country` on User/Offer/Provider and `vertical` on Goal/Project *now*, even though Phase 0 uses one of each. Cheap now, migration-hell later. Adding a vertical must be data (ontology + catalog), never a schema rewrite.
