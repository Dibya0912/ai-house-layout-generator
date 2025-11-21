import React, { useState } from 'react';
import InputPanel from './components/InputPanel';
import SvgCanvas from './components/SvgCanvas';
import { generateLayout } from './utils/layoutEngine';
import './styles.css';

export default function App(){
  const [layout, setLayout] = useState(null);
  const [lastSpec, setLastSpec] = useState(null);

  function handleGenerate(spec) {
    try {
      setLastSpec(spec);
      const result = generateLayout(spec);
      setLayout(result);
    } catch (err) {
      console.error('Layout generation failed', err);
      alert('Failed to generate layout. See console for details.');
    }
  }

  return (
    <div className="app">
      <header><h1>AI House Layout Generator</h1></header>
      <main className="main">
        <InputPanel onGenerate={handleGenerate} />
        <SvgCanvas layout={layout} spec={lastSpec} />
      </main>
      <footer>Demo MVP — push daily to /dev</footer>
    </div>
  );
}
