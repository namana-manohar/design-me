import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../catalog.js";
import { planNeeds, solve, fitsRoom, layout, MAX_FLOOR_SHARE, ROOMS } from "../engine.js";

const byId = new Map(CATALOG.map((it) => [it.id, it]));
const styles = ["minimal", "scandi", "warm", "classic", "modern", "industrial"];
const rooms = [{ L: 3, W: 3 }, { L: 3.6, W: 3 }, { L: 4.5, W: 3.6 }, { L: 2.7, W: 2.4 }, { L: 6, W: 4.2 }];
const budgets = [15000, 40000, 75000, 150000];

function* cases() {
  for (const kind of Object.keys(ROOMS)) for (const room of rooms) for (const budget of budgets) for (const style of styles)
    for (const brief of ["", "I work from home and read a lot", "guests on weekends, we watch movies"])
      yield { kind, room, budget, style, brief };
}

test("never spends more than the budget", () => {
  for (const c of cases()) {
    const r = solve({ room: c.room, budget: c.budget, style: c.style, needs: planNeeds(c.kind, c.brief).needs });
    if (r.ok) assert.ok(r.spent <= c.budget, JSON.stringify(c));
  }
});

test("every price and size in a result is exactly the catalog's", () => {
  for (const c of cases()) {
    const r = solve({ room: c.room, budget: c.budget, style: c.style, needs: planNeeds(c.kind, c.brief).needs });
    if (!r.ok) continue;
    for (const p of r.picks) {
      const src = byId.get(p.id);
      assert.ok(src, `unknown item ${p.id}`);
      for (const k of ["name", "price", "w", "d", "h", "category"]) assert.equal(p[k], src[k]);
    }
    assert.equal(r.spent, r.picks.reduce((t, p) => t + p.price, 0));
  }
});

test("every pick fits the room and keeps half the floor free", () => {
  for (const c of cases()) {
    const r = solve({ room: c.room, budget: c.budget, style: c.style, needs: planNeeds(c.kind, c.brief).needs });
    if (!r.ok) continue;
    for (const p of r.picks) assert.ok(fitsRoom(p, c.room), `${p.name} in ${c.room.L}x${c.room.W}`);
    assert.ok(r.floorShare <= MAX_FLOOR_SHARE + 1e-9);
  }
});

test("a result always contains every must-have, or explains why it cannot", () => {
  for (const c of cases()) {
    const { needs } = planNeeds(c.kind, c.brief);
    const r = solve({ room: c.room, budget: c.budget, style: c.style, needs });
    if (r.ok) {
      for (const n of needs.filter((n) => n.need === "must")) assert.ok(r.picks.some((p) => p.category === n.category), n.category);
    } else {
      assert.ok(r.problems.length > 0);
    }
  }
});

test("every pick and every skip says why", () => {
  for (const c of cases()) {
    const r = solve({ room: c.room, budget: c.budget, style: c.style, needs: planNeeds(c.kind, c.brief).needs });
    if (!r.ok) continue;
    for (const p of r.picks) assert.ok(p.why.length >= 2 && p.why.every((s) => s.length > 5));
    for (const s of r.skipped) assert.ok(s.why.length > 5);
  }
});

test("the brief adds needs and says which words it heard", () => {
  const plan = planNeeds("bedroom", "I work from home");
  assert.deepEqual(plan.heard, ["work from home"]);
  assert.equal(plan.needs.find((n) => n.category === "desk").need, "must");
});

test("things you already own are not bought again", () => {
  const { needs } = planNeeds("bedroom", "", ["bed", "mattress"]);
  assert.ok(!needs.some((n) => n.category === "bed" || n.category === "mattress"));
});

test("a queen bed never gets a single mattress", () => {
  for (const c of cases()) {
    if (c.kind !== "bedroom") continue;
    const r = solve({ room: c.room, budget: c.budget, style: c.style, needs: planNeeds(c.kind, c.brief).needs });
    if (!r.ok) continue;
    const bed = r.picks.find((p) => p.category === "bed"), mat = r.picks.find((p) => p.category === "mattress");
    if (bed && mat) assert.ok(bed.w - mat.w >= 0 && bed.w - mat.w <= 20, `${bed.name} + ${mat.name}`);
  }
});

test("too small a budget is explained, not silently trimmed", () => {
  const r = solve({ room: { L: 3.6, W: 3 }, budget: 5000, style: "minimal", needs: planNeeds("bedroom").needs });
  assert.equal(r.ok, false);
  assert.match(r.problems[0], /over the budget/);
});

test("the layout sketch never overlaps furniture", () => {
  for (const c of cases()) {
    const r = solve({ room: c.room, budget: c.budget, style: c.style, needs: planNeeds(c.kind, c.brief).needs });
    if (!r.ok) continue;
    const { rects, L, W } = layout(r.picks, c.room);
    for (const a of rects) {
      assert.ok(a.x >= -1e-9 && a.y >= -1e-9 && a.x + a.w <= L + 1e-9 && a.y + a.d <= W + 1e-9, `${a.label} outside the room`);
      for (const b of rects) if (a !== b) assert.ok(!(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.d && b.y < a.y + a.d), `${a.label} overlaps ${b.label}`);
    }
  }
});
