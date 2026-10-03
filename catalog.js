// Phase 0 catalog: bedrooms only.
// SAMPLE DATA. Prices, sizes, lead times and notes are illustrative, not real listings. The real Phase 0 catalog
// is 200 to 400 hand-curated, currently buyable SKUs with verified dimensions (see docs/05-catalog.md).
//
// Commodity fields: id, name, category, price.
// Decision metadata (the part retail feeds leave out):
//   w, d, h        true dimensions in cm (w runs along the wall, d sticks out into the room)
//   clear          clearance needed in front, in cm (chair pull-out, drawer swing, sitting space)
//   style, finish  style tokens and colour
//   life           longevity tier: budget | standard | durable
//   assembly       easy | moderate | hard
//   lead           days to arrive (what the seller states)
//   fits           compatibility, e.g. mattress size a frame takes
//   lumbar         chair has lumbar support
//   noDrill        rental friendly (no drilling)
//   note           why it is good or bad, written while curating

export const CATALOG = [
  // bed frames
  { id: "bf-1", category: "bed frame", name: "Low pine platform bed", price: 8900, w: 140, d: 200, h: 30, clear: 50, style: ["minimal", "warm-wood"], finish: "oak", life: "standard", assembly: "moderate", lead: 6, fits: "double", note: "Low profile keeps a small room open" },
  { id: "bf-2", category: "bed frame", name: "Metal single bed frame", price: 5200, w: 95, d: 195, h: 40, clear: 50, style: ["minimal", "dark-modern"], finish: "black", life: "standard", assembly: "easy", lead: 4, fits: "single", note: "Cheap and sturdy; slats are thin" },
  { id: "bf-3", category: "bed frame", name: "Sheesham double bed with drawers", price: 18500, w: 150, d: 205, h: 95, clear: 60, style: ["warm-wood"], finish: "walnut", life: "durable", assembly: "hard", lead: 12, fits: "double", note: "Storage drawers, heavy to move" },
  { id: "bf-4", category: "bed frame", name: "White engineered wood single bed", price: 6400, w: 100, d: 200, h: 45, clear: 50, style: ["minimal", "scandi"], finish: "white", life: "budget", assembly: "easy", lead: 5, fits: "single", note: "Edges chip easily" },

  // mattresses
  { id: "mt-1", category: "mattress", name: "Coir and foam mattress, single", price: 4800, w: 91, d: 190, h: 12, clear: 0, style: ["any"], finish: "fabric", life: "standard", assembly: "easy", lead: 3, fits: "single", note: "Firm, good for back support" },
  { id: "mt-2", category: "mattress", name: "Memory foam mattress, double", price: 11900, w: 137, d: 190, h: 15, clear: 0, style: ["any"], finish: "fabric", life: "durable", assembly: "easy", lead: 4, fits: "double", note: "Soft top, sleeps warm" },
  { id: "mt-3", category: "mattress", name: "Foam mattress, single", price: 3200, w: 91, d: 190, h: 10, clear: 0, style: ["any"], finish: "fabric", life: "budget", assembly: "easy", lead: 2, fits: "single", note: "Sags within two years" },

  // study tables
  { id: "st-1", category: "study table", name: "Compact oak-finish desk", price: 4200, w: 100, d: 50, h: 75, clear: 70, style: ["minimal", "warm-wood"], finish: "oak", life: "standard", assembly: "easy", lead: 5, note: "Fits a 100 cm wall, room for a laptop and books" },
  { id: "st-2", category: "study table", name: "Steel frame work desk", price: 5900, w: 120, d: 60, h: 74, clear: 70, style: ["minimal", "dark-modern"], finish: "black", life: "durable", assembly: "moderate", lead: 7, note: "Takes a monitor arm" },
  { id: "st-3", category: "study table", name: "White study table with drawer", price: 3600, w: 90, d: 45, h: 75, clear: 75, style: ["minimal", "scandi"], finish: "white", life: "budget", assembly: "easy", lead: 4, note: "Drawer needs extra clearance" },
  { id: "st-4", category: "study table", name: "Walnut writing desk", price: 9800, w: 110, d: 55, h: 76, clear: 70, style: ["warm-wood"], finish: "walnut", life: "durable", assembly: "moderate", lead: 21, note: "Beautiful, ships slowly" },

  // chairs
  { id: "ch-1", category: "chair", name: "Mesh study chair", price: 3400, w: 58, d: 58, h: 100, clear: 30, style: ["minimal", "dark-modern"], finish: "black", life: "standard", assembly: "easy", lead: 4, lumbar: false, note: "Breathable, no lumbar support" },
  { id: "ch-2", category: "chair", name: "Ergonomic chair with lumbar support", price: 7900, w: 64, d: 64, h: 115, clear: 30, style: ["minimal", "dark-modern"], finish: "black", life: "durable", assembly: "moderate", lead: 6, lumbar: true, adjustable: true, note: "Adjustable lumbar and seat depth" },
  { id: "ch-3", category: "chair", name: "Wooden study chair", price: 2600, w: 45, d: 50, h: 85, clear: 30, style: ["warm-wood", "minimal"], finish: "oak", life: "standard", assembly: "easy", lead: 5, lumbar: false, note: "Hard seat, fine for short sessions" },
  { id: "ch-4", category: "chair", name: "Oak-finish chair with lumbar cushion", price: 5600, w: 52, d: 55, h: 95, clear: 30, style: ["warm-wood", "minimal"], finish: "oak", life: "standard", assembly: "easy", lead: 6, lumbar: true, note: "Fixed lumbar cushion, not adjustable" },

  // storage (open storage, chests, racks)
  { id: "sg-1", category: "storage", name: "Five-shelf open bookcase", price: 3800, w: 80, d: 30, h: 180, clear: 40, style: ["minimal", "scandi"], finish: "oak", life: "standard", assembly: "moderate", lead: 5, noDrill: true, note: "Books and folded clothes" },
  { id: "sg-2", category: "storage", name: "Fabric clothes rack with cover", price: 1900, w: 85, d: 45, h: 170, clear: 50, style: ["minimal"], finish: "grey", life: "budget", assembly: "easy", lead: 3, noDrill: true, note: "Hangs clothes without a wardrobe" },
  { id: "sg-3", category: "storage", name: "Four-drawer chest", price: 6200, w: 75, d: 45, h: 100, clear: 60, style: ["minimal", "warm-wood"], finish: "oak", life: "durable", assembly: "moderate", lead: 8, noDrill: true, note: "Drawers need 60 cm to open" },
  { id: "sg-4", category: "storage", name: "White cube organiser", price: 2700, w: 70, d: 30, h: 105, clear: 40, style: ["minimal", "scandi"], finish: "white", life: "budget", assembly: "easy", lead: 4, noDrill: true, note: "Light, wobbles when full" },

  // wardrobes
  { id: "wd-1", category: "wardrobe", name: "Two-door wardrobe", price: 11500, w: 90, d: 55, h: 190, clear: 60, style: ["minimal"], finish: "white", life: "standard", assembly: "hard", lead: 10, note: "Doors swing 45 cm" },
  { id: "wd-2", category: "wardrobe", name: "Oak-finish sliding wardrobe", price: 16900, w: 120, d: 60, h: 200, clear: 20, style: ["minimal", "warm-wood"], finish: "oak", life: "durable", assembly: "hard", lead: 14, note: "Sliding doors, no swing space" },
  { id: "wd-3", category: "wardrobe", name: "Steel almirah", price: 9500, w: 90, d: 50, h: 185, clear: 55, style: ["dark-modern"], finish: "grey", life: "durable", assembly: "easy", lead: 7, note: "Lasts decades, looks utilitarian" },

  // lighting
  { id: "lt-1", category: "lighting", name: "Adjustable LED desk lamp", price: 1400, w: 18, d: 18, h: 45, clear: 0, style: ["minimal", "dark-modern"], finish: "black", life: "standard", assembly: "easy", lead: 3, onDesk: true, task: true, note: "Warm and cool modes" },
  { id: "lt-2", category: "lighting", name: "Linen shade table lamp", price: 1900, w: 25, d: 25, h: 45, clear: 0, style: ["warm-wood", "scandi", "minimal"], finish: "natural", life: "standard", assembly: "easy", lead: 4, onDesk: true, note: "Soft ambient light, poor for reading" },
  { id: "lt-3", category: "lighting", name: "Clip-on reading lamp", price: 700, w: 10, d: 10, h: 30, clear: 0, style: ["minimal"], finish: "white", life: "budget", assembly: "easy", lead: 2, onDesk: true, task: true, note: "Cheap, clamp loosens" },

  // bedside tables
  { id: "bs-1", category: "bedside table", name: "Round pine side table", price: 1800, w: 40, d: 40, h: 50, clear: 0, style: ["minimal", "scandi", "warm-wood"], finish: "oak", life: "standard", assembly: "easy", lead: 4, note: "Small, no drawer" },
  { id: "bs-2", category: "bedside table", name: "Bedside table with drawer", price: 3200, w: 45, d: 38, h: 55, clear: 35, style: ["minimal", "warm-wood"], finish: "walnut", life: "durable", assembly: "easy", lead: 6, note: "Drawer for chargers and books" },
  { id: "bs-3", category: "bedside table", name: "White nightstand", price: 2100, w: 40, d: 35, h: 50, clear: 30, style: ["scandi", "minimal"], finish: "white", life: "budget", assembly: "easy", lead: 4, note: "Light, laminate peels near water" },

  // rugs
  { id: "rg-1", category: "rug", name: "Cotton dhurrie, 120 × 180 cm", price: 1500, w: 120, d: 180, h: 1, clear: 0, style: ["minimal", "warm-wood", "scandi"], finish: "natural", life: "standard", assembly: "easy", lead: 4, onFloor: true, note: "Washable" },
  { id: "rg-2", category: "rug", name: "Jute rug, 150 × 210 cm", price: 3900, w: 150, d: 210, h: 1, clear: 0, style: ["warm-wood", "scandi"], finish: "natural", life: "durable", assembly: "easy", lead: 6, onFloor: true, note: "Coarse underfoot" },
  { id: "rg-3", category: "rug", name: "Dark grey flatweave, 120 × 170 cm", price: 2200, w: 120, d: 170, h: 1, clear: 0, style: ["dark-modern", "minimal"], finish: "grey", life: "standard", assembly: "easy", lead: 5, onFloor: true, note: "Hides stains" },

  // curtains
  { id: "ct-1", category: "curtains", name: "Blackout curtains, pair", price: 1600, w: 0, d: 0, h: 0, clear: 0, style: ["minimal", "dark-modern"], finish: "grey", life: "standard", assembly: "easy", lead: 3, note: "Blocks street light" },
  { id: "ct-2", category: "curtains", name: "Linen curtains, pair", price: 2400, w: 0, d: 0, h: 0, clear: 0, style: ["minimal", "scandi", "warm-wood"], finish: "natural", life: "standard", assembly: "easy", lead: 5, note: "Soft daylight, not dark" },
  { id: "ct-3", category: "curtains", name: "Sheer white curtains, pair", price: 900, w: 0, d: 0, h: 0, clear: 0, style: ["scandi", "minimal"], finish: "white", life: "budget", assembly: "easy", lead: 2, note: "Privacy by day only" },
];

export const CATEGORIES = ["bed frame", "mattress", "study table", "chair", "storage", "wardrobe", "lighting", "bedside table", "rug", "curtains"];
