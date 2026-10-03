// Design Me engine, Phase 0 (bedrooms).
// Three engines, never mixed (docs/01-architecture.md):
//   reasoning  understand() and plan(): in the full design these are schema-bound LLM calls. Here they are
//              short, visible rules so the prototype runs without an API key. They never touch a price or size.
//   facts      retrieve(): the only source of products, prices and dimensions is the catalog.
//   math       allocate(): budget and fit arithmetic, deterministic and unit-tested.
// Every decision carries typed evidence with a confidence per claim, and the alternatives it beat, with reasons.
import { CATALOG, CATEGORIES } from "./catalog.js";

const FT = 30.48;
export const DOOR_CM = 90;          // one door, assumed on a wall, so that stretch of wall is not usable
export const FLOOR_CAP = 0.6;       // furniture plus the clearance it needs may cover at most 60% of the floor
export const SLOW_DAYS = 14;
const GAP = 5;                      // cm between pieces along a wall

const SYN = {
  "bed frame": ["bed frame", "bed", "cot"],
  mattress: ["mattress"],
  "study table": ["study table", "desk", "work table", "study desk"],
  chair: ["study chair", "chair"],
  storage: ["storage", "shelves", "shelf", "rack", "drawers", "bookcase"],
  wardrobe: ["wardrobe", "almirah", "cupboard"],
  lighting: ["lighting", "lamp"],
  "bedside table": ["bedside table", "bedside", "side table", "nightstand"],
  rug: ["rug", "carpet", "dhurrie"],
  curtains: ["curtains", "curtain"],
};
const STYLE_WORDS = { minimal: "minimal", minimalist: "minimal", calm: "calm", wooden: "warm-wood", wood: "warm-wood", "warm wood": "warm-wood", scandinavian: "scandi", scandi: "scandi", dark: "dark-modern", modern: "dark-modern" };
const FINISHES = ["white", "black", "oak", "walnut", "grey", "natural"];

function mentions(text, cat) {
  return SYN[cat].some((s) => new RegExp(`\\b${s}s?\\b`).test(text));
}
function direct(text, lead, cat) {
  // "own a mattress", "no space for a wardrobe": the item right after the lead words
  return SYN[cat].some((s) => new RegExp(`\\b(?:${lead})\\s+(?:a |an |my |the |any )?${s}s?\\b`).test(text));
}
function clauseMentions(text, lead, cat) {
  // "need a desk, chair and lamp" -> the clause after the lead word, up to a full stop or semicolon
  const re = new RegExp(`\\b(?:${lead})\\b([^.;\\n]*)`, "g");
  let m;
  while ((m = re.exec(text))) if (mentions(m[1], cat)) return true;
  return false;
}

// ---------- 1. Understanding (rules standing in for the LLM; never invents a budget) ----------
export function understand(brief) {
  const t = " " + brief.toLowerCase().replace(/×/g, "x").replace(/\s+/g, " ") + " ";
  const p = { budget: { value: null, conf: 0 }, room: { L: null, W: null, unit: null, conf: 0 }, owned: [], must: [], cannot: [], style: { tokens: [], conf: 0 }, dislike: [], back: false, study: false, notes: [] };

  const money = t.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|l)?\b/) || t.match(/\b([\d.]+)\s*(k|lakh)\b/) || t.match(/budget (?:of |is |around )?([\d,]{4,})/);
  if (money) {
    let v = parseFloat(money[1].replace(/,/g, ""));
    const unit = money[2];
    if (unit === "k") v *= 1000;
    if (unit === "lakh" || unit === "l") v *= 100000;
    const symbol = /₹|rs|inr/.test(money[0]);
    p.budget = { value: Math.round(v), conf: symbol || /budget/.test(money[0]) ? 0.95 : 0.8 };
  }
  const dim = t.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|m|metres|meters|metre|meter)?\b/);
  if (dim) {
    const metric = dim[3] && dim[3].startsWith("m");
    const k = metric ? 100 : FT;
    p.room = { L: +dim[1], W: +dim[2], unit: metric ? "m" : "ft", Lcm: +dim[1] * k, Wcm: +dim[2] * k, conf: dim[3] ? 0.95 : 0.6 };
    if (!dim[3]) p.notes.push({ q: true, text: `Room ${dim[1]} × ${dim[2]}: feet? (assumed)` });
  }
  for (const cat of CATEGORIES) {
    if (direct(t, "already own|already owns|already have|already has|own|owns", cat)) p.owned.push(cat);
    if (direct(t, "no space for|no room for|cannot buy|can't buy|cant buy|don't want|do not want|no", cat)) p.cannot.push(cat);
    if (clauseMentions(t, "need|needs|must have|must-have|want", cat) && !p.owned.includes(cat) && !p.cannot.includes(cat)) p.must.push(cat);
  }
  for (const f of FINISHES) if (new RegExp(`\\b(?:dislike|dislikes|hate|hates|no|not|avoid)\\s+(?:\\w+\\s+)?${f}\\b`).test(t)) p.dislike.push(f);
  for (const [w, tok] of Object.entries(STYLE_WORDS)) if (new RegExp(`\\b${w}\\b`).test(t) && !p.style.tokens.includes(tok)) p.style.tokens.push(tok);
  if (p.style.tokens.length) p.style.conf = 0.7;
  if (p.style.tokens.includes("calm")) {
    p.notes.push({ q: true, text: "Calm: fewer items, or natural textures? (read as both)" });
    p.style.tokens = p.style.tokens.filter((x) => x !== "calm");
    if (!p.style.tokens.includes("minimal")) p.style.tokens.push("minimal");
    p.style.prefersNatural = true;
  }
  p.back = /\bback (?:issue|issues|pain|problem|problems)\b/.test(t);
  p.study = /\b(student|study|studying|work from home|wfh|exam|exams)\b/.test(t);
  return p;
}

// Clarify gate (deterministic): ask one question only when a critical field is missing.
export function clarify(profile) {
  if (!profile.budget.value) return { field: "budget", question: "What is the most you want to spend, in rupees?" };
  if (!profile.room.L) return { field: "room", question: "How big is the room? For example 10 × 10 ft." };
  return null;
}

// ---------- 2. Plan (ontology-bounded; owned and excluded items subtracted deterministically) ----------
const RANK = { essential: 3, recommended: 2, optional: 1 };
export function plan(profile) {
  const items = [], excluded = [];
  const add = (category, necessity, why, conf) => items.push({ category, necessity, why, conf });
  const owns = (c) => profile.owned.includes(c);
  const out = (c) => profile.cannot.includes(c);

  for (const cat of CATEGORIES) {
    if (owns(cat)) { excluded.push({ category: cat, why: "You already own one" }); continue; }
    if (out(cat)) { excluded.push({ category: cat, why: "You said not to buy one" }); continue; }
    const must = profile.must.includes(cat);
    switch (cat) {
      case "bed frame":
        if (owns("mattress")) add(cat, must ? "essential" : "recommended", must ? "You asked for it" : "Your mattress can sit on the floor for now, so a frame can wait if money is tight", 0.7);
        else add(cat, "essential", must ? "You asked for it" : "You need somewhere to sleep", 0.9);
        break;
      case "mattress": add(cat, "essential", "You need something to sleep on", 0.95); break;
      case "study table": add(cat, must || profile.study ? "essential" : "optional", must ? "You asked for it" : profile.study ? "You study or work in this room" : "Only if you work here", must ? 0.95 : 0.75); break;
      case "chair": add(cat, must || profile.study || profile.back ? "essential" : "optional", profile.back ? "You mentioned back trouble, so the chair matters" : must ? "You asked for it" : "Goes with the study table", 0.85); break;
      case "storage": add(cat, "essential", must ? "You asked for it" : out("wardrobe") ? "No wardrobe, so clothes and books need open storage" : "Clothes and books need a home", 0.9); break;
      case "wardrobe": if (must) add(cat, "essential", "You asked for it", 0.95); else excluded.push({ category: cat, why: "Open storage covers it for less money and floor" }); break;
      case "lighting": add(cat, must || profile.study ? "essential" : "recommended", must ? "You asked for it" : profile.study ? "A desk needs task light" : "Ceiling light alone is harsh", 0.85); break;
      case "bedside table": add(cat, must ? "essential" : "optional", must ? "You asked for it" : "Handy, not needed", 0.6); break;
      case "rug": add(cat, must ? "essential" : "optional", must ? "You asked for it" : "Softens the room, first to cut", 0.5); break;
      case "curtains": add(cat, must ? "essential" : "recommended", must ? "You asked for it" : "Privacy and better sleep", 0.7); break;
    }
  }
  if (items.some((i) => i.category === "chair") && !items.some((i) => i.category === "study table") && !owns("study table")) {
    const c = items.find((i) => i.category === "chair"); if (c.necessity !== "essential") c.necessity = "optional";
  }
  items.sort((a, b) => RANK[b.necessity] - RANK[a.necessity]);
  return { items, excluded };
}

// ---------- 3 + 4. Spec and retrieval (deterministic; no invented products) ----------
export function retrieve(item, profile, catalog = CATALOG) {
  const room = profile.room, short = Math.min(room.Lcm, room.Wcm), long = Math.max(room.Lcm, room.Wcm);
  const candidates = [], filtered = [];
  for (const it of catalog.filter((x) => x.category === item.category)) {
    let reason = null;
    if (it.w && (Math.max(it.w, it.d + it.clear) > long || Math.min(it.w, it.d + it.clear) > short) && !it.onFloor) reason = `Too big: needs ${it.w} × ${it.d + it.clear} cm with clearance`;
    else if (it.onFloor && (it.w > short - 40 || it.d > long - 40)) reason = `Too big for the floor: ${it.w} × ${it.d} cm`;
    else if (profile.dislike.includes(it.finish)) reason = `${capital(it.finish)} finish, and you dislike ${it.finish}`;
    else if (item.category === "chair" && profile.back && !it.lumbar) reason = "No lumbar support, and you mentioned back trouble";
    else if (item.category === "lighting" && profile.study && !it.task) reason = "Ambient light, too weak to study by";
    if (reason) { filtered.push({ it, reason }); continue; }
    candidates.push({ it, soft: softScore(it, profile) });
  }
  candidates.sort((a, b) => b.soft - a.soft || a.it.price - b.it.price);
  return { candidates, filtered };
}

function softScore(it, profile) {
  let s = 0;
  if (it.style.includes("any")) s += 1;
  for (const tok of profile.style.tokens) if (it.style.includes(tok)) s += 2;
  if (profile.style.prefersNatural && ["oak", "walnut", "natural"].includes(it.finish)) s += 1;
  if (profile.back && it.adjustable) s += 3;
  s += { budget: 0, standard: 1, durable: 2 }[it.life];
  if (it.lead > SLOW_DAYS) s -= 2;
  return s;
}

// ---------- 5. Allocation (deterministic budget and fit math) ----------
const WEIGHT = { essential: 1000, recommended: 20, optional: 6 };
const SOFT = { essential: 8, recommended: 4, optional: 2 }; // quality on essentials beats buying extras (Law 3)
export function wallNeed(it) { return it.w && !it.onDesk && !it.onFloor && it.category !== "mattress" ? it.w + GAP : 0; }
export function floorNeed(it) { return it.w && !it.onDesk && !it.onFloor && it.category !== "mattress" ? it.w * (it.d + it.clear) : 0; }
export function roomCapacity(room) { return { wall: 2 * (room.Lcm + room.Wcm) - DOOR_CM, floor: room.Lcm * room.Wcm * FLOOR_CAP }; }

function compatible(chosen, it) {
  const frame = it.category === "bed frame" ? it : chosen.find((c) => c && c.category === "bed frame");
  const mat = it.category === "mattress" ? it : chosen.find((c) => c && c.category === "mattress");
  return !(frame && mat) || frame.fits === mat.fits;
}

export function allocate(items, pools, profile, { locked = {} } = {}) {
  const budget = profile.budget.value, cap = roomCapacity(profile.room);
  const opts = items.map((item, i) => {
    let c = pools[i].candidates;
    if (locked[item.category]) c = c.filter((x) => x.it.id === locked[item.category]);
    return c;
  });
  const best = { score: -1, cost: Infinity, pick: null };
  const bound = items.map((_, i) => items.slice(i).reduce((t, it, k) => t + WEIGHT[it.necessity] + Math.max(0, ...opts[i + k].map((o) => o.soft)) * SOFT[it.necessity], 0));
  (function dfs(i, cost, wall, floor, score, chosen) {
    if (score + (bound[i] || 0) < best.score) return;
    if (i === items.length) {
      if (score > best.score || (score === best.score && cost < best.cost)) Object.assign(best, { score, cost, pick: chosen.slice() });
      return;
    }
    for (const { it, soft } of opts[i]) {
      if (cost + it.price > budget || wall + wallNeed(it) > cap.wall || floor + floorNeed(it) > cap.floor || !compatible(chosen, it)) continue;
      chosen.push(it);
      dfs(i + 1, cost + it.price, wall + wallNeed(it), floor + floorNeed(it), score + WEIGHT[items[i].necessity] + soft * SOFT[items[i].necessity], chosen);
      chosen.pop();
    }
    if (items[i].necessity !== "essential") { chosen.push(null); dfs(i + 1, cost, wall, floor, score, chosen); chosen.pop(); }
  })(0, 0, 0, 0, 0, []);
  return best.pick ? { ok: true, pick: best.pick, spent: best.cost } : { ok: false };
}

// Feasibility report when the essentials cannot be done (never silently trims an essential).
export function feasibility(items, pools, profile) {
  const budget = profile.budget.value, cap = roomCapacity(profile.room), lines = [];
  const essentials = items.map((it, i) => ({ it, pool: pools[i] })).filter((x) => x.it.necessity === "essential");
  const missing = essentials.filter((x) => !x.pool.candidates.length);
  for (const m of missing) lines.push(`No ${m.it.category} in the catalog passes your constraints (${m.pool.filtered.map((f) => f.reason.toLowerCase()).slice(0, 2).join("; ")})`);
  if (!missing.length) {
    const cheapest = essentials.map((x) => x.pool.candidates.reduce((a, b) => (b.it.price < a.it.price ? b : a)).it);
    const cost = cheapest.reduce((t, it) => t + it.price, 0);
    const wall = cheapest.reduce((t, it) => t + wallNeed(it), 0);
    if (cost > budget) {
      const names = essentials.map((x) => x.it.category).join(" + ");
      const droppable = essentials.filter((x) => !profile.must.includes(x.it.category)).map((x, k) => ({ cat: x.it.category, price: cheapest[essentials.indexOf(x)].price })).sort((a, b) => b.price - a.price)[0];
      lines.push(`Can't fit ${names} under ${inr(budget)}. The cheapest set is ${inr(cost)}: raise ${inr(cost - budget)}${droppable ? `, or drop the ${droppable.cat}` : ""}.`);
    } else if (wall > cap.wall) {
      lines.push(`Not enough wall: the essentials need ${Math.round(wall)} cm, the room has about ${Math.round(cap.wall)} cm after the door.`);
    } else {
      lines.push("The essentials don't fit together on the floor with the clearance they need. Try a bigger room size or remove one essential.");
    }
  }
  return lines;
}

// ---------- 6. Decisions: typed evidence, per-claim confidence, rejections ----------
export function decide(profile, { locked = {}, removed = [], added = [] } = {}) {
  const plan0 = plan(profile);
  // Law 3, buy less: optional pieces are offered, never bought by default
  const all = plan0.items.filter((i) => !removed.includes(i.category))
    .map((i) => (added.includes(i.category) && i.necessity === "optional" ? { ...i, necessity: "recommended", why: "You added it" } : i));
  const items = all.filter((i) => i.necessity !== "optional");
  const optionalItems = all.filter((i) => i.necessity === "optional");
  const removedItems = plan0.items.filter((i) => removed.includes(i.category)).map((i) => ({ category: i.category, why: "You removed it" }));
  const pools = items.map((it) => retrieve(it, profile));
  const alloc = allocate(items, pools, profile, { locked });
  if (!alloc.ok) return { ok: false, plan: { items, excluded: [...plan0.excluded, ...removedItems] }, problems: feasibility(items, pools, profile) };

  const budget = profile.budget.value, left = budget - alloc.spent, cap = roomCapacity(profile.room);
  const usedWall = alloc.pick.reduce((t, it) => t + (it ? wallNeed(it) : 0), 0);
  const usedFloor = alloc.pick.reduce((t, it) => t + (it ? floorNeed(it) : 0), 0);
  const decisions = [], skipped = [];

  items.forEach((item, i) => {
    const it = alloc.pick[i];
    if (!it) { skipped.push({ category: item.category, necessity: item.necessity, why: whySkipped(item, pools[i], left, cap.wall - usedWall, cap.floor - usedFloor) }); return; }
    const ev = [];
    if (it.w && !it.onDesk) ev.push(it.onFloor
      ? { type: "fact", load: true, conf: profile.room.conf, text: `${it.w} × ${it.d} cm rug fits your ${roomLabel(profile.room)} floor` }
      : { type: "fact", load: true, conf: profile.room.conf, text: `Fits: ${it.w} cm of wall and ${it.d + it.clear} cm into the room with clearance, in your ${roomLabel(profile.room)} room` });
    if (it.onDesk) ev.push({ type: "fact", load: true, conf: 0.95, text: "Sits on the desk, so it takes no floor" });
    ev.push({ type: "fact", load: true, conf: profile.budget.conf, text: `${inr(it.price)}; the whole plan leaves ${inr(left)} of your ${inr(budget)}` });
    if (it.category === "bed frame" || it.category === "mattress") {
      const other = alloc.pick.find((c) => c && c.category === (it.category === "bed frame" ? "mattress" : "bed frame"));
      if (other) ev.push({ type: "fact", load: true, conf: 0.95, text: `Takes a ${it.fits} mattress, same size as the ${other.name.toLowerCase()}` });
      else if (it.category === "bed frame" && profile.owned.includes("mattress")) ev.push({ type: "inference", load: true, conf: 0.35, text: `Takes a ${it.fits} mattress. You didn't say your mattress size: check it before buying` });
      else if (it.category === "mattress" && profile.owned.includes("bed frame")) ev.push({ type: "inference", load: true, conf: 0.35, text: `This is a ${it.fits} mattress. You didn't say your bed frame's size: check it before buying` });
    }
    if (it.category === "chair" && profile.back) ev.push({ type: "fact", load: true, conf: 0.9, text: "Has lumbar support (from the product spec)" });
    const matched = profile.style.tokens.filter((t) => it.style.includes(t));
    ev.push(matched.length
      ? { type: "preference", load: false, conf: null, text: `Matches the ${matched.join(" and ")} look, ${it.finish} finish. Your call` }
      : { type: "preference", load: false, conf: null, text: `${capital(it.finish)} finish; not tagged with your style. Your call` });
    ev.push({ type: "inference", load: it.lead > SLOW_DAYS, conf: 0.6, text: `Seller says it arrives in ${it.lead} days; listings tend to be optimistic` });
    if (it.assembly !== "easy") ev.push({ type: "fact", load: false, conf: 0.8, text: `Assembly: ${it.assembly}` });

    const loadConfs = ev.filter((e) => e.load).map((e) => e.conf);
    const weakest = Math.min(...loadConfs);
    const weakClaim = ev.find((e) => e.load && e.conf === weakest);
    decisions.push({
      category: item.category, necessity: item.necessity, why: item.why, chosen: it, evidence: ev,
      confidence: { value: weakest, label: weakest >= 0.85 ? "high" : weakest >= 0.6 ? "moderate" : "low", weakest: weakClaim.text },
      rejections: rejectionsFor(it, pools[i], left, profile),
    });
  });
  const optional = optionalItems.map((o) => {
    const pool = retrieve(o, profile);
    if (!pool.candidates.length) return { category: o.category, why: o.why, price: null, affordable: false };
    const cheapest = pool.candidates.reduce((a, b) => (b.it.price < a.it.price ? b : a)).it;
    return { category: o.category, why: o.why, price: cheapest.price, affordable: cheapest.price <= left };
  });
  return { ok: true, plan: { items, excluded: [...plan0.excluded, ...removedItems] }, decisions, skipped, optional, spent: alloc.spent, left, budget, wall: { used: usedWall, cap: cap.wall }, floor: { used: usedFloor, cap: cap.floor } };
}

function rejectionsFor(chosen, pool, left, profile) {
  const out = [];
  for (const { it } of pool.candidates) {
    if (it.id === chosen.id) continue;
    const diff = it.price - chosen.price;
    let reason;
    if (diff > left) reason = `${inr(diff)} more would put the plan ${inr(diff - left)} over budget`;
    else if (it.lead > SLOW_DAYS) reason = `Arrives in ${it.lead} days`;
    else if (diff < 0) reason = `${inr(-diff)} cheaper, but ${weaker(it, chosen, profile)}`;
    else reason = `${inr(diff)} more, and ${weaker(it, chosen, profile, true)}`;
    out.push({ name: it.name, id: it.id, price: it.price, reason });
  }
  for (const { it, reason } of pool.filtered) out.push({ name: it.name, id: it.id, price: it.price, reason, hard: true });
  return out;
}

function weaker(it, chosen, profile, pricier) {
  const tier = { budget: 0, standard: 1, durable: 2 };
  if (tier[it.life] < tier[chosen.life]) return `${it.life}-tier build (${it.note.toLowerCase()})`;
  const m = (x) => profile.style.tokens.filter((t) => x.style.includes(t)).length;
  if (m(it) < m(chosen)) return "a weaker match for your style";
  if (it.lead > chosen.lead) return `arrives later (${it.lead} days)`;
  if (floorNeed(it) > floorNeed(chosen)) return "takes more floor";
  return pricier ? "no better on fit, style or build" : `${it.note.toLowerCase()}`;
}

function whySkipped(item, pool, left, wallLeft, floorLeft) {
  if (!pool.candidates.length) return pool.filtered.length ? `Nothing passes your constraints: ${pool.filtered[0].reason.toLowerCase()}` : "Nothing in the catalog";
  const cheapest = pool.candidates.reduce((a, b) => (b.it.price < a.it.price ? b : a)).it;
  if (cheapest.price > left) return `Cheapest is ${inr(cheapest.price)}, which would go over by ${inr(cheapest.price - left)}`;
  if (wallNeed(cheapest) > wallLeft || floorNeed(cheapest) > floorLeft) return "No floor or wall left for it with clearance";
  return "Left out so money went to higher-priority items";
}

export function roomLabel(room) { return `${room.L} × ${room.W} ${room.unit}`; }
export function inr(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }
function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export const BENCHMARK_001 = "Student moving into a first apartment bedroom. Budget ₹20,000. Room is 10 x 10 ft. I already own a mattress. I need a study table, chair, lighting and storage. No space for a wardrobe. Minimal, calm.";
export const HELD_OUT = "Working professional, calm bedroom, I have back issues so I want a good chair. I already own a bed frame. Room 9 x 11 ft, ₹35,000. I dislike white furniture.";
