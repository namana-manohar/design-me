// Sample catalog. Every price and size here is illustrative sample data, not a real store's listing.
// Sizes are in centimetres (w = width, d = depth, h = height). Prices are in rupees.
export const CATALOG = [
  // beds (frame only)
  { id: "bed-1", category: "bed", name: "Pine queen bed frame", price: 14500, w: 160, d: 205, h: 90, styles: ["minimal", "scandi"] },
  { id: "bed-2", category: "bed", name: "Sheesham wood queen bed", price: 32000, w: 165, d: 210, h: 100, styles: ["warm", "classic"] },
  { id: "bed-3", category: "bed", name: "Metal single bed", price: 7800, w: 95, d: 195, h: 85, styles: ["minimal", "industrial"] },
  { id: "bed-4", category: "bed", name: "Upholstered bed with storage", price: 41000, w: 168, d: 212, h: 110, styles: ["modern", "warm"] },

  { id: "mat-1", category: "mattress", name: "Coir foam mattress, queen", price: 9500, w: 152, d: 198, h: 15, styles: ["any"] },
  { id: "mat-2", category: "mattress", name: "Pocket spring mattress, queen", price: 21000, w: 152, d: 198, h: 20, styles: ["any"] },
  { id: "mat-3", category: "mattress", name: "Foam mattress, single", price: 5200, w: 91, d: 190, h: 12, styles: ["any"] },

  { id: "war-1", category: "wardrobe", name: "Two-door engineered wood wardrobe", price: 13900, w: 90, d: 55, h: 190, styles: ["minimal", "modern"] },
  { id: "war-2", category: "wardrobe", name: "Three-door wardrobe with mirror", price: 26500, w: 135, d: 58, h: 200, styles: ["classic", "warm"] },
  { id: "war-3", category: "wardrobe", name: "Open steel clothes rack", price: 3900, w: 100, d: 45, h: 180, styles: ["industrial", "minimal"] },

  { id: "sid-1", category: "side table", name: "Round pine side table", price: 2400, w: 40, d: 40, h: 50, styles: ["scandi", "minimal"] },
  { id: "sid-2", category: "side table", name: "Cane bedside table", price: 4200, w: 45, d: 38, h: 55, styles: ["warm", "classic"] },

  { id: "dsk-1", category: "desk", name: "Compact study desk", price: 5900, w: 100, d: 50, h: 75, styles: ["minimal", "scandi"] },
  { id: "dsk-2", category: "desk", name: "Solid wood writing desk", price: 15800, w: 120, d: 60, h: 76, styles: ["warm", "classic"] },
  { id: "dsk-3", category: "desk", name: "Steel frame work desk", price: 8900, w: 120, d: 60, h: 74, styles: ["industrial", "modern"] },

  { id: "chr-1", category: "chair", name: "Mesh office chair", price: 6500, w: 60, d: 60, h: 110, styles: ["modern", "minimal"] },
  { id: "chr-2", category: "chair", name: "Cane study chair", price: 4800, w: 50, d: 52, h: 85, styles: ["warm", "classic"] },
  { id: "chr-3", category: "chair", name: "Ergonomic chair with lumbar support", price: 14900, w: 65, d: 65, h: 120, styles: ["modern"] },

  { id: "sof-1", category: "sofa", name: "Three-seater fabric sofa", price: 28000, w: 200, d: 85, h: 85, styles: ["modern", "minimal"] },
  { id: "sof-2", category: "sofa", name: "Two-seater sofa", price: 17500, w: 150, d: 80, h: 82, styles: ["scandi", "minimal"] },
  { id: "sof-3", category: "sofa", name: "Teak frame sofa with cushions", price: 36000, w: 190, d: 80, h: 80, styles: ["warm", "classic"] },
  { id: "sof-4", category: "sofa", name: "Sofa cum bed", price: 22500, w: 185, d: 90, h: 85, styles: ["modern"] },

  { id: "cof-1", category: "coffee table", name: "Low pine coffee table", price: 4500, w: 90, d: 50, h: 40, styles: ["scandi", "minimal"] },
  { id: "cof-2", category: "coffee table", name: "Sheesham coffee table", price: 9800, w: 100, d: 55, h: 42, styles: ["warm", "classic"] },
  { id: "cof-3", category: "coffee table", name: "Glass top coffee table", price: 7200, w: 95, d: 55, h: 40, styles: ["modern", "industrial"] },

  { id: "tvu-1", category: "tv unit", name: "Low TV unit", price: 6900, w: 140, d: 40, h: 45, styles: ["minimal", "modern"] },
  { id: "tvu-2", category: "tv unit", name: "Wooden TV console with drawers", price: 13500, w: 150, d: 42, h: 55, styles: ["warm", "classic"] },

  { id: "shf-1", category: "bookshelf", name: "Five-shelf bookcase", price: 5600, w: 80, d: 30, h: 180, styles: ["minimal", "scandi"] },
  { id: "shf-2", category: "bookshelf", name: "Ladder bookshelf", price: 4300, w: 60, d: 35, h: 175, styles: ["scandi", "industrial"] },
  { id: "shf-3", category: "bookshelf", name: "Teak bookcase with doors", price: 18900, w: 90, d: 35, h: 190, styles: ["warm", "classic"] },

  { id: "dng-1", category: "dining table", name: "Four-seater dining set", price: 19900, w: 120, d: 75, h: 75, styles: ["minimal", "modern"] },
  { id: "dng-2", category: "dining table", name: "Two-seater dining set", price: 9900, w: 80, d: 70, h: 75, styles: ["scandi", "minimal"] },

  { id: "rug-1", category: "rug", name: "Cotton dhurrie rug", price: 2900, w: 150, d: 210, h: 1, styles: ["warm", "classic", "scandi"] },
  { id: "rug-2", category: "rug", name: "Jute rug", price: 4600, w: 160, d: 230, h: 1, styles: ["scandi", "minimal", "warm"] },
  { id: "rug-3", category: "rug", name: "Small bedside rug", price: 1500, w: 60, d: 120, h: 1, styles: ["any"] },

  { id: "lmp-1", category: "lamp", name: "Table lamp, linen shade", price: 1900, w: 25, d: 25, h: 45, styles: ["scandi", "warm", "minimal"] },
  { id: "lmp-2", category: "lamp", name: "Floor lamp, metal", price: 4400, w: 35, d: 35, h: 160, styles: ["industrial", "modern"] },
  { id: "lmp-3", category: "lamp", name: "Adjustable desk lamp", price: 1600, w: 20, d: 20, h: 45, styles: ["modern", "minimal"] },

  { id: "cur-1", category: "curtains", name: "Blackout curtains, pair", price: 2700, w: 0, d: 0, h: 0, styles: ["any"] },
  { id: "cur-2", category: "curtains", name: "Linen curtains, pair", price: 3800, w: 0, d: 0, h: 0, styles: ["scandi", "warm", "minimal"] },
];
