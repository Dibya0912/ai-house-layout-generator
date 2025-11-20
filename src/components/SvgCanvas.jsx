import React, {useState} from 'react';
import { generateLayout } from '../utils/layoutEngine';

export default function SvgCanvas(){
  const [spec, setSpec] = useState(null);
  const [svgHtml, setSvgHtml] = useState('');

  function handleGenerate(s) {
    const layout = generateLayout(s);
    setSpec(s);
    setSvgHtml(layoutToSvg(layout));
  }

  React.useEffect(()=>{
    window.__aihl_onGenerate = handleGenerate; // TEMP shortcut
  },[]);

  return (
    <div className="canvas">
      <div dangerouslySetInnerHTML={{__html: svgHtml}} style={{width:'100%'}} />
      <div className="controls">
        <p>{spec ? `Rendered for ${spec.width}m x ${spec.height}m` : 'Generate a layout from inputs'}</p>
        <button onClick={()=>downloadSvg()}>Download SVG</button>
      </div>
    </div>
  );
}

function layoutToSvg(layout) {
  if(!layout) return '';
  const {W,H,rooms} = layout;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = [];

  svg.push(`<svg id="plan" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="${ns}" style="background:#fff;border:1px solid #ccc">`);

  rooms.forEach(r => {
    svg.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#fff" stroke="#222" stroke-width="2"/>`);
    svg.push(`<text x="${r.x+6}" y="${r.y+16}" font-size="12" fill="#111">${r.label}</text>`);
  });

  svg.push(`</svg>`);
  return svg.join('');
}

function downloadSvg(){
  const svg = document.getElementById('plan');
  if(!svg){ alert('Generate layout first'); return; }
  const s = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([s], {type:'image/svg+xml'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'house-layout.svg';
  a.click();
}
