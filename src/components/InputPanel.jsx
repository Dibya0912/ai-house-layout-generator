// src/components/InputPanel.jsx
import React, { useState, useEffect } from 'react';

export default function InputPanel({ initialSpec = {}, onGenerate, onSave, onLoad }) {
  const [width, setWidth] = useState(initialSpec.width || 12);
  const [height, setHeight] = useState(initialSpec.height || 8);
  const [beds, setBeds] = useState(initialSpec.beds || 2);
  const [baths, setBaths] = useState(initialSpec.baths || 1);
  const [orientation, setOrientation] = useState(initialSpec.orientation || 'north');
  const [variants, setVariants] = useState(4);

  // sync when initialSpec changes (auto-load)
  useEffect(() => {
    setWidth(initialSpec.width ?? 12);
    setHeight(initialSpec.height ?? 8);
    setBeds(initialSpec.beds ?? 2);
    setBaths(initialSpec.baths ?? 1);
    setOrientation(initialSpec.orientation ?? 'north');
  }, [initialSpec]);

  function handleGenerate() {
    const spec = {
      width: Number(width),
      height: Number(height),
      beds: Number(beds),
      baths: Number(baths),
      orientation
    };
    onGenerate && onGenerate(spec, Number(variants) || 4);
  }

  return (
    <div style={{minWidth:360, padding:12}}>
      <h3>Inputs</h3>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
        <label>Width (m)<input type="number" value={width} onChange={e=>setWidth(e.target.value)} style={{width:80}} /></label>
        <label>Height (m)<input type="number" value={height} onChange={e=>setHeight(e.target.value)} style={{width:80}} /></label>
        <label>Bedrooms<input type="number" value={beds} onChange={e=>setBeds(e.target.value)} style={{width:60}} /></label>
        <label>Bathrooms<input type="number" value={baths} onChange={e=>setBaths(e.target.value)} style={{width:60}} /></label>
        <label>Orientation
          <select value={orientation} onChange={e=>setOrientation(e.target.value)}>
            <option value="north">North-facing</option>
            <option value="east">East-facing</option>
            <option value="south">South-facing</option>
            <option value="west">West-facing</option>
          </select>
        </label>
        <label>Variants<input type="number" value={variants} onChange={e=>setVariants(e.target.value)} style={{width:60}} /></label>
        <button onClick={handleGenerate}>Generate Variants</button>
      </div>

      <div style={{marginTop:12, display:'flex', gap:8}}>
        <button onClick={onSave}>Save Project</button>
        <button onClick={onLoad}>Load Project</button>
      </div>
    </div>
  );
}
