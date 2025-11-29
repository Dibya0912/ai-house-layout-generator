import React, { useState, useEffect, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import SvgCanvas from './components/SvgCanvas';
import VariantsPanel from './components/VariantsPanel';
import AISuggestionsPanel from './components/AISuggestionsPanel';
import { generateVariants } from './utils/layoutEngine';
import { analyzeVariants } from './utils/aiAdvisor';
import { saveProjectToStorage, loadProjectFromStorage } from './utils/storage';
import './styles.css';

export default function App(){
  const [layout, setLayout] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [scale, setScale] = useState(1);

  // default spec includes wallThickness and theme
  const [spec, setSpec] = useState({
    width:12, height:8, beds:2, baths:1, orientation:'north',
    wallThickness: 2, theme: 'dark' // theme: 'dark' | 'light'
  });

  // AI analysis state
  const [aiReport, setAiReport] = useState({ bestId: null, reports: [], summary: '' });

  // apply theme class on body
  useEffect(()=>{
    document.body.classList.remove('theme-light','theme-dark');
    document.body.classList.add(spec.theme === 'light' ? 'theme-light' : 'theme-dark');
  }, [spec.theme]);

  // generate variants and refresh analysis
  const handleGenerate = useCallback((incomingSpec, variantCount=4) => {
    const useSpec = { ...spec, ...incomingSpec };
    setSpec(useSpec);
    const vs = generateVariants(useSpec, variantCount || 4);
    setVariants(vs);
    if (vs.length) {
      setSelectedId(vs[0].id);
      setLayout(vs[0].layout);
    } else {
      setLayout(null);
    }

    // analyze right away
    const ai = analyzeVariants(vs, useSpec);
    setAiReport(ai);
  }, [spec]);

  function handleSelectVariant(v) {
    setSelectedId(v.id);
    setLayout(v.layout);
  }

  function handleAIPick() {
    if (!aiReport || !aiReport.bestId) {
      alert('AI did not return a recommendation');
      return;
    }
    const chosen = variants.find(v => v.id === aiReport.bestId);
    if (chosen) {
      setSelectedId(chosen.id);
      setLayout(chosen.layout);
      alert(`AI applied recommended variant ${chosen.id}`);
    }
  }

  function applyVariantById(id) {
    const chosen = variants.find(v => v.id === id);
    if (chosen) {
      setSelectedId(chosen.id);
      setLayout(chosen.layout);
    }
  }

  // save/load helpers (persist project)
  function saveProject() {
    const payload = { spec, variants, selectedId, layout, scale, timestamp: new Date().toISOString() };
    const ok = saveProjectToStorage(payload);
    if (ok) alert('Project saved to localStorage');
    else alert('Failed to save project (check console)');
  }
  function loadProject() {
    const obj = loadProjectFromStorage();
    if (!obj) { alert('No saved project'); return; }
    if (obj.spec) setSpec(obj.spec);
    if (obj.variants) setVariants(obj.variants);
    if (obj.selectedId) setSelectedId(obj.selectedId);
    if (obj.layout) setLayout(obj.layout);
    if (obj.scale) setScale(obj.scale);
    const ai = analyzeVariants(obj.variants || [], obj.spec || {});
    setAiReport(ai);
    alert('Project loaded from localStorage');
  }

  // auto-load on mount if available
  useEffect(()=>{
    const obj = loadProjectFromStorage();
    if (obj) {
      if (obj.spec) setSpec(obj.spec);
      if (obj.variants) setVariants(obj.variants);
      if (obj.selectedId) setSelectedId(obj.selectedId);
      if (obj.layout) setLayout(obj.layout);
      if (obj.scale) setScale(obj.scale);
      const ai = analyzeVariants(obj.variants || [], obj.spec || {});
      setAiReport(ai);
      console.log('Auto-loaded saved project and analyzed');
    }
  }, []);

  // expose debug helpers
  useEffect(()=>{
    window.__aihl_handleGenerate = handleGenerate;
    window.__aihl_saveProject = saveProject;
    window.__aihl_loadProject = loadProject;
    window.__aihl_getState = () => ({ spec, variants, selectedId, layout, scale, aiReport });
    return () => {
      delete window.__aihl_handleGenerate;
      delete window.__aihl_saveProject;
      delete window.__aihl_loadProject;
      delete window.__aihl_getState;
    };
  }, [handleGenerate, spec, variants, selectedId, layout, scale, aiReport]);

  return (
    <div className="app">
      <header className="topbar">
        <h1>AI House Layout Generator</h1>
        <div className="topbar-controls">
          <label className="switch">
            <input
              type="checkbox"
              checked={spec.theme === 'light'}
              onChange={e => setSpec(s => ({ ...s, theme: e.target.checked ? 'light' : 'dark' }))}
            />
            <span className="slider" />
            <span className="switch-label">{spec.theme === 'light' ? 'Light' : 'Dark'}</span>
          </label>
        </div>
      </header>

      <main className="main" style={{alignItems:'flex-start', gap:16}}>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <InputPanel
            initialSpec={spec}
            onGenerate={(s,count)=>handleGenerate(s,count)}
            onSave={saveProject}
            onLoad={loadProject}
            setSpec={(s)=>setSpec(prev => ({...prev,...s}))}
          />
          <AISuggestionsPanel
            reports={aiReport.reports}
            summary={aiReport.summary}
            recommendedId={aiReport.bestId}
            onApplyVariant={applyVariantById}
            onAIPick={handleAIPick}
          />
        </div>

        <div style={{flex:1, display:'flex', flexDirection:'column', gap:12}}>
          <SvgCanvas layout={layout} spec={spec} scale={scale} setScale={setScale} />
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button onClick={() => { if (!variants.length) alert('Generate variants first'); else { const ai = analyzeVariants(variants, spec); setAiReport(ai); alert('AI re-analyzed variants (check panel)'); } }}>Re-run AI Analysis</button>
            <button onClick={handleAIPick}>AI Pick Best</button>
            <button onClick={saveProject}>Save Project</button>
            <button onClick={loadProject}>Load Project</button>
          </div>
        </div>

        <VariantsPanel variants={variants} onSelect={handleSelectVariant} selectedId={selectedId} />
      </main>

      <footer>Demo MVP — push daily to /dev</footer>
    </div>
  );
}
