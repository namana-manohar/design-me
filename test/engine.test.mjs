// The five-law scorecard (docs/06-benchmark.md), run on Benchmark 001, the held-out scenario and a grid of briefs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../catalog.js";
import { understand, decide, retrieve, plan, wallNeed, floorNeed, roomCapacity, BENCHMARK_001, HELD_OUT } from "../engine.js";

const byId = new Map(CATALOG.map((it) => [it.id, it]));

function* briefs() {
  yield BENCHMARK_001;
  yield HELD_OUT;
  for (const budget of ["₹12,000", "₹20,000", "₹35,000", "₹50,000", "₹2 lakh"])
    for (const room of ["8 x 9 ft", "10 x 10 ft", "12 x 14 ft", "3 x 3.5 m"])
      for (const extra of ["", "I already own a mattress.", "I work from home, back issues, I dislike white.", "Student. No space for a wardrobe. Minimal and calm.", "Own a bed frame. I need a wardrobe and a rug. Warm wood."])
        yield `Bedroom. Budget ${budget}. Room ${room}. ${extra}`;
}
const runs = [...briefs()].map((b) => ({ brief: b, profile: understand(b) })).map((x) => ({ ...x, result: decide(x.profile) }));

test("Benchmark 001 passes its success criteria", () => {
  const p = understand(BENCHMARK_001);
  assert.equal(p.budget.value, 20000);
  assert.deepEqual([p.room.L, p.room.W, p.room.unit], [10, 10, "ft"]);
  assert.ok(p.owned.includes("mattress") && p.cannot.includes("wardrobe"));
  const r = decide(p);
  assert.ok(r.ok, "Benchmark 001 must be solvable");
  assert.ok(r.spent <= 20000, "under ₹20,000");
  for (const must of ["study table", "chair", "lighting", "storage"]) assert.ok(r.decisions.some((d) => d.category === must), `missing ${must}`);
  assert.ok(!r.decisions.some((d) => d.category === "wardrobe" || d.category === "mattress"), "buys nothing owned or forbidden");
  assert.ok(r.decisions.find((d) => d.category === "lighting").chosen.task, "a student's lamp must be a task lamp");
});

test("held-out scenario: back issues, owns a bed frame, dislikes white", () => {
  const p = understand(HELD_OUT);
  assert.equal(p.budget.value, 35000);
  assert.ok(p.back && p.owned.includes("bed frame") && p.dislike.includes("white"));
  const r = decide(p);
  assert.ok(r.ok);
  assert.ok(r.decisions.find((d) => d.category === "chair").chosen.lumbar, "chair has lumbar support");
  assert.ok(!r.decisions.some((d) => d.chosen.finish === "white"), "no white furniture");
  assert.ok(!r.decisions.some((d) => d.category === "bed frame"), "does not buy a second bed frame");
});

test("Law 1 honesty: an unverifiable fit is never claimed with confidence", () => {
  const r = decide(understand(BENCHMARK_001)); // owns a mattress of unknown size
  const frame = r.decisions.find((d) => d.category === "bed frame");
  if (frame) {
    assert.equal(frame.confidence.label, "low");
    assert.match(frame.confidence.weakest, /didn't say your mattress size/);
  }
  for (const { result } of runs) if (result.ok) for (const d of result.decisions) {
    const load = d.evidence.filter((e) => e.load).map((e) => e.conf);
    assert.equal(d.confidence.value, Math.min(...load), "decision confidence is the weakest load-bearing claim");
    for (const e of d.evidence) assert.ok(["fact", "inference", "preference"].includes(e.type));
  }
});

test("budget: never over, and the total is exact catalog arithmetic", () => {
  for (const { profile, result } of runs) if (result.ok) {
    assert.ok(result.spent <= profile.budget.value);
    assert.equal(result.spent, result.decisions.reduce((t, d) => t + d.chosen.price, 0));
  }
});

test("facts: every product, price and size comes from the catalog unchanged", () => {
  for (const { result } of runs) if (result.ok) for (const d of result.decisions) assert.deepEqual(d.chosen, byId.get(d.chosen.id));
});

test("fit: wall and floor (with clearance) stay inside the room", () => {
  for (const { profile, result } of runs) if (result.ok) {
    const cap = roomCapacity(profile.room);
    assert.ok(result.decisions.reduce((t, d) => t + wallNeed(d.chosen), 0) <= cap.wall);
    assert.ok(result.decisions.reduce((t, d) => t + floorNeed(d.chosen), 0) <= cap.floor);
  }
});

test("no essential is forgotten: every essential is chosen, or the failure says why", () => {
  for (const { profile, result } of runs) {
    if (!result.ok) { assert.ok(result.problems.length && result.problems.every((p) => p.length > 20)); continue; }
    for (const item of plan(profile).items.filter((i) => i.necessity === "essential")) assert.ok(result.decisions.some((d) => d.category === item.category), item.category);
  }
});

test("Law 2 and 4: every decision has evidence and at least one rejected alternative with a reason", () => {
  for (const { result } of runs) if (result.ok) for (const d of result.decisions) {
    assert.ok(d.evidence.length >= 2);
    assert.ok(d.rejections.length >= 1, `${d.category} has no rejection`);
    for (const r of d.rejections) assert.ok(r.reason.length > 8 && byId.has(r.id));
  }
});

test("Law 3, buy less: optional items are offered, not bought, unless added", () => {
  const p = understand(BENCHMARK_001);
  const r = decide(p);
  assert.ok(!r.decisions.some((d) => d.necessity === "optional"));
  assert.ok(r.optional.some((o) => o.category === "rug"));
});

test("compatibility: a bed frame and mattress bought together are the same size", () => {
  for (const { result } of runs) if (result.ok) {
    const f = result.decisions.find((d) => d.category === "bed frame"), m = result.decisions.find((d) => d.category === "mattress");
    if (f && m) assert.equal(f.chosen.fits, m.chosen.fits);
  }
});

test("a budget that cannot cover the essentials is explained with the gap", () => {
  const r = decide(understand("Student, ₹6,000, 10 x 10 ft, own a mattress, need a desk, chair, lamp and storage"));
  assert.equal(r.ok, false);
  assert.match(r.problems.join(" "), /raise ₹/);
});

test("understanding never invents a budget, and asks when it is missing", async () => {
  const { clarify } = await import("../engine.js");
  const p = understand("A calm bedroom, 10 x 10 ft");
  assert.equal(p.budget.value, null);
  assert.equal(clarify(p).field, "budget");
});

test("hard constraints filter retrieval and say why", () => {
  const p = understand(HELD_OUT);
  const pool = retrieve({ category: "chair", necessity: "essential" }, p);
  assert.ok(pool.candidates.every((c) => c.it.lumbar));
  assert.ok(pool.filtered.some((f) => /lumbar/.test(f.reason)));
});
