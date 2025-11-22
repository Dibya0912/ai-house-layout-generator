import React, { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import SvgCanvas from './components/SvgCanvas';
import VariantsPanel from './components/VariantsPanel';
import { generateVariants } from './utils/layoutEngine';
import './styles.css';

export default function App(){
  const [layout, setLayout] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  function handleGenerate(spec, variantCount=4){
    const vs = generateVariants(spec, variantCount || 4);
    setVariants(vs);
    if(vs.length) {
      setSelectedId(vs[0].id);
      setLayout(vs[0].layout);
      console.log('variants scores:', vs.map(v=>({id:v.id,score:v.score})));
    } else {
      console.log('generateVariants returned 0 variants for spec:', spec);
      setLayout(null);
    }
  }

  function handleSelectVariant(v){
    setSelectedId(v.id);
    setLayout(v.layout);
  }

  // DEBUG: expose handler so you can test from browser console
  useEffect(()=>{
    window.__aihl_handleGenerate = handleGenerate;
    window.__aihl_getState = () => ({variants, selectedId, layout});
    return () => {
      delete window.__aihl_handleGenerate;
      delete window.__aihl_getState;
    };
  }, [variants, selectedId, layout]);

  return (
    <div className="app">
      <header><h1>AI House Layout Generator</h1></header>
      <main className="main" style={{alignItems:'flex-start'}}>
        <InputPanel onGenerate={(spec, count)=>handleGenerate(spec, count)} />
        <SvgCanvas layout={layout} />
        <VariantsPanel variants={variants} onSelect={handleSelectVariant} selectedId={selectedId} />
      </main>
      <footer>Demo MVP — push daily to /dev</footer>
    </div>
  );
}
