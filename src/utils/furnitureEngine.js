// src/utils/furnitureEngine.js
// Day-14: Smart furniture placement (door-aware, window-aware, oriented sofa/bed)

const pxPerMeter = 50;

// small helpers
function oppositeWall(w) {
  if (w === 'N') return 'S';
  if (w === 'S') return 'N';
  if (w === 'E') return 'W';
  if (w === 'W') return 'E';
  return 'S';
}

function groupByRoom(openings = []) {
  const map = new Map();
  openings.forEach(o => {
    const key = (o.room || '').toLowerCase();
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(o);
  });
  return map;
}

function wallsSet(arr = []) {
  const s = new Set();
  arr.forEach(o => {
    if (o.wall) s.add(o.wall);
  });
  return s;
}

/**
 * For each room, produce an array of furniture items:
 * { type, x, y, w, h, attrs } where coords are in same px space as room.
 *
 * openings: { doors: [{room, wall, x,y,w,h}], windows: [...] }
 */
export function placeFurniture(layout, openings = {}, spec = {}) {
  if (!layout || !layout.rooms) return [];

  const items = [];
  const doorsByRoom = groupByRoom(openings.doors || []);
  const windowsByRoom = groupByRoom(openings.windows || []);

  layout.rooms.forEach(room => {
    const { x, y, w, h, label = '' } = room;
    const key = (label || '').toLowerCase();
    const inset = Math.max(8, Math.round(Math.min(w, h) * 0.06));
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    const roomDoors = doorsByRoom.get(key) || [];
    const roomWindows = windowsByRoom.get(key) || [];
    const doorWalls = wallsSet(roomDoors);
    const windowWalls = wallsSet(roomWindows);
    const blockedWalls = new Set([...doorWalls, ...windowWalls]);

    // ---------- BEDROOM ----------
    if (key.startsWith('bedroom')) {
      // Prefer headboard on walls without window/door, Vastu-ish: W / S / E / N
      const preferredHeadWalls = ['W', 'S', 'E', 'N'];
      let headWall = preferredHeadWalls.find(wall => !blockedWalls.has(wall)) || preferredHeadWalls[0];

      // Bed placement hugging headWall
      let bedW, bedH, bedX, bedY;
      if (headWall === 'N' || headWall === 'S') {
        bedW = Math.round(Math.min(w * 0.7, 160));
        bedH = Math.round(Math.min(h * 0.28, 90));
        bedX = Math.round(centerX - bedW / 2);
        bedY = headWall === 'N'
          ? Math.round(y + inset)
          : Math.round(y + h - inset - bedH);
      } else {
        bedW = Math.round(Math.min(w * 0.32, 120));
        bedH = Math.round(Math.min(h * 0.7, 190));
        bedX = headWall === 'W'
          ? Math.round(x + inset)
          : Math.round(x + w - inset - bedW);
        bedY = Math.round(centerY - bedH / 2);
      }

      items.push({
        type: 'bed',
        x: bedX,
        y: bedY,
        w: bedW,
        h: bedH,
        attrs: {
          rx: 6,
          headWall
        }
      });

      // Wardrobe: try opposite wall of headboard, avoid doors if possible
      const wWallCandidates = [oppositeWall(headWall), headWall];
      let wardrobeWall = wWallCandidates.find(wall => !doorWalls.has(wall)) || wWallCandidates[0];

      if (w > 120 && h > 80) {
        let wardW, wardH, wardX, wardY;
        if (wardrobeWall === 'N' || wardrobeWall === 'S') {
          wardW = Math.round(Math.min(100, w * 0.26));
          wardH = Math.round(Math.min(80, h * 0.18));
          const cx = x + w * 0.75;
          wardX = Math.round(cx - wardW / 2);
          wardY = wardrobeWall === 'N'
            ? Math.round(y + inset)
            : Math.round(y + h - inset - wardH);
        } else {
          wardW = Math.round(Math.min(80, w * 0.22));
          wardH = Math.round(Math.min(120, h * 0.5));
          const cy = y + h * 0.45;
          wardY = Math.round(cy - wardH / 2);
          wardX = wardrobeWall === 'W'
            ? Math.round(x + inset)
            : Math.round(x + w - inset - wardW);
        }

        items.push({
          type: 'wardrobe',
          x: wardX,
          y: wardY,
          w: wardW,
          h: wardH
        });
      }
    }

    // ---------- LIVING ----------
    else if (key.startsWith('living')) {
      // Entry wall = door wall if exists, else bottom
      let entryWall = roomDoors[0]?.wall || 'S';
      let sofaWall = oppositeWall(entryWall); // sofa faces into room, opposite of entry
      if (!['N','S','E','W'].includes(sofaWall)) sofaWall = 'S';

      // Sofa placement hugging sofaWall
      let sofaW, sofaH, sofaX, sofaY, sofaFacing;
      if (sofaWall === 'N' || sofaWall === 'S') {
        sofaW = Math.round(Math.min(w * 0.6, 260));
        sofaH = Math.round(Math.min(h * 0.2, 72));
        sofaX = Math.round(centerX - sofaW / 2);
        sofaY = sofaWall === 'N'
          ? Math.round(y + inset)
          : Math.round(y + h - inset - sofaH);
        sofaFacing = sofaWall === 'N' ? 'S' : 'N';
      } else {
        sofaW = Math.round(Math.min(w * 0.26, 200));
        sofaH = Math.round(Math.min(h * 0.6, 180));
        sofaX = sofaWall === 'W'
          ? Math.round(x + inset)
          : Math.round(x + w - inset - sofaW);
        sofaY = Math.round(centerY - sofaH / 2);
        sofaFacing = sofaWall === 'W' ? 'E' : 'W';
      }

      items.push({
        type: 'sofa',
        x: sofaX,
        y: sofaY,
        w: sofaW,
        h: sofaH,
        attrs: {
          rx: 8,
          facing: sofaFacing
        }
      });

      // Coffee table in front of sofa (towards room center)
      let tableW, tableH, tableX, tableY;
      tableW = Math.round(Math.min(sofaW * 0.35, 90));
      tableH = Math.round(Math.min(sofaH * 0.45, 42));

      if (sofaFacing === 'N') {
        tableX = Math.round(centerX - tableW / 2);
        tableY = sofaY - 10 - tableH;
      } else if (sofaFacing === 'S') {
        tableX = Math.round(centerX - tableW / 2);
        tableY = sofaY + sofaH + 10;
      } else if (sofaFacing === 'E') {
        tableX = sofaX + sofaW + 10;
        tableY = Math.round(centerY - tableH / 2);
      } else { // 'W'
        tableX = sofaX - 10 - tableW;
        tableY = Math.round(centerY - tableH / 2);
      }

      items.push({
        type: 'table',
        x: tableX,
        y: tableY,
        w: tableW,
        h: tableH,
        attrs: { rx: 6 }
      });

      // TV: place opposite sofa, centered on that wall, not on entry wall if possible
      let tvWall = oppositeWall(sofaWall);
      if (tvWall === entryWall && !windowWalls.has(tvWall)) {
        // ok, but if same as entry & has window, we keep; if you want smarter, extend later
      }
      let tvW, tvH, tvX, tvY;
      tvW = Math.round(Math.min(w * 0.45, 220));
      tvH = Math.round(Math.min(36, h * 0.12));

      if (tvWall === 'N') {
        tvX = Math.round(centerX - tvW / 2);
        tvY = Math.round(y + inset);
      } else if (tvWall === 'S') {
        tvX = Math.round(centerX - tvW / 2);
        tvY = Math.round(y + h - inset - tvH);
      } else if (tvWall === 'E') {
        tvW = Math.round(Math.min(40, w * 0.14));
        tvH = Math.round(Math.min(h * 0.55, 160));
        tvX = Math.round(x + w - inset - tvW);
        tvY = Math.round(centerY - tvH / 2);
      } else { // 'W'
        tvW = Math.round(Math.min(40, w * 0.14));
        tvH = Math.round(Math.min(h * 0.55, 160));
        tvX = Math.round(x + inset);
        tvY = Math.round(centerY - tvH / 2);
      }

      items.push({
        type: 'tv',
        x: tvX,
        y: tvY,
        w: tvW,
        h: tvH,
        attrs: { rx: 4 }
      });
    }

    // ---------- KITCHEN ----------
    else if (key.startsWith('kitchen')) {
      // Counter: try along wall with window, else top wall
      const winWalls = Array.from(windowWalls);
      let counterWall = winWalls[0] || 'N';

      let counterW, counterH, counterX, counterY;
      if (counterWall === 'N' || counterWall === 'S') {
        counterW = Math.round(Math.min(w - inset * 2, Math.max(120, w * 0.85)));
        counterH = Math.round(Math.min(50, h * 0.2));
        const cx = centerX;
        counterX = Math.round(cx - counterW / 2);
        counterY = counterWall === 'N'
          ? Math.round(y + inset)
          : Math.round(y + h - inset - counterH);
      } else {
        counterW = Math.round(Math.min(60, w * 0.26));
        counterH = Math.round(Math.min(h - inset * 2, Math.max(120, h * 0.75)));
        counterX = counterWall === 'W'
          ? Math.round(x + inset)
          : Math.round(x + w - inset - counterW);
        const cy = centerY;
        counterY = Math.round(cy - counterH / 2);
      }

      items.push({
        type: 'counter',
        x: counterX,
        y: counterY,
        w: counterW,
        h: counterH,
        attrs: { rx: 4 }
      });

      // Sink: ideally under window if any
      let sinkW = Math.round(Math.min(48, counterH * 0.95));
      let sinkH = sinkW;
      let sinkX, sinkY;

      const win = roomWindows[0];
      if (win && (counterWall === win.wall || !win.wall)) {
        const winCx = win.x + win.w / 2;
        if (counterWall === 'N' || counterWall === 'S') {
          sinkX = Math.round(Math.max(counterX + 6, Math.min(winCx - sinkW / 2, counterX + counterW - sinkW - 6)));
          sinkY = Math.round(counterY + (counterH - sinkH) / 2);
        } else {
          const winCy = win.y + win.h / 2;
          sinkY = Math.round(Math.max(counterY + 6, Math.min(winCy - sinkH / 2, counterY + counterH - sinkH - 6)));
          sinkX = counterWall === 'W'
            ? counterX + Math.round(counterW * 0.2)
            : counterX + Math.round(counterW * 0.1);
        }
      } else {
        // fallback left-on-counter
        sinkX = counterX + Math.round(Math.min(12, counterW * 0.08));
        sinkY = counterY + Math.round((counterH - sinkH) / 2);
      }

      items.push({
        type: 'sink',
        x: sinkX,
        y: sinkY,
        w: sinkW,
        h: sinkH,
        attrs: { rx: 4 }
      });
    }

    // ---------- BATH ----------
    else if (key.startsWith('bath') || key.startsWith('bathroom')) {
      const toiletW = Math.round(Math.min(48, w * 0.25));
      const toiletH = Math.round(Math.min(36, h * 0.22));
      const toiletX = Math.round(x + w - inset - toiletW);
      const toiletY = Math.round(y + h - inset - toiletH);
      items.push({ type: 'toilet', x: toiletX, y: toiletY, w: toiletW, h: toiletH, attrs: { rx: 6 } });

      const basinW = Math.round(Math.min(44, w * 0.22));
      const basinH = Math.round(Math.min(36, h * 0.18));
      const basinX = Math.round(x + inset);
      const basinY = Math.round(y + inset);
      items.push({ type: 'basin', x: basinX, y: basinY, w: basinW, h: basinH, attrs: { rx: 6 } });
    }

    // other rooms: ignore for now
  });

  return items;
}

/**
 * Render furniture items to SVG markup (strings).
 * Adds inline styles so it doesn't depend on external CSS.
 */
export function furnitureItemsToSvg(items = []) {
  const parts = [];
  items.forEach((it, idx) => {
    const { type, x, y, w, h, attrs = {} } = it;
    const rx = attrs.rx ? `rx="${attrs.rx}"` : '';

    if (type === 'bed') {
      parts.push(`
        <rect class="furn bed"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#fecaca" stroke="#b91c1c" stroke-width="1.4" />
      `);
      const pW = Math.round(Math.min(w * 0.3, 36));
      const pH = Math.round(Math.min(h * 0.3, 12));
      const pX = x + w - pW - 8;
      const pY = y + 6;
      parts.push(`
        <rect class="furn bed-pillow"
          x="${pX}" y="${pY}" width="${pW}" height="${pH}" rx="4"
          fill="#fee2e2" stroke="#fecaca" stroke-width="0.8" />
      `);
    } else if (type === 'wardrobe') {
      parts.push(`
        <rect class="furn wardrobe"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#ddd6fe" stroke="#4c1d95" stroke-width="1.2" />
      `);
    } else if (type === 'sofa') {
      parts.push(`
        <rect class="furn sofa"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#bbf7d0" stroke="#166534" stroke-width="1.4" />
      `);
      // facing arrow
      const dir = attrs.facing || 'N';
      const cx = x + w / 2;
      const cy = y + h / 2;
      let ax1 = cx, ay1 = cy, ax2 = cx, ay2 = cy;
      const len = Math.min(w, h) * 0.35;

      if (dir === 'N') { ay1 = cy + len * 0.2; ay2 = cy - len * 0.4; }
      else if (dir === 'S') { ay1 = cy - len * 0.2; ay2 = cy + len * 0.4; }
      else if (dir === 'E') { ax1 = cx - len * 0.2; ax2 = cx + len * 0.4; }
      else { ax1 = cx + len * 0.2; ax2 = cx - len * 0.4; }

      parts.push(`
        <line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}"
          stroke="#166534" stroke-width="2" stroke-linecap="round" />
      `);
    } else if (type === 'table') {
      parts.push(`
        <rect class="furn table"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#fed7aa" stroke="#9a3412" stroke-width="1.2" />
      `);
    } else if (type === 'tv') {
      parts.push(`
        <rect class="furn tv"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#020617" stroke="#0f172a" stroke-width="1.2" />
      `);
    } else if (type === 'counter') {
      parts.push(`
        <rect class="furn counter"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#facc15" stroke="#854d0e" stroke-width="1.1" />
      `);
    } else if (type === 'sink') {
      parts.push(`
        <rect class="furn sink"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1" />
      `);
    } else if (type === 'toilet') {
      parts.push(`
        <rect class="furn toilet"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#e5e7eb" stroke="#4b5563" stroke-width="1" />
      `);
    } else if (type === 'basin') {
      parts.push(`
        <rect class="furn basin"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1" />
      `);
    } else {
      parts.push(`
        <rect class="furn generic"
          x="${x}" y="${y}" width="${w}" height="${h}" ${rx}
          fill="#e5e7eb" stroke="#4b5563" stroke-width="1" />
      `);
    }
  });

  return parts.join('\n');
}
