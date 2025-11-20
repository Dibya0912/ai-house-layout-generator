import React, {useState} from 'react';

export default function InputPanel({onGenerate}) {
  const [width, setWidth] = useState(12);
  const [height, setHeight] = useState(8);
  const [beds, setBeds] = useState(2);
  const [baths, setBaths] = useState(1);

  return (
    <div className="panel">
      <h3>Inputs</h3>
      <label>Width (m)
        <input type="number" value={width} onChange={e=>setWidth(Number(e.target.value))}/>
      </label>
      <label>Height (m)
        <input type="number" value={height} onChange={e=>setHeight(Number(e.target.value))}/>
      </label>
      <label>Bedrooms
        <input type="number" value={beds} onChange={e=>setBeds(Number(e.target.value))}/>
      </label>
      <label>Bathrooms
        <input type="number" value={baths} onChange={e=>setBaths(Number(e.target.value))}/>
      </label>

      <button onClick={() => onGenerate({width, height, beds, baths})}>Generate Layout</button>
    </div>
  );
}
