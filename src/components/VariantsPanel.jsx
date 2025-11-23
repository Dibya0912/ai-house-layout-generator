// src/components/VariantsPanel.jsx
import React, { useState, useMemo } from 'react';

/**
 * VariantsPanel
 * Props:
 * - variants: [{ id, layout, score }]
 * - onSelect(variant)
 * - selectedId
 *
 * Features:
 * - 2-column thumbnail grid
 * - numeric score badge top-right
 * - selected variant highlighted with glow & thicker border
 * - hover tooltip showing short scoring reasons
 */

export default function VariantsPanel({ variants = [], onSelect, selectedId }) {
  const [hoverId, setHoverId] = useState(null);

  if (!variants || variants.length === 0) return <div style={{ padding: 12 }}>No variants yet</div>;

  // precompute short explanations for each variant (memoized)
  const explanations = useMemo(() => {
    const map = {};
    variants.forEach(v => {
      map[v.id] = explainVariant(v);
    });
    return map;
  }, [variants]);

  return (
    <div style={{
      width: 260,
      padding: 10,
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: '6px 0', fontSize: 14 }}>Variants</h4>
        <div style={{ fontSize: 12, color: '#aab' }}>{variants.length} options</div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        alignItems: 'start'
      }}>
        {variants.map(v => {
          const svg = layoutToThumbSvg(v.layout);
          const selected = selectedId === v.id;
          const hovering = hoverId === v.id;
          return (
            <div key={v.id} style={{ position: 'relative' }}>
              <button
                onClick={() => onSelect && onSelect(v)}
                onMouseEnter={() => setHoverId(v.id)}
                onMouseLeave={() => setHoverId(null)}
                aria-pressed={selected}
                title={`Score: ${Math.round(v.score)}`}
                style={{
                  padding: 0,
                  border: selected ? '3px solid #06b6d4' : '1px solid rgba(0,0,0,0.25)',
                  boxShadow: selected ? '0 6px 18px rgba(6,182,212,0.12)' : 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  borderRadius: 8,
                  overflow: 'hidden',
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />

              {/* score badge */}
              <div style={{
                position: 'absolute',
                right: 6,
                top: 6,
                background: 'linear-gradient(180deg,#111,#222)',
                color: '#fff',
                fontSize: 11,
                padding: '4px 7px',
                borderRadius: 999,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                pointerEvents: 'none'
              }}>
                {Math.round(v.score)}
              </div>

              {/* selected label */}
              {selected && (
                <div style={{
                  position: 'absolute',
                  left: 6,
                  top: 6,
                  background: '#06b6d4',
                  color: '#002',
                  fontSize: 11,
                  padding: '3px 6px',
                  borderRadius: 6,
                  fontWeight: 600
                }}>
                  Selected
                </div>
              )}

              {/* tooltip / explanation */}
              {hovering && explanations[v.id] && (
                <div style={{
                  position: 'absolute',
                  left: '110%',
                  top: 0,
                  width: 220,
                  zIndex: 60,
                  background: '#0b1220',
                  color: '#e6eef6',
                  padding: 8,
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(2,6,23,0.6)',
                  fontSize: 12,
                  lineHeight: '1.3',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Why score: {Math.round(v.score)}</div>
                  <div style={{ opacity: 0.95 }}>
                    {explanations[v.id].map((line, i) => <div key={i}>• {line}</div>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: '#aab' }}>
        Tip: hover thumbnails to see scoring reasons.
      </div>
    </div>
  );
}


/* -----------------------
   Helpers (local)
   ----------------------- */

// create a small thumbnail SVG string from layout (same approach as before)
function layoutToThumbSvg(layout) {
  if (!layout) return '<div/>';
  const { W, H, rooms } = layout;
  const maxW = 170;
  const maxH = 120;
  const scale = Math.min(maxW / W, maxH / H, 1);
  const w = Math.round(W * scale);
  const h = Math.round(H * scale);
  const stroke = Math.max(0.5, 2 / Math.max(1, scale));
  const parts = [];
  parts.push(`<svg width="${w}" height="${h}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;background:#f8f8f8">`);
  rooms.forEach(r => {
    const rx = r.x || 0;
    const ry = r.y || 0;
    const rw = Math.max(2, r.w || 10);
    const rh = Math.max(2, r.h || 10);
    parts.push(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="#fff" stroke="#222" stroke-width="${stroke}" />`);
  });
  parts.push(`</svg>`);
  return parts.join('');
}


// produce short human-friendly reasons using simple heuristics
function explainVariant(variant) {
  const out = [];
  if (!variant || !variant.layout) return out;
  const { W, H, rooms } = variant.layout;

  const find = (prefix) => rooms.find(r => r.label && r.label.toLowerCase().startsWith(prefix));

  // kitchen
  const kitchen = find('kitchen');
  if (kitchen) {
    const kx = kitchen.x + kitchen.w / 2;
    const ky = kitchen.y + kitchen.h / 2;
    if (kx > W * 0.6 && ky > H * 0.6) out.push('Kitchen nicely placed in bottom-right (preferred)');
    else if (kx < W * 0.4 && ky < H * 0.4) out.push('Kitchen in top-left (less ideal)');
    else out.push('Kitchen placement moderate');
  }

  // bedroom 1 (master)
  const bed1 = find('bedroom 1');
  if (bed1) {
    const bx = bed1.x + bed1.w / 2;
    const by = bed1.y + bed1.h / 2;
    if (bx < W * 0.45 && by > H * 0.55) out.push('Master bedroom in bottom-left (good for stability)');
    else out.push('Master bedroom position neutral');
  }

  // living
  const living = find('living');
  if (living) {
    const ly = living.y + living.h / 2;
    if (ly < H * 0.45) out.push('Living area near top — good entrance flow');
  }

  // overlap detection (small)
  let overlapFound = false;
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const a = rooms[i], b = rooms[j];
      const interW = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
      const interH = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      if (interW > 2 && interH > 2) overlapFound = true;
    }
  }
  if (overlapFound) out.push('Minor overlap penalty detected');

  // compactness hint
  const totalPerim = rooms.reduce((s, r) => s + 2 * ((r.w || 0) + (r.h || 0)), 0);
  if (totalPerim > (W + H) * 4) out.push('Layout is spread out (lower compactness score)');

  // fallback
  if (out.length === 0) out.push('Balanced layout — few penalties');

  // limit to 4 lines
  return out.slice(0, 4);
}
