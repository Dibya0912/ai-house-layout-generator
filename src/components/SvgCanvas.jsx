// src/components/SvgCanvas.jsx
import React, { useEffect, useRef, useState } from 'react';
import { placeFurniture, furnitureItemsToSvg } from '../utils/furnitureEngine';
import { generateOpenings } from '../utils/layoutEngine';

const GRID_SIZE = 20; // px – used for both grid lines and snapping
const PX_PER_METER_FALLBACK = 50; // keep consistent with layoutEngine pxPerMeter

export default function SvgCanvas({ layout, setLayout, spec = {}, scale = 1, setScale = () => {} }) {
  const wrapperRef = useRef(null);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showDoors, setShowDoors] = useState(true);
  const [showWindows, setShowWindows] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Measurement state
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]); // [{x,y}, {x,y}]
  const [measureDistance, setMeasureDistance] = useState(null); // meters

  // Grid toggle
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollLeft = 0;
      wrapperRef.current.scrollTop = 0;
    }
    // reset measurement on layout change
    setMeasuring(false);
    setMeasurePoints([]);
    setMeasureDistance(null);
  }, [layout]);

  const wallThickness = Number(spec.wallThickness ?? 2);

  function roomFill(label) {
    if (!label) return '#ffffff';
    const s = label.toLowerCase();
    if (s.includes('bed')) return '#e6f0ff';
    if (s.includes('living')) return '#fff9e6';
    if (s.includes('kitchen')) return '#ffeef0';
    if (s.includes('bath')) return '#eafff1';
    return '#ffffff';
  }

  function updateRooms(mutateFn) {
    if (!layout || !setLayout) return;
    const updated = JSON.parse(JSON.stringify(layout));
    if (!updated.rooms) return;
    mutateFn(updated.rooms, updated);

    const { W, H } = updated;
    updated.rooms.forEach(r => {
      if (r.x < 0) r.x = 0;
      if (r.y < 0) r.y = 0;
      if (r.x + r.w > W) r.x = Math.max(0, W - r.w);
      if (r.y + r.h > H) r.y = Math.max(0, H - r.h);
    });

    setLayout(updated);
    window.__currentLayout = updated;
    console.log('Updated layout:', updated);
  }

  function selectRoom(label) {
    setSelectedRoom(label);
    console.log('Selected room:', label);
  }

  function moveRoom(dx, dy) {
    if (!selectedRoom) return;
    updateRooms((rooms) => {
      const room = rooms.find(r => r.label === selectedRoom);
      if (!room) return;
      const grid = GRID_SIZE; // snap to grid
      room.x = Math.round((room.x + dx) / grid) * grid;
      room.y = Math.round((room.y + dy) / grid) * grid;
    });
  }

  function resizeRoom(dw, dh) {
    if (!selectedRoom) return;
    updateRooms((rooms) => {
      const room = rooms.find(r => r.label === selectedRoom);
      if (!room) return;
      const minSize = 40;
      let newW = room.w + dw;
      let newH = room.h + dh;
      if (newW < minSize) newW = minSize;
      if (newH < minSize) newH = minSize;
      room.w = newW;
      room.h = newH;
    });
  }

  function renameRoom() {
    if (!selectedRoom) return;
    const newName = prompt('Enter new room name:', selectedRoom);
    if (!newName || !newName.trim()) return;
    const trimmed = newName.trim();
    updateRooms((rooms) => {
      const r = rooms.find(ro => ro.label === selectedRoom);
      if (!r) return;
      r.label = trimmed;
    });
    setSelectedRoom(trimmed);
  }

  // measurement click handler
  function handleSvgClick(evt) {
    if (!measuring || !layout) return;
    const svg = document.getElementById('plan');
    if (!svg) return;

    // support both MouseEvent and Synthetic events passed from inline handler
    const clientX = evt.clientX ?? (evt.pageX || 0);
    const clientY = evt.clientY ?? (evt.pageY || 0);

    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * layout.W;
    const y = ((clientY - rect.top) / rect.height) * layout.H;

    setMeasurePoints(prev => {
      if (prev.length === 0) {
        setMeasureDistance(null);
        return [{ x, y }];
      }

      if (prev.length === 1) {
        const p0 = prev[0];
        const p1 = { x, y };
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const distPx = Math.hypot(dx, dy);

        // px -> meter conversion (consistent fallback)
        let metersPerPx;
        if (spec && spec.width && layout.W) {
          metersPerPx = spec.width / layout.W;
        } else if (spec && spec.height && layout.H) {
          metersPerPx = spec.height / layout.H;
        } else {
          metersPerPx = 1 / PX_PER_METER_FALLBACK;
        }
        const distM = distPx * metersPerPx;
        setMeasureDistance(distM);

        return [p0, p1];
      }

      // reset and start new
      setMeasureDistance(null);
      return [{ x, y }];
    });
  }

  // expose helpers to window for inline SVG onclick (mount/unmount)
  useEffect(() => {
    window.__selectRoom = selectRoom;
    window.__measureClick = handleSvgClick;
    return () => {
      delete window.__selectRoom;
      delete window.__measureClick;
    };
  }, []);

  function layoutToSvg(layout) {
    if (!layout) return '';
    const { rooms, W, H } = layout;
    const svgParts = [];

    svgParts.push(`
      <svg id="plan" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
        xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
        style="background:#fff; border:1px solid #ccc;"
        onclick="window.__measureClick && window.__measureClick(event)">
    `);

    // Grid pattern (if enabled)
    if (showGrid) {
      svgParts.push(`
        <defs>
          <pattern id="smallGrid" width="${GRID_SIZE}" height="${GRID_SIZE}" patternUnits="userSpaceOnUse">
            <path d="M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}" fill="none" stroke="#e5e7eb" stroke-width="0.6"/>
          </pattern>
          <pattern id="bigGrid" width="${GRID_SIZE * 5}" height="${GRID_SIZE * 5}" patternUnits="userSpaceOnUse">
            <rect width="${GRID_SIZE * 5}" height="${GRID_SIZE * 5}" fill="url(#smallGrid)"/>
            <path d="M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}" fill="none" stroke="#d1d5db" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bigGrid)" />
      `);
    }

    // ROOMS
    rooms.forEach(r => {
      const sel = selectedRoom === r.label;
      const fill = roomFill(r.label);

      // area calculation (m^2) with consistent fallback
      const roomAreaPx = (r.w || 0) * (r.h || 0);
      const metersPerPxForArea = (spec && spec.width && layout.W)
        ? spec.width / layout.W
        : (spec && spec.height && layout.H)
          ? spec.height / layout.H
          : 1 / PX_PER_METER_FALLBACK;
      const areaM2 = roomAreaPx * metersPerPxForArea * metersPerPxForArea;
      const showAreaText = Math.min(r.w, r.h) > 90;

      svgParts.push(`
        <g class="room" onclick="window.__selectRoom && window.__selectRoom('${(r.label || '').replace(/'/g, "\\'")}')">
          <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"
            fill="${fill}"
            stroke="${sel ? '#ff3366' : '#222'}"
            stroke-width="${sel ? wallThickness + 2 : wallThickness}"
          />
          ${
            Math.min(r.w, r.h) > 70
              ? `<text x="${r.x + 8}" y="${r.y + 18}" font-size="12" fill="#111">${r.label}</text>`
              : ''
          }
          ${
            showAreaText
              ? `<text x="${r.x + 8}" y="${r.y + 34}" font-size="11" fill="#4b5563">${areaM2.toFixed(1)} m²</text>`
              : ''
          }
        </g>
      `);
    });

    // DOORS & WINDOWS
    let doors = [];
    let windows = [];
    let openings = { doors: [], windows: [] };

    try {
      openings = generateOpenings(layout, spec) || { doors: [], windows: [] };
      doors = openings.doors || [];
      windows = openings.windows || [];
    } catch (e) {
      console.warn('generateOpenings error:', e);
    }

    if (showDoors && doors.length) {
      svgParts.push(`<g class="doors">`);
      doors.forEach(d => {
        svgParts.push(`
          <rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}"
            fill="#d97757" stroke="#7c2d12" stroke-width="1.5" />
        `);
      });
      svgParts.push(`</g>`);
    }

    if (showWindows && windows.length) {
      svgParts.push(`<g class="windows">`);
      windows.forEach(w => {
        svgParts.push(`
          <rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}"
            fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.2" fill-opacity="0.9" />
        `);
      });
      svgParts.push(`</g>`);
    }

    // FURNITURE (door/window-aware)
    if (showFurniture) {
      try {
        const items = placeFurniture(layout, openings, spec);
        svgParts.push(`<g class="furniture">${furnitureItemsToSvg(items)}</g>`);
      } catch (e) {
        console.error('furniture render error', e);
      }
    }

    // measurement overlay
    if (measurePoints && measurePoints.length === 2) {
      const [p0, p1] = measurePoints;
      svgParts.push(`
        <g class="measure">
          <line x1="${p0.x}" y1="${p0.y}" x2="${p1.x}" y2="${p1.y}"
            stroke="#ef4444" stroke-width="2" stroke-dasharray="4 3" />
          <circle cx="${p0.x}" cy="${p0.y}" r="3.5" fill="#ef4444" />
          <circle cx="${p1.x}" cy="${p1.y}" r="3.5" fill="#ef4444" />
        </g>
      `);
    }

    svgParts.push(`</svg>`);
    return svgParts.join('\n');
  }

  const containerStyle = {
    overflow: 'auto',
    width: '100%',
    maxWidth: '880px',
    maxHeight: '640px',
    borderRadius: 8,
    background: '#fff'
  };

  return (
    <div className="canvas">
      <div className="controls-row">
        <button onClick={() => setScale(s => Math.min(2, +(s + 0.1).toFixed(2)))}>Zoom +</button>
        <button onClick={() => setScale(s => Math.max(0.2, +(s - 0.1).toFixed(2)))}>Zoom -</button>
        <button onClick={() => setScale(1)}>Reset</button>
        <div className="zoom-info" style={{ marginLeft: 12 }}>Scale: {Math.round(scale * 100)}%</div>

        {/* Measure toggle + clear */}
        <button
          onClick={() => {
            setMeasuring(m => {
              const next = !m;
              if (!next) {
                setMeasurePoints([]);
                setMeasureDistance(null);
              }
              return next;
            });
          }}
          className="btn-outline"
          style={{ marginLeft: 12 }}
        >
          📏 {measuring ? 'Measuring…' : 'Measure'}
        </button>
        {measurePoints.length > 0 && (
          <button
            onClick={() => {
              setMeasurePoints([]);
              setMeasureDistance(null);
            }}
            className="btn-outline"
          >
            Clear
          </button>
        )}

        {/* Grid toggle */}
        <button
          onClick={() => setShowGrid(g => !g)}
          className="btn-outline"
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>

        <button onClick={() => setShowFurniture(s => !s)} className="btn-outline">
          {showFurniture ? 'Hide Furniture' : 'Show Furniture'}
        </button>
        <button onClick={() => setShowDoors(s => !s)} className="btn-outline">
          {showDoors ? 'Hide Doors' : 'Show Doors'}
        </button>
        <button onClick={() => setShowWindows(s => !s)} className="btn-outline">
          {showWindows ? 'Hide Windows' : 'Show Windows'}
        </button>
      </div>

      {selectedRoom && (
        <div className="room-editor">
          <strong>{selectedRoom}</strong>

          <div className="edit-buttons">
            <button onClick={() => moveRoom(0, -GRID_SIZE)}>⬆</button>
            <button onClick={() => moveRoom(0, GRID_SIZE)}>⬇</button>
            <button onClick={() => moveRoom(-GRID_SIZE, 0)}>⬅</button>
            <button onClick={() => moveRoom(GRID_SIZE, 0)}>➡</button>
          </div>

          <div className="resize-buttons">
            <span style={{ fontSize: 12, marginRight: 6 }}>Resize:</span>
            <button onClick={() => resizeRoom(GRID_SIZE, 0)}>Wider</button>
            <button onClick={() => resizeRoom(-GRID_SIZE, 0)}>Narrower</button>
            <button onClick={() => resizeRoom(0, GRID_SIZE)}>Taller</button>
            <button onClick={() => resizeRoom(0, -GRID_SIZE)}>Shorter</button>
          </div>

          <button style={{ marginTop: 8 }} onClick={renameRoom}>Rename Room</button>
        </div>
      )}

      <div ref={wrapperRef} style={containerStyle}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', display: 'inline-block' }}>
          <div
            dangerouslySetInnerHTML={{
              __html: layout
                ? layoutToSvg(layout)
                : "<div style='padding:12px;color:#444'>Generate Layout</div>"
            }}
          />
        </div>
      </div>

      {measureDistance && (
        <div className="measure-info" style={{ marginTop: 8, color: '#ddd' }}>
          Distance: {measureDistance.toFixed(2)} m
        </div>
      )}

      <div className="door-window-legend" style={{ marginTop: 10 }}>
        <div className="legend-chip" style={{ marginBottom: 6 }}>
          <span className="legend-swatch legend-door" /> <span style={{ marginLeft: 6 }}>Main Door / Doors</span>
        </div>
        <div className="legend-chip">
          <span className="legend-swatch legend-window" /> <span style={{ marginLeft: 6 }}>Windows</span>
        </div>
      </div>
    </div>
  );
}
