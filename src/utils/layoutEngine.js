// src/utils/layoutEngine.js
// Variant generator + simple scoring (Vastu-ish + utilization)
// pxPerMeter controls output SVG size.

const pxPerMeter = 50;

function baseLayout(spec) {
  const { width=12, height=8, beds=2, baths=1 } = spec;
  const W = Math.round(width * pxPerMeter);
  const H = Math.round(height * pxPerMeter);
  const rooms = [];
  const livingH = Math.round(H * 0.35);
  rooms.push({ x:0, y:0, w:W, h:livingH, label:'Living' });

  const bedRowY = livingH;
  const bedRowH = Math.round(H * 0.4);
  const numBeds = Math.max(1, Number(beds));
  const bedW = Math.floor(W / numBeds);
  for (let i=0;i<numBeds;i++){
    rooms.push({ x:i*bedW, y:bedRowY, w:bedW, h:bedRowH, label:`Bedroom ${i+1}` });
  }

  const bathW = Math.round(W * 0.25);
  const bathH = Math.round(H * 0.25);
  rooms.push({ x:0, y:H-bathH, w:bathW, h:bathH, label:'Bath' });

  const kitchenW = Math.round(W*0.28);
  rooms.push({ x:W-kitchenW, y:H-bathH, w:kitchenW, h:bathH, label:'Kitchen' });

  return { W, H, rooms };
}

// make small random perturbations to layout to create variants
function jitterLayout(layout, seed=0) {
  const rand = (n=1) => {
    // simple deterministic pseudo-random using seed
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * n;
  };
  const { W, H, rooms } = layout;
  const newRooms = rooms.map(r => {
    const maxShiftX = Math.max(1, Math.round(W * 0.03));
    const maxShiftY = Math.max(1, Math.round(H * 0.03));
    const dx = Math.round((rand() - 0.5) * 2 * maxShiftX);
    const dy = Math.round((rand() - 0.5) * 2 * maxShiftY);
    const dw = Math.round((rand() - 0.5) * 2 * Math.max(1, Math.round(W * 0.02)));
    const dh = Math.round((rand() - 0.5) * 2 * Math.max(1, Math.round(H * 0.02)));
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

// simple Vastu-ish scoring function
// orientation: 'north' | 'east' | 'south' | 'west'
// rules (very simplified):
// - Kitchen prefers SE / East (score boost if kitchen in right-bottom quadrant for north-facing)
// - Master bedroom prefers SW (bottom-left) for stability
// - Penalize overlap (if any) and reward compactness (lower perimeter)
function scoreLayout(layout, spec) {
  const { W, H, rooms } = layout;
  const ori = (spec && spec.orientation) || 'north';
  let score = 0;

  // helper: find room by label start
  const find = (prefix) => rooms.find(r => r.label.toLowerCase().startsWith(prefix));

  // kitchen preference: bottom-right for north-facing or east-facing
  const kitchen = find('kitchen');
  if (kitchen) {
    const cx = kitchen.x + kitchen.w/2;
    const cy = kitchen.y + kitchen.h/2;
    // bottom-right quadrant center coordinates
    if (ori === 'north' || ori === 'east') {
      if (cx > W*0.6 && cy > H*0.6) score += 20;
    } else if (ori === 'south') {
      if (cx < W*0.4 && cy < H*0.4) score += 10;
    }
  }

  // bedroom preference: bottom-left for master (Bedroom 1)
  const bed1 = find('bedroom 1');
  if (bed1) {
    const cx = bed1.x + bed1.w/2;
    const cy = bed1.y + bed1.h/2;
    if (cx < W*0.4 && cy > H*0.55) score += 15;
  }

  // living room centrality: reward living centered near top
  const living = find('living');
  if (living){
    const cx = living.x + living.w/2;
    const cy = living.y + living.h/2;
    // prefer living toward upper center
    if (cy < H*0.4 && Math.abs(cx - W/2) < W*0.25) score += 12;
  }

  // penalize rooms that go out of bounds or overlap
  let overlapPenalty = 0;
  for (let i=0;i<rooms.length;i++){
    const a = rooms[i];
    if (a.x < 0 || a.y < 0 || a.x + a.w > W+1 || a.y + a.h > H+1) overlapPenalty += 30;
    for (let j=i+1;j<rooms.length;j++){
      const b = rooms[j];
      const interW = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
      const interH = Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y));
      if (interW > 2 && interH > 2) overlapPenalty += Math.round(interW * interH / 100);
    }
  }
  score -= overlapPenalty;

  // compactness: total perimeter (lower better)
  const totalPerim = rooms.reduce((s,r)=> s + 2*(r.w + r.h), 0);
  const compactBonus = Math.max(0, 50 - Math.round(totalPerim / 100));
  score += compactBonus;

  // small tie-breaker: prefer variants closer to original width/height
  return score;
}

// generate N variants (deterministic-ish using index as seed)
export function generateVariants(spec, n=4) {
  const base = baseLayout(spec);
  const variants = [];
  for (let i=0;i<n;i++){
    const v = jitterLayout(base, i+1);
    const s = scoreLayout(v, spec);
    variants.push({ layout: v, score: s, id: `v${i+1}` });
  }
  // sort descending by score (best first)
  variants.sort((a,b) => b.score - a.score);
  return variants;
}

// export single layout convenience
export function generateLayout(spec) {
  return baseLayout(spec);
}
