// Design Me engine. Plain code only: every price and size in the result comes straight from the catalog,
// and every pick and every skip carries the reason it was made.
import { CATALOG } from "./catalog.js";

export const ROOMS = {
  bedroom: [["bed", "must"], ["mattress", "must"], ["wardrobe", "must"], ["side table", "nice"], ["lamp", "nice"], ["curtains", "nice"], ["rug", "optional"]],
  living: [["sofa", "must"], ["coffee table", "must"], ["tv unit", "nice"], ["rug", "nice"], ["lamp", "nice"], ["curtains", "nice"], ["bookshelf", "optional"]],
  study: [["desk", "must"], ["chair", "must"], ["lamp", "must"], ["bookshelf", "nice"], ["curtains", "optional"], ["rug", "optional"]],
};

// What the brief can change. In the full Design Me design a language model read the brief;
// here the same step is a short list of visible rules, so the prototype runs with no API key.
export const BRIEF_RULES = [
  { words: ["work from home", "wfh", "work", "office", "laptop"], add: [["desk", "must"], ["chair", "must"], ["lamp", "nice"]] },
  { words: ["read", "books", "reading"], add: [["bookshelf", "nice"], ["lamp", "nice"]] },
  { words: ["guest", "guests", "friends over", "hosting"], add: [["sofa", "nice"]] },
  { words: ["tv", "movies", "netflix"], add: [["tv unit", "nice"]] },
  { words: ["eat", "dining", "dinner", "meals"], add: [["dining table", "nice"]] },
  { words: ["sleep", "light sleeper", "dark"], add: [["curtains", "must"]] },
];

const RANK = { must: 3, nice: 2, optional: 1 };
const WEIGHT = { must: 100, nice: 30, optional: 10 };
const OFF_FLOOR = new Set(["mattress", "lamp", "curtains", "rug"]); // sit on something else or hang
export const MAX_FLOOR_SHARE = 0.5; // keep at least half the floor free to walk

export function planNeeds(room, brief = "", owned = []) {
  const needs = new Map();
  for (const [category, need] of ROOMS[room]) needs.set(category, { category, need, because: `Usual for a ${room}` });
  const heard = [];
  const text = " " + brief.toLowerCase() + " ";
  for (const rule of BRIEF_RULES) {
    const hit = rule.words.find((w) => text.includes(w));
    if (!hit) continue;
    heard.push(hit);
    for (const [category, need] of rule.add) {
      const cur = needs.get(category);
      if (!cur || RANK[need] > RANK[cur.need]) needs.set(category, { category, need, because: `You said "${hit}"` });
    }
  }
  for (const c of owned) needs.delete(c);
  return { needs: [...needs.values()].sort((a, b) => RANK[b.need] - RANK[a.need]), heard, owned };
}

export function fitsRoom(item, room) {
  if (!item.w) return true; // curtains
  const L = room.L * 100, W = room.W * 100, margin = item.category === "rug" ? 60 : 0;
  const a = Math.max(item.w, item.d) + margin, b = Math.min(item.w, item.d) + margin;
  return a <= Math.max(L, W) && b <= Math.min(L, W);
}

function styleScore(item, style) {
  if (item.styles.includes(style)) return 2;
  if (item.styles.includes("any")) return 1;
  return 0;
}

function mattressFits(mattress, bed) {
  const gap = bed.w - mattress.w;
  return gap >= 0 && gap <= 20 && mattress.d <= bed.d;
}

const footprint = (it) => (OFF_FLOOR.has(it.category) || !it.w ? 0 : it.w * it.d);

export function solve({ room, budget, style, needs }, catalog = CATALOG) {
  const area = room.L * room.W * 10000;
  const floorCap = area * MAX_FLOOR_SHARE;
  const options = needs.map((n) =>
    catalog
      .filter((it) => it.category === n.category && fitsRoom(it, room))
      .map((it) => ({ it, s: WEIGHT[n.need] + styleScore(it, style) * 8 }))
      .sort((a, b) => b.s - a.s || a.it.price - b.it.price)
  );
  const best = { score: -1, cost: Infinity, picks: null };
  const maxLeft = needs.map((_, i) => needs.slice(i).reduce((t, n, k) => t + (options[i + k][0] ? options[i + k][0].s : 0), 0));

  (function dfs(i, cost, floor, score, chosen) {
    if (score + (maxLeft[i] || 0) < best.score) return;
    if (i === needs.length) {
      if (score > best.score || (score === best.score && cost < best.cost)) Object.assign(best, { score, cost, picks: chosen.slice() });
      return;
    }
    const n = needs[i];
    for (const { it, s } of options[i]) {
      if (cost + it.price > budget || floor + footprint(it) > floorCap) continue;
      if (it.category === "mattress") {
        const bed = chosen.find((c) => c && c.category === "bed");
        if (bed && !mattressFits(it, bed)) continue;
      }
      chosen.push(it);
      dfs(i + 1, cost + it.price, floor + footprint(it), score + s, chosen);
      chosen.pop();
    }
    if (n.need !== "must") {
      chosen.push(null);
      dfs(i + 1, cost, floor, score, chosen);
      chosen.pop();
    }
  })(0, 0, 0, 0, []);

  if (!best.picks) return explainInfeasible({ room, budget, needs, options });

  const spent = best.cost;
  const floorUsed = best.picks.reduce((t, it) => t + (it ? footprint(it) : 0), 0);
  const picks = [], skipped = [];
  needs.forEach((n, i) => {
    const it = best.picks[i];
    if (it) {
      const sm = styleScore(it, style);
      picks.push({
        ...it, need: n.need,
        why: [n.because + (n.need === "must" ? ", so it is a must-have" : n.need === "nice" ? ", nice to have" : ", optional"),
          sm === 2 ? `Matches your ${style} style` : sm === 1 ? "Neutral style, goes with anything" : `Closest fit in the catalog; not tagged ${style}`],
      });
    } else {
      skipped.push({ category: n.category, need: n.need, why: whySkipped(n, options[i], budget - spent, floorCap - floorUsed, room) });
    }
  });
  return { ok: true, picks, skipped, spent, left: budget - spent, floorShare: floorUsed / area };
}

function whySkipped(n, opts, moneyLeft, floorLeft, room) {
  if (!opts.length) return `Nothing in the catalog fits a ${room.L} × ${room.W} m room`;
  const cheapest = opts.reduce((a, b) => (b.it.price < a.it.price ? b : a)).it;
  if (cheapest.price > moneyLeft) return `Cheapest option is ${inr(cheapest.price)}, only ${inr(moneyLeft)} was left`;
  if (footprint(cheapest) > floorLeft) return "Would take the floor past half the room";
  return "Left out so the budget could go to higher-priority picks";
}

function explainInfeasible({ room, budget, needs, options }) {
  const problems = [];
  let mustCost = 0;
  needs.forEach((n, i) => {
    if (n.need !== "must") return;
    if (!options[i].length) problems.push(`No ${n.category} in the catalog fits a ${room.L} × ${room.W} m room`);
    else mustCost += Math.min(...options[i].map((o) => o.it.price));
  });
  if (mustCost > budget) problems.push(`The must-haves cost at least ${inr(mustCost)}, which is ${inr(mustCost - budget)} over the budget`);
  if (!problems.length) problems.push("The must-haves together take more than half the floor");
  return { ok: false, problems, mustCost };
}

// Rough top-down sketch: floor items go around the walls, tables in the middle, the rug underneath.
export function layout(picks, room) {
  const L = room.L * 100, W = room.W * 100, gap = 10;
  const rects = [], overflow = [];
  const centre = picks.filter((p) => ["coffee table", "dining table"].includes(p.category));
  const wall = picks.filter((p) => !OFF_FLOOR.has(p.category) && p.w && !centre.includes(p)).sort((a, b) => b.w * b.d - a.w * a.d);
  const sides = [
    { len: L, place: (pos, it) => ({ x: pos, y: 0, w: it.w, d: it.d }) },
    { len: W, place: (pos, it) => ({ x: L - it.d, y: pos, w: it.d, d: it.w }) },
    { len: L, place: (pos, it) => ({ x: L - pos - it.w, y: W - it.d, w: it.w, d: it.d }) },
    { len: W, place: (pos, it) => ({ x: 0, y: W - pos - it.w, w: it.d, d: it.w }) },
  ];
  const used = [0, 0, 0, 0];
  for (const it of wall) {
    let placed = false;
    for (let s = 0; s < 4 && !placed; s++) {
      const start = used[s] + (s % 2 === 1 ? Math.max(...wall.map((x) => x.d)) * 0 : 0);
      const r = sides[s].place(start, it);
      if (start + it.w <= sides[s].len && !rects.some((q) => overlap(q, r))) {
        rects.push({ ...r, label: it.name, category: it.category });
        used[s] = start + it.w + gap;
        placed = true;
      }
    }
    if (!placed) overflow.push(it.name);
  }
  centre.forEach((it, k) => {
    const r = { x: (L - it.w) / 2, y: (W - it.d) / 2 + k * (it.d + gap), w: it.w, d: it.d };
    if (rects.some((q) => overlap(q, r))) overflow.push(it.name); else rects.push({ ...r, label: it.name, category: it.category });
  });
  const rug = picks.find((p) => p.category === "rug");
  const under = rug ? [{ x: (L - Math.min(rug.d, L - 60)) / 2, y: (W - Math.min(rug.w, W - 60)) / 2, w: Math.min(rug.d, L - 60), d: Math.min(rug.w, W - 60), label: rug.name, category: "rug" }] : [];
  return { L, W, rects, under, overflow };
}

function overlap(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.d && b.y < a.y + a.d;
}

export function inr(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
