// src/utils/layoutEngine.js
// Day-5: layout generator + variants + scoring + font-size helper
const pxPerMeter = 50;

// base deterministic layout (single source of truth)
export function baseLayout(spec = {}) {
  const { width = 12, height = 8, beds = 2 } = spec;
  const W = Math.round(width * pxPerMeter);
  const H = Math.round(height * pxPerMeter);
  const rooms = [];

  // living room top
  const livingH = Math.round(H * 0.35);
  rooms.push({ x: 0, y: 0, w: W, h: livingH, label: 'Living' });

  // bedrooms row
  const bedRowY = livingH;
  const bedRowH = Math.round(H * 0.4);
  const numBeds = Math.max(1, Number(beds));
  const bedW = Math.floor(W / numBeds);
  for (let i = 0; i < numBeds; i++) {
    rooms.push({ x: i * bedW, y: bedRowY, w: bedW, h: bedRowH, label: `Bedroom ${i + 1}` });
  }

  // bathrooms bottom-left
  const bathW = Math.round(W * 0.25);
  const bathH = Math.round(H * 0.25);
  rooms.push({ x: 0, y: H - bathH, w: bathW, h: bathH, label: 'Bath' });

  // kitchen bottom-right
  const kitchenW = Math.round(W * 0.28);
  rooms.push({ x: W - kitchenW, y: H - bathH, w: kitchenW, h: bathH, label: 'Kitchen' });

  return { W, H, rooms };
}

// small random perturbation to create variants
function jitterLayout(layout, seed = 0) {
  const { W, H, rooms } = layout;
  const newRooms = rooms.map(r => {
    const maxShiftX = Math.max(1, Math.round(W * 0.03));
    const maxShiftY = Math.max(1, Math.round(H * 0.03));
    const dx = Math.round((Math.random() - 0.5) * 2 * maxShiftX);
    const dy = Math.round((Math.random() - 0.5) * 2 * maxShiftY);
    const dw = Math.round((Math.random() - 0.5) * 2 * Math.max(1, Math.round(W * 0.02)));
    const dh = Math.round((Math.random() - 0.5) * 2 * Math.max(1, Math.round(H * 0.02)));
    return {
      ...r,
      x: Math.max(0, Math.min(W - 10, r.x + dx)),
      y: Math.max(0, Math.min(H - 10, r.y + dy)),
      w: Math.max(20, Math.min(W, r.w + dw)),
      h: Math.max(20, Math.min(H, r.h + dh))
    };
  });
  return { W, H, rooms: newRooms };
}

// scoring: simple heuristics (Vastu-ish + compactness + overlap penalty)
function scoreLayout(layout, spec = {}) {
  const { W, H, rooms } = layout;
  const ori = (spec && spec.orientation) || 'north';
  let score = 50; // base

  const find = prefix => rooms.find(r => r.label && r.label.toLowerCase().startsWith(prefix));

  // kitchen preference
  const kitchen = find('kitchen');
  if (kitchen) {
    const cx = kitchen.x + kitchen.w / 2;
    const cy = kitchen.y + kitchen.h / 2;
    if (ori === 'north' || ori === 'east') {
      if (cx > W * 0.6 && cy > H * 0.6) score += 20;
      else if (cx > W * 0.45 && cy > H * 0.45) score += 8;
      else score -= 4;
    } else if (ori === 'south') {
      if (cx < W * 0.4 && cy < H * 0.4) score += 10;
    }
  } else score -= 8;

  // bedroom 1 preference
  const bed1 = find('bedroom 1');
  if (bed1) {
    const cx = bed1.x + bed1.w / 2;
    const cy = bed1.y + bed1.h / 2;
    if (cx < W * 0.45 && cy > H * 0.55) score += 12;
  }

  // living preference (upper center)
  const living = find('living');
  if (living) {
    const cx = living.x + living.w / 2;
    const cy = living.y + living.h / 2;
    if (cy < H * 0.4 && Math.abs(cx - W / 2) < W * 0.25) score += 10;
  }

  // overlap penalty
  let overlapPenalty = 0;
  for (let i = 0; i < rooms.length; i++) {
    const a = rooms[i];
    if (a.x < 0 || a.y < 0 || a.x + a.w > W || a.y + a.h > H) overlapPenalty += 20;
    for (let j = i + 1; j < rooms.length; j++) {
      const b = rooms[j];
      const interW = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
      const interH = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      if (interW > 2 && interH > 2) overlapPenalty += Math.round((interW * interH) / 200);
    }
  }
  score -= overlapPenalty;

  // compactness bonus (lower perimeter => bonus)
  const totalPerim = rooms.reduce((s, r) => s + 2 * (r.w + r.h), 0);
  const compactBonus = Math.max(0, 40 - Math.round(totalPerim / 150));
  score += compactBonus;

  // clamp and return
  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

// generate variants
export function generateVariants(spec = {}, n = 4) {
  const base = baseLayout(spec);
  const variants = [];
  for (let i = 0; i < n; i++) {
    const v = jitterLayout(base, i + 1);
    const s = scoreLayout(v, spec);
    variants.push({ layout: v, score: s, id: `v${i + 1}` });
  }
  variants.sort((a, b) => b.score - a.score);
  return variants;
}

// convenience export: single layout (use baseLayout)
export function generateSingleLayout(spec = {}) {
  return baseLayout(spec);
}

// font-size helper
export function getFontSizeForRoom(r) {
  const minSide = Math.min(r.w || 0, r.h || 0);
  if (minSide > 140) return 14;
  if (minSide > 100) return 12;
  if (minSide > 70) return 10;
  return 0; // too small -> legend
}
