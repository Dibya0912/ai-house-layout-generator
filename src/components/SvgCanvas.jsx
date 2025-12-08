// src/components/SvgCanvas.jsx
import React, { useEffect, useRef, useState } from 'react';
import { placeFurniture, furnitureItemsToSvg } from '../utils/furnitureEngine';
import { generateOpenings } from '../utils/layoutEngine';

export default function SvgCanvas({ layout, setLayout, spec = {}, scale = 1, setScale = () => {} }) {
  const wrapperRef = useRef(null);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showDoors, setShowDoors] = useState(true);
  const [showWindows, setShowWindows] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Day-15: measurement state
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]); 
  const [measureDistance, setMeasureDistance] = useState(null);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollLeft = 0;
      wrapperRef.current.scrollTop = 0;
    }
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
  }

  function selectRoom(label) {
    setSelectedRoom(label);
  }

  function moveRoom(dx, dy) {
    if (!selectedRoom) return;
    updateRooms((rooms) => {
      const room = rooms.find(r => r.label === selectedRoom);
      if (!room) return;
      const grid = 5;
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
      room.w = Math.max(minSize, room.w + dw);
      room.h = Math.max(minSize, room.h + dh);
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

  function handleSvgClick(evt) {
    if (!measuring || !layout) return;
    const svg = document.getElementById('plan');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * layout.W;
    const y = ((evt.clientY - rect.top) / rect.height) * layout.H;

    setMeasurePoints(prev => {
      if (prev.length === 0) {
        setMeasureDistance(null);
        return [{ x, y }];
      }

      if (prev.length === 1) {
        const p0 = prev[0];
        const dx = x - p0.x;
        const dy = y - p0.y;
        const distPx = Math.hypot(dx, dy);

        const pxPerMeter = 50;
        const distM = distPx / pxPerMeter;
        setMeasureDistance(distM);

        return [p0, { x, y }];
      }

      setMeasureDistance(null);
      return [{ x, y }];
    });
  }

  useEffect(() => {
    window.__selectRoom = selectRoom;
    window.__measureClick = handleSvgClick;
    return () => {
      delete window.__selectRoom;
      delete window.__measureClick;
    };
  });

  function layoutToSvg(layout) {
    if (!layout) return '';
    const { rooms, W, H } = layout;
    const svgParts = [];

    svgParts.push(`
      <svg id="plan" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
        xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
        style="background:#fff; border:1px solid #ccc;"
        onclick="window.__measureClick && window.__measureClick(evt)">
    `);

    rooms.forEach(r => {
      const sel = selectedRoom === r.label;
      const fill = roomFill(r.label);

      const areaSqM = ((r.w * r.h) / (50 * 50));
      const showArea = Math.min(r.w, r.h) > 80;

      svgParts.push(`
        <g class="room" onclick="window.__selectRoom && window.__selectRoom('${(r.label || '').replace(/'/g, "\\'")}')">
          <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"
            fill="${fill}"
            stroke="${sel ? '#ff3366' : '#222'}"
            stroke-width="${sel ? wallThickness + 2 : wallThickness}"
          />

          ${
            Math.min(r.w, r.h) > 70
              ? `<text x="${r.x + 8}" y="${r.y + 18}" font-size="12" fill="#111" font-weight="600">${r.label}</text>`
              : ''
          }

          ${
            showArea
              ? `<text x="${r.x + 8}" y="${r.y + 34}" font-size="11" fill="#444">${areaSqM.toFixed(1)} m²</text>`
              : ''
          }
        </g>
      `);
    });

    let openings = { doors: [], windows: [] };

    try {
      openings = generateOpenings(layout, spec);
    } catch {}

    if (showDoors && openings.doors.length) {
      svgParts.push(`<g class="doors">`);
      openings.doors.forEach(d => {
        svgParts.push(`<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}"
          fill="#d97757" stroke="#7c2d12" stroke-width="1.5" />`);
      });
      svgParts.push(`</g>`);
    }

    if (showWindows && openings.windows.length) {
      svgParts.push(`<g class="windows">`);
      openings.windows.forEach(w => {
        svgParts.push(`<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}"
          fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.2" fill-opacity="0.9" />`);
      });
      svgParts.push(`</g>`);
    }

    if (showFurniture) {
      try {
        const items = placeFurniture(layout, openings, spec);
        svgParts.push(`<g class="furniture">${furnitureItemsToSvg(items)}</g>`);
      } catch {}
    }

    if (measurePoints.length === 2) {
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
        <button onClick={() => setScale(s => Math.min(2, s + 0.1))}>Zoom +</button>
        <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))}>Zoom -</button>
        <button onClick={() => setScale(1)}>Reset</button>
        <div style={{marginLeft:12}}>Scale: {Math.round(scale * 100)}%</div>

        <button onClick={() => {
          setMeasuring(m => !m);
          setMeasurePoints([]);
          setMeasureDistance(null);
        }} className="btn-outline" style={{marginLeft:12}}>
          📏 {measuring ? "Measuring…" : "Measure"}
        </button>

        <button onClick={() => {
          setMeasurePoints([]);
          setMeasureDistance(null);
        }} className="btn-outline">
          Clear
        </button>

        <button onClick={() => setShowFurniture(s=>!s)} className="btn-outline">
          {showFurniture ? 'Hide Furniture' : 'Show Furniture'}
        </button>
        <button onClick={() => setShowDoors(s=>!s)} className="btn-outline">
          {showDoors ? 'Hide Doors' : 'Show Doors'}
        </button>
        <button onClick={() => setShowWindows(s=>!s)} className="btn-outline">
          {showWindows ? 'Hide Windows' : 'Show Windows'}
        </button>
      </div>

      {selectedRoom && (
        <div className="room-editor">
          <strong>{selectedRoom}</strong>
          <button onClick={() => moveRoom(0,-10)}>⬆</button>
          <button onClick={() => moveRoom(0,10)}>⬇</button>
          <button onClick={() => moveRoom(-10,0)}>⬅</button>
          <button onClick={() => moveRoom(10,0)}>➡</button>
          <button onClick={() => resizeRoom(10,0)}>Wider</button>
          <button onClick={() => resizeRoom(-10,0)}>Narrower</button>
          <button onClick={() => resizeRoom(0,10)}>Taller</button>
          <button onClick={() => resizeRoom(0,-10)}>Shorter</button>
          <button onClick={renameRoom}>Rename</button>
        </div>
      )}

      <div ref={wrapperRef} style={containerStyle}>
        <div style={{transform:`scale(${scale})`, transformOrigin:'top left'}}>
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
        <div className="measure-info">
          Distance: {measureDistance.toFixed(2)} m
        </div>
      )}
    </div>
  );
}
