// src/utils/furnitureEngine.js
// Simple deterministic furniture placer (Day-8).
// Uses room coords/size in px (same pxPerMeter as layoutEngine) and returns SVG elements.

const pxPerMeter = 50;

/**
 * For each room, produce an array of furniture items:
 * { type, x, y, w, h, attrs } where coords are in same px space as room.
 */
export function placeFurniture(layout) {
  if (!layout || !layout.rooms) return [];
  const items = [];

  layout.rooms.forEach(room => {
    const { x, y, w, h, label = '' } = room;
    const key = (label || '').toLowerCase();

    // helper helpers
    const inset = Math.max(8, Math.round(Math.min(w, h) * 0.06)); // padding from walls
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    // Bedroom: bed + wardrobe if room big enough
    if (key.startsWith('bedroom')) {
      // Bed: centered horizontally, placed on bottom half
      const bedW = Math.round(Math.min(w * 0.7, 160));
      const bedH = Math.round(Math.min(h * 0.28, 90));
      const bedX = Math.round(centerX - bedW / 2);
      const bedY = Math.round(y + h - inset - bedH);
      items.push({ type: 'bed', x: bedX, y: bedY, w: bedW, h: bedH, attrs: { rx: 6 } });

      // Wardrobe: along top wall, if enough width
      if (w > 140) {
        const wardW = Math.round(Math.min(100, w * 0.22));
        const wardH = Math.round(Math.min(90, h * 0.18));
        const wardX = Math.round(x + w - inset - wardW);
        const wardY = Math.round(y + inset);
        items.push({ type: 'wardrobe', x: wardX, y: wardY, w: wardW, h: wardH });
      }
    }

    // Living: sofa + tv + table
    else if (key.startsWith('living')) {
      // Sofa: placed along bottom
      const sofaW = Math.round(Math.min(w * 0.6, 260));
      const sofaH = Math.round(Math.min(h * 0.18, 70));
      const sofaX = Math.round(centerX - sofaW / 2);
      const sofaY = Math.round(y + h - inset - sofaH);
      items.push({ type: 'sofa', x: sofaX, y: sofaY, w: sofaW, h: sofaH, attrs: { rx: 8 } });

      // Coffee table: small rect centered above sofa
      const tableW = Math.round(Math.min(sofaW * 0.32, 80));
      const tableH = Math.round(Math.min(sofaH * 0.9, 40));
      const tableX = Math.round(centerX - tableW / 2);
      const tableY = Math.round(sofaY - inset - tableH);
      items.push({ type: 'table', x: tableX, y: tableY, w: tableW, h: tableH, attrs: { rx: 6 } });

      // TV unit: top wall centered
      const tvW = Math.round(Math.min(w * 0.5, 240));
      const tvH = Math.round(Math.min(36, h * 0.12));
      const tvX = Math.round(centerX - tvW / 2);
      const tvY = Math.round(y + inset);
      items.push({ type: 'tv', x: tvX, y: tvY, w: tvW, h: tvH, attrs: { rx: 4 } });
    }

    // Kitchen: counter along one side + sink box
    else if (key.startsWith('kitchen')) {
      // Counter: along top wall
      const counterW = Math.round(Math.min(w - inset * 2, Math.max(120, w * 0.85)));
      const counterH = Math.round(Math.min(48, h * 0.18));
      const counterX = Math.round(x + inset);
      const counterY = Math.round(y + inset);
      items.push({ type: 'counter', x: counterX, y: counterY, w: counterW, h: counterH, attrs: { rx: 4 } });

      // Sink: small square on counter, left side
      const sinkW = Math.round(Math.min(48, counterH * 0.95));
      const sinkH = sinkW;
      const sinkX = counterX + Math.round(Math.min(12, counterW * 0.06));
      const sinkY = counterY + Math.round((counterH - sinkH) / 2);
      items.push({ type: 'sink', x: sinkX, y: sinkY, w: sinkW, h: sinkH, attrs: { rx: 4 } });
    }

    // Bath: toilet + basin
    else if (key.startsWith('bath') || key.startsWith('bathroom')) {
      // Toilet: bottom-right corner
      const toiletW = Math.round(Math.min(48, w * 0.25));
      const toiletH = Math.round(Math.min(36, h * 0.18));
      const toiletX = Math.round(x + w - inset - toiletW);
      const toiletY = Math.round(y + h - inset - toiletH);
      items.push({ type: 'toilet', x: toiletX, y: toiletY, w: toiletW, h: toiletH, attrs: { rx: 6 } });

      // Basin: top-left corner
      const basinW = Math.round(Math.min(44, w * 0.22));
      const basinH = Math.round(Math.min(36, h * 0.18));
      const basinX = Math.round(x + inset);
      const basinY = Math.round(y + inset);
      items.push({ type: 'basin', x: basinX, y: basinY, w: basinW, h: basinH, attrs: { rx: 6 } });
    }

    // fallback: nothing
  });

  return items;
}

/**
 * Render furniture items to SVG markup (strings).
 * Colors / strokes chosen to be visible on white backgrounds.
 */
export function furnitureItemsToSvg(items = []) {
  const parts = [];
  items.forEach((it, idx) => {
    const { type, x, y, w, h, attrs = {} } = it;
    const rx = attrs.rx ? `rx="${attrs.rx}"` : '';
    // different styles per type
    if (type === 'bed') {
      parts.push(`<rect class="furn bed" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
      // pillow indicator
      const pW = Math.round(Math.min( w*0.3, 36));
      const pH = Math.round(Math.min(h*0.3, 12));
      const pX = x + w - pW - 8;
      const pY = y + 6;
      parts.push(`<rect class="furn bed-pillow" x="${pX}" y="${pY}" width="${pW}" height="${pH}" rx="4"/>`);
    } else if (type === 'wardrobe') {
      parts.push(`<rect class="furn wardrobe" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
    } else if (type === 'sofa') {
      parts.push(`<rect class="furn sofa" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
    } else if (type === 'table') {
      parts.push(`<rect class="furn table" x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.max(4, (attrs.rx||0))}" />`);
    } else if (type === 'tv') {
      parts.push(`<rect class="furn tv" x="${x}" y="${y}" width="${w}" height="${h}" rx="${attrs.rx||2}" />`);
    } else if (type === 'counter') {
      parts.push(`<rect class="furn counter" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
    } else if (type === 'sink') {
      parts.push(`<rect class="furn sink" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
    } else if (type === 'toilet') {
      parts.push(`<rect class="furn toilet" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
    } else if (type === 'basin') {
      parts.push(`<rect class="furn basin" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
    } else {
      parts.push(`<rect class="furn generic" x="${x}" y="${y}" width="${w}" height="${h}" ${rx} />`);
    }
  });
  return parts.join('\n');
}
