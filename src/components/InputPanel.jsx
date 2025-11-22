import React, {useState} from 'react';

export default function InputPanel({onGenerate}) {
  const [width, setWidth] = useState(12);
  const [height, setHeight] = useState(8);
  const [beds, setBeds] = useState(2);
  const [baths, setBaths] = useState(1);
  const [orientation, setOrientation] = useState('north');
  const [variants, setVariants] = useState(4);
  const [error, setError] = useState('');

  function validate() {
    if (!width || !height) return 'Width and height are required';
    if (width < 4 || height < 3) return 'Minimum dimensions: width >= 4m, height >= 3m';
    if (beds < 1 || beds > 6) return 'Bedrooms must be between 1 and 6';
    if (baths < 1 || baths > 4) return 'Bathrooms must be between 1 and 4';
    if (variants < 1 || variants > 12) return 'Variants must be 1..12';
    return '';
  }

  function handleClick() {
    const err = validate();
    setError(err);
    if (err) return;
    const spec = { width: Number(width), height: Number(height), beds: Number(beds), baths: Number(baths), orientation };
    if (typeof onGenerate === 'function') onGenerate(spec, Number(variants));
  }

  return (
    <div className="panel">
      <h3>Inputs</h3>
      <label>Width (m)
        <input type="number" value={width} min="1" onChange={e=>setWidth(e.target.value)} />
      </label>

      <label>Height (m)
        <input type="number" value={height} min="1" onChange={e=>setHeight(e.target.value)} />
      </label>

      <label>Bedrooms
        <input type="number" value={beds} min="1" max="6" onChange={e=>setBeds(e.target.value)} />
      </label>

      <label>Bathrooms
        <input type="number" value={baths} min="1" max="4" onChange={e=>setBaths(e.target.value)} />
      </label>

      <label>Orientation
        <select value={orientation} onChange={e=>setOrientation(e.target.value)}>
          <option value="north">North-facing</option>
          <option value="east">East-facing</option>
          <option value="south">South-facing</option>
          <option value="west">West-facing</option>
        </select>
      </label>

      <label>Variants
        <input type="number" value={variants} min="1" max="12" onChange={e=>setVariants(e.target.value)} />
      </label>

      {error && <div style={{color:'#ff6b6b', marginTop:8}}>{error}</div>}

      <button onClick={handleClick} style={{marginTop:10}}>Generate Variants</button>
    </div>
  );
}
