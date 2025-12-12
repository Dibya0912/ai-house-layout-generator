// src/components/VariantsPanel.jsx
import React from 'react';

// NOTE: Removed the local CSS import to avoid missing-file errors.
// If you want custom styles, create src/components/variantsPanel.css and import it here.

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
            <div key={v.id} style={{position:'relative'}}>
              <button onClick={()=>onSelect(v)} style={{
                padding:0,
                border: selected ? '2px solid #06b6d4' : '1px solid #333',
                background:'#fff', cursor:'pointer', borderRadius:6, overflow:'hidden', width:'100%', height:'80px'
              }} dangerouslySetInnerHTML={{__html: svg}} />
              <div style={{
                position:'absolute', right:6, top:6, background:'#0009', color:'#fff', fontSize:11, padding:'2px 6px', borderRadius:6
              }}>{Math.round(v.score)}</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:8,fontSize:12,color:'#aab'}}>{variants.length} options — scores shown on thumbnails</div>
    </div>
  );
}

function layoutToThumbSvg(layout){
  if(!layout) return '<div/>';
  const {W,H,rooms} = layout;
  const scale = Math.min(180 / W, 120 / H, 1);
  const w = Math.round(W * scale);
  const h = Math.round(H * scale);
  const parts = [];
  parts.push(`<svg width="${w}" height="${h}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block">`);
  rooms.forEach(r=>{
    // keep fill light so thumbnail visible on dark UI
    parts.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#ffffff" stroke="#222" stroke-width="${Math.max(1, 2/scale)}"/>`);
  });
  parts.push(`</svg>`);
  return parts.join('');
}
