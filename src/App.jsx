import React, { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import SvgCanvas from './components/SvgCanvas';
import VariantsPanel from './components/VariantsPanel';
import { generateVariants } from './utils/layoutEngine';
import './styles.css';

export default function App() {
  const [layout, setLayout] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [savedSpec, setSavedSpec] = useState(null);

  // ------------------------
  // GENERATE
  // ------------------------
  function handleGenerate(spec, variantCount = 4) {
    const vs = generateVariants(spec, variantCount);

    setVariants(vs);

    if (vs.length) {
      setSelectedId(vs[0].id);
      setLayout(vs[0].layout);
    } else {
      setLayout(null);
    }

    setSavedSpec(spec);
  }

  // ------------------------
  // SELECT VARIANT
  // ------------------------
  function handleSelectVariant(v) {
    setSelectedId(v.id);
    setLayout(v.layout);
  }

  // ------------------------
  // SAVE PROJECT (localStorage)
  // ------------------------
  function saveProject() {
    if (!layout || !variants || !savedSpec) {
      alert("Generate a layout first.");
      return;
    }

    const data = {
      spec: savedSpec,
      selectedId,
      variants,
      timestamp: Date.now()
    };

    localStorage.setItem("AIHL_PROJECT", JSON.stringify(data));
    alert("Project saved!");
  }

  // ------------------------
  // LOAD PROJECT
  // ------------------------
  function loadProject() {
    const raw = localStorage.getItem("AIHL_PROJECT");

    if (!raw) {
      alert("No saved project found.");
      return;
    }

    const data = JSON.parse(raw);

    setSavedSpec(data.spec);
    setVariants(data.variants);
    setSelectedId(data.selectedId);

    const found = data.variants.find(v => v.id === data.selectedId);
    if (found) setLayout(found.layout);

    alert("Project loaded!");
  }

  return (
    <div className="app">
      <header><h1>AI House Layout Generator</h1></header>

      <main className="main" style={{ alignItems: 'flex-start' }}>
        <InputPanel onGenerate={(spec, count) => handleGenerate(spec, count)} />

        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <button onClick={saveProject}>Save Project</button>
          <button onClick={loadProject}>Load Project</button>
        </div>

        <SvgCanvas layout={layout} />
        <VariantsPanel variants={variants} onSelect={handleSelectVariant} selectedId={selectedId} />
      </main>

      <footer>Demo MVP — push daily to /dev</footer>
    </div>
  );
}
