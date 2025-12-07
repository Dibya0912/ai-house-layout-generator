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
  const [measurePoints, setMeasurePoints] = useState([]); // [{x,y}, {x,y}]
  const [measureDistance, setMeasureDistance] = useState(null); // in meters

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

  // Day-15: handle click inside SVG for measurement
  function handleSvgClick(evt) {
    if (!measuring || !layout) return;
    const svg = document.getElementById('plan');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * layout.W;
    const y = ((evt.clientY - rect.top) / rect.height) * layout.H;

    setMeasurePoints(prev => {
      // first point
      if (prev.length === 0) {
        setMeasureDistance(null);
        return [{ x, y }];
      }

      // second point -> compute distance
      if (prev.length === 1) {
        const p0 = prev[0];
        const p1 = { x, y };
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const distPx = Math.hypot(dx, dy);

        // px -> meter conversion
        let metersPerPx;
        if (spec && spec.width && layout.W) {
          metersPerPx = spec.width / layout.W;
        } else if (spec && spec.height && layout.H) {
          metersPerPx = spec.height / layout.H;
        } else {
          // fallback: assume 50 px = 1m
          metersPerPx = 1 / 50;
        }
        const distM = distPx * metersPerPx;
        setMeasureDistance(distM);

        return [p0, p1];
      }

      // already have 2 points -> start a new measurement
      setMeasureDistance(null);
      return [{ x, y }];
    });
  }

  // expose room selection and svg click for inline handlers
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

    // ROOMS
    rooms.forEach(r => {
      const sel = selectedRoom === r.label;
      const fill = roomFill(r.label);
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

    // Day-15: measurement overlay (line + circles)
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
        <div className="zoom-info" style={{marginLeft:12}}>Scale: {Math.round(scale * 100)}%</div>

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

        <button onClick={() => setShowFurniture(s=>!s)} className="btn-outline" style={{marginLeft:12}}>
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

          <div className="edit-buttons">
            <button onClick={() => moveRoom(0,-10)}>⬆</button>
            <button onClick={() => moveRoom(0,10)}>⬇</button>
            <button onClick={() => moveRoom(-10,0)}>⬅</button>
            <button onClick={() => moveRoom(10,0)}>➡</button>
          </div>

          <div className="resize-buttons">
            <span style={{fontSize:12, marginRight:6}}>Resize:</span>
            <button onClick={() => resizeRoom(10,0)}>Wider</button>
            <button onClick={() => resizeRoom(-10,0)}>Narrower</button>
            <button onClick={() => resizeRoom(0,10)}>Taller</button>
            <button onClick={() => resizeRoom(0,-10)}>Shorter</button>
          </div>

          <button style={{marginTop:8}} onClick={renameRoom}>Rename Room</button>
        </div>
      )}

      <div ref={wrapperRef} style={containerStyle}>
        <div style={{transform:`scale(${scale})`, transformOrigin:'top left', display:'inline-block'}}>
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

      <div className="door-window-legend">
        <div className="legend-chip">
          <span className="legend-swatch legend-door" /> <span>Main Door / Doors</span>
        </div>
        <div className="legend-chip">
          <span className="legend-swatch legend-window" /> <span>Windows</span>
        </div>
      </div>
    </div>
  );
}
