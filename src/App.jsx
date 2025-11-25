// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import SvgCanvas from './components/SvgCanvas';
import VariantsPanel from './components/VariantsPanel';
import { generateVariants } from './utils/layoutEngine';
import { saveProjectToStorage, loadProjectFromStorage } from './utils/storage';
import './styles.css';

export default function App(){
  const [layout, setLayout] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [scale, setScale] = useState(1);
  const [spec, setSpec] = useState({ width:12, height:8, beds:2, baths:1, orientation:'north' });

  // Generate variants and set selected
  const handleGenerate = useCallback((incomingSpec, variantCount=4) => {
    const useSpec = {...spec, ...incomingSpec};
    setSpec(useSpec);
    const vs = generateVariants(useSpec, variantCount || 4);
    setVariants(vs);
    if(vs.length) {
      setSelectedId(vs[0].id);
      setLayout(vs[0].layout);
      console.log('variants scores:', vs.map(v=>({id:v.id,score:v.score})));
    } else {
      setLayout(null);
    }
  }, [spec]);

  function handleSelectVariant(v){
    setSelectedId(v.id);
    setLayout(v.layout);
  }

  // Save / Load helpers
  function saveProject() {
    const payload = {
      spec,
      variants,
      selectedId,
      layout,
      scale,
      timestamp: new Date().toISOString()
    };
    const ok = saveProjectToStorage(payload);
    if (ok) {
      alert('Project saved to localStorage');
    } else {
      alert('Failed to save project (check console)');
    }
  }

  function loadProject() {
    const obj = loadProjectFromStorage();
    if (!obj) {
      alert('No saved project found in localStorage');
      return;
    }
    // restore
    if (obj.spec) setSpec(obj.spec);
    if (obj.variants) setVariants(obj.variants);
    if (obj.selectedId) setSelectedId(obj.selectedId);
    if (obj.layout) setLayout(obj.layout);
    if (obj.scale) setScale(obj.scale);
    alert('Project loaded from localStorage');
  }

  // Auto-load on mount (Option A)
  useEffect(() => {
    const obj = loadProjectFromStorage();
    if (obj) {
      // silent restore
      if (obj.spec) setSpec(obj.spec);
      if (obj.variants) setVariants(obj.variants);
      if (obj.selectedId) setSelectedId(obj.selectedId);
      if (obj.layout) setLayout(obj.layout);
      if (obj.scale) setScale(obj.scale);
      console.log('Auto-loaded saved project from localStorage');
    }
  }, []);

  // Expose debug helpers (optional)
  useEffect(()=>{
    window.__aihl_handleGenerate = handleGenerate;
    window.__aihl_saveProject = saveProject;
    window.__aihl_loadProject = loadProject;
    window.__aihl_getState = () => ({spec, variants, selectedId, layout, scale});
    return () => {
      delete window.__aihl_handleGenerate;
      delete window.__aihl_saveProject;
      delete window.__aihl_loadProject;
      delete window.__aihl_getState;
    };
  }, [handleGenerate, saveProject, loadProject, spec, variants, selectedId, layout, scale]);

  return (
    <div className="app">
      <header><h1>AI House Layout Generator</h1></header>
      <main className="main" style={{alignItems:'flex-start'}}>
        <InputPanel
          initialSpec={spec}
          onGenerate={(s,count)=>handleGenerate(s,count)}
          onSave={saveProject}
          onLoad={loadProject}
        />

        <SvgCanvas layout={layout} spec={spec} scale={scale} setScale={setScale} />

        <VariantsPanel variants={variants} onSelect={handleSelectVariant} selectedId={selectedId} />
      </main>
      <footer>Demo MVP — push daily to /dev</footer>
    </div>
  );
}
