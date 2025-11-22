import React, { useState, useRef, useEffect } from 'react';

/**
 * SvgCanvas
 * - scales SVG to fit container using preserveAspectRatio
 * - provides zoom controls (scale transform)
 * - download SVG and export PNG
 *
 * Props:
 * - layout: {W,H,rooms}
 * - spec: (optional) original spec
 */
export default function SvgCanvas({ layout, spec }) {
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef(null);

  // when layout changes, reset scale to 1 and scroll to top-left
  useEffect(() => {
    setScale(1);
    if (wrapperRef.current) {
      wrapperRef.current.scrollLeft = 0;
      wrapperRef.current.scrollTop = 0;
    }
  }, [layout]);

  function layoutToSvg(layout) {
    if (!layout) return '';
    const { W, H, rooms } = layout;
    const ns = 'http://www.w3.org/2000/svg';

    // use preserveAspectRatio so svg fits responsively in the viewBox container
    let svg = `<svg id="plan" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
      xmlns="${ns}" preserveAspectRatio="xMidYMid meet" style="background:#fff; border:1px solid #ccc; display:block">`;

    rooms.forEach(r => {
      const x = Number.isFinite(r.x) ? r.x : 0;
      const y = Number.isFinite(r.y) ? r.y : 0;
      const w = Math.max(2, Number.isFinite(r.w) ? r.w : 20);
      const h = Math.max(2, Number.isFinite(r.h) ? r.h : 20);
      const label = (r.label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      svg += `
        <rect x="${x}" y="${y}" width="${w}" height="${h}"
          fill="#fff" stroke="#222" stroke-width="2" />
        <text x="${x + 8}" y="${y + 18}" font-size="12" fill="#111"
          text-rendering="geometricPrecision" font-weight="500" >
          ${label}
        </text>`;
    });

    svg += `</svg>`;
    return svg;
  }

  // Download SVG as file
  function downloadSvg() {
    const svg = document.getElementById('plan');
    if (!svg) {
      alert("Generate a layout first");
      return;
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = (spec && spec.width && spec.height) ? `ai-plan-${spec.width}x${spec.height}.svg` : 'ai-plan.svg';
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // Export PNG: draw SVG on canvas then download PNG
  function downloadPng() {
    const svg = document.getElementById('plan');
    if (!svg) {
      alert("Generate a layout first");
      return;
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    // create an image and draw it on canvas
    const img = new Image();
    // inline SVG needs proper encoding
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = function () {
      const canvas = document.createElement('canvas');
      // use SVG's native pixel dimensions
      canvas.width = svg.width.baseVal.value || svg.viewBox.baseVal.width;
      canvas.height = svg.height.baseVal.value || svg.viewBox.baseVal.height;
      const ctx = canvas.getContext('2d');

      // white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(function (blob) {
        const a = document.createElement('a');
        const ts = new Date().toISOString().slice(0,10);
        const name = (spec && spec.width && spec.height) ? `ai-plan-${spec.width}x${spec.height}-${ts}.png` : `ai-plan-${ts}.png`;
        const u = URL.createObjectURL(blob);
        a.href = u;
        a.download = name;
        a.click();
        setTimeout(()=>URL.revokeObjectURL(u),1500);
      }, 'image/png');
    };
    img.onerror = function () {
      alert('Failed to convert SVG to PNG in this browser.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // center / fit container width helper (not required but helpful)
  function containerStyle() {
    return {
      overflow: 'auto',
      width: '100%',
      maxWidth: '880px',
      maxHeight: '640px',
      borderRadius: 8,
      background: '#fff'
    };
  }

  return (
    <div className="canvas" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      {/* zoom controls */}
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button onClick={() => setScale(s => Math.min(2, +(s + 0.1).toFixed(2)))}>Zoom +</button>
        <button onClick={() => setScale(s => Math.max(0.2, +(s - 0.1).toFixed(2)))}>Zoom -</button>
        <button onClick={() => setScale(1)}>Reset</button>
        <div style={{marginLeft:12, color:'#333'}}>Scale: {Math.round(scale * 100)}%</div>

        <div style={{marginLeft:20}}>
          <button onClick={downloadSvg}>Download SVG</button>
          <button onClick={downloadPng} style={{marginLeft:8}}>Download PNG</button>
        </div>
      </div>

      {/* SVG container that scales via CSS transform */}
      <div ref={wrapperRef} style={containerStyle()}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', display:'inline-block' }}>
          <div dangerouslySetInnerHTML={{
            __html: layout ? layoutToSvg(layout) : "<div style='padding:12px;color:#444'>Generate a layout from inputs</div>"
          }} />
        </div>
      </div>
    </div>
  );
}
