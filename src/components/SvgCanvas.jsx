// src/components/SvgCanvas.jsx
import React, { useEffect, useRef, useState } from "react";
import { placeFurniture, furnitureItemsToSvg } from "../utils/furnitureEngine";
import { jsPDF } from "jspdf";
// ❌ WRONG: import svg2pdf from "svg2pdf.js";
// ✅ RIGHT:
import { svg2pdf } from "svg2pdf.js";

export default function SvgCanvas({ layout, spec, scale = 1, setScale = () => {} }) {
  const wrapperRef = useRef(null);
  const [showFurniture, setShowFurniture] = useState(true);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollLeft = 0;
      wrapperRef.current.scrollTop = 0;
    }
  }, [layout]);

  // ---------------- SVG BUILDER ----------------
  function layoutToSvg(layout) {
    if (!layout) return "";
    const { W, H, rooms } = layout;
    const svgParts = [];
    const ns = "http://www.w3.org/2000/svg";

    svgParts.push(
      `<svg id="plan" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
       xmlns="${ns}" preserveAspectRatio="xMidYMid meet"
       style="background:#fff; border:1px solid #ccc; display:block">`
    );

    rooms.forEach((r) => {
      const w = Math.max(2, r.w);
      const h = Math.max(2, r.h);
      const label = r.label || "";
      svgParts.push(`<g class="room">`);
      svgParts.push(
        `<rect x="${r.x}" y="${r.y}" width="${w}" height="${h}"
          fill="#fff" stroke="#222" stroke-width="2"/>`
      );
      if (Math.min(w, h) > 70) {
        svgParts.push(
          `<text x="${r.x + 8}" y="${r.y + 18}"
            font-size="12" fill="#111">${label}</text>`
        );
      }
      svgParts.push(`</g>`);
    });

    if (showFurniture) {
      try {
        const items = placeFurniture(layout);
        svgParts.push(`<g class="furniture">`);
        svgParts.push(furnitureItemsToSvg(items));
        svgParts.push(`</g>`);
      } catch (e) {
        console.error("furniture error", e);
      }
    }

    svgParts.push(`</svg>`);
    return svgParts.join("\n");
  }

  // ---------------- DOWNLOAD SVG ----------------
  function downloadSvg() {
    const svg = document.getElementById("plan");
    if (!svg) return alert("Generate layout first");
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-plan.svg";
    a.click();
  }

  // ---------------- DOWNLOAD PNG ----------------
  function downloadPng() {
    const svg = document.getElementById("plan");
    if (!svg) return alert("Generate layout first");

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = svg.width.baseVal.value;
      canvas.height = svg.height.baseVal.value;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ai-plan.png";
        a.click();
      });
    };

    img.src = url;
  }

  // ---------------- DOWNLOAD PDF (PNG fallback = stable) ----------------
  async function downloadPdf() {
    const svg = document.getElementById("plan");
    if (!svg) return alert("Generate layout first");

    const W = svg.width.baseVal.value;
    const H = svg.height.baseVal.value;
    const pdf = new jsPDF({
      unit: "pt",
      format: [W * 0.75, H * 0.75], // px → pt
    });

    // Convert SVG → PNG → PDF
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0);

      const pngData = canvas.toDataURL("image/png");
      pdf.addImage(pngData, "PNG", 0, 0, W * 0.75, H * 0.75);
      pdf.save("ai-plan.pdf");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  // ---------------- UI ----------------
  const wrapperStyle = {
    overflow: "auto",
    width: "100%",
    maxWidth: "880px",
    maxHeight: "640px",
    borderRadius: 8,
    background: "#fff",
  };

  return (
    <div className="canvas" style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setScale((s) => Math.min(2, s + 0.1))}>Zoom +</button>
        <button onClick={() => setScale((s) => Math.max(0.2, s - 0.1))}>Zoom -</button>
        <button onClick={() => setScale(1)}>Reset</button>

        <div style={{ marginLeft: 20 }}>
          <button onClick={downloadSvg}>Download SVG</button>
          <button onClick={downloadPng} style={{ marginLeft: 8 }}>
            Download PNG
          </button>
          <button onClick={downloadPdf} style={{ marginLeft: 8 }}>
            Download PDF
          </button>
        </div>

        <button
          onClick={() => setShowFurniture((s) => !s)}
          style={{ marginLeft: 12 }}
          className="btn-outline"
        >
          {showFurniture ? "Hide Furniture" : "Show Furniture"}
        </button>
      </div>

      <div ref={wrapperRef} style={wrapperStyle}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", display: "inline-block" }}>
          <div
            dangerouslySetInnerHTML={{
              __html: layout ? layoutToSvg(layout) : "<div style='padding:12px;color:#444'>Generate a layout</div>",
            }}
          />
        </div>
      </div>
    </div>
  );
}
