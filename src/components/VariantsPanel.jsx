// src/components/VariantsPanel.jsx
import React from 'react';

export default function VariantsPanel({ variants = [], onSelect, selectedId }) {
  if (!variants || variants.length === 0) return <div style={{padding:12}}>No variants yet</div>;

  return (
    <div style={{width:220, padding:8, background:'rgba(255,255,255,0.03)', borderRadius:8}}>
      <h4 style={{margin:'6px 0'}}>Variants</h4>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        {variants.map(v => {
          const svg = layoutToThumbSvg(v.layout);
          const selected = selectedId === v.id;
          return (
            <button key={v.id} onClick={()=>onSelect(v)} style={{
              padding:0, border: selected ? '2px solid #06b6d4' : '1px solid #333',
              background:'#fff', cursor:'pointer', borderRadius:6, overflow:'hidden'
            }} dangerouslySetInnerHTML={{__html: svg}} />
          );
        })}
      </div>
      <div style={{marginTop:8,fontSize:12,color:'#aab'}}>{variants.length} options — scores shown in console</div>
    </div>
  );
}

function layoutToThumbSvg(layout){
  if(!layout) return '<div/>';
  const {W,H,rooms} = layout;
  // make small thumbnail 180x120, scale down
  const scale = Math.min(180 / W, 120 / H, 1);
  const w = Math.round(W * scale);
  const h = Math.round(H * scale);
  const parts = [];
  parts.push(`<svg width="${w}" height="${h}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block">`);
  rooms.forEach(r=>{
    parts.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#fff" stroke="#222" stroke-width="${2/scale}"/>`);
  });
  parts.push(`</svg>`);
  return parts.join('');
}
