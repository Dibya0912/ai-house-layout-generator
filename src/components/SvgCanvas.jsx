import React from 'react';

export default function SvgCanvas({ layout, spec }) {

  function layoutToSvg(layout) {
    if (!layout) return '';
    const { W, H, rooms } = layout;
    const ns = 'http://www.w3.org/2000/svg';

    let svg = `<svg id="plan" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
    xmlns="${ns}" style="background:#fff; border:1px solid #ccc;">`;

    rooms.forEach(r => {
      svg += `
        <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"
          fill="#fff" stroke="#222" stroke-width="2" />
        <text x="${r.x + 8}" y="${r.y + 18}" font-size="12" fill="#111">
          ${r.label}
        </text>`;
    });

    svg += `</svg>`;
    return svg;
  }

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
    a.href = url;
    a.download = "house-layout.svg";
    a.click();
  }

  return (
    <div className="canvas">
      <div
        dangerouslySetInnerHTML={{
          __html: layout ? layoutToSvg(layout) : "<p style='padding:12px;color:#444;'>Generate a layout from inputs</p>"
        }}
      />

      <div className="controls">
        <button onClick={downloadSvg}>Download SVG</button>
      </div>
    </div>
  );
}
