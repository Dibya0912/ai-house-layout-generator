import React from 'react';
import InputPanel from './components/InputPanel';
import SvgCanvas from './components/SvgCanvas';
import './styles.css';

export default function App(){
  return (
    <div className="app">
      <header><h1>AI House Layout Generator</h1></header>
      <main className="main">
        <InputPanel />
        <SvgCanvas />
      </main>
      <footer>Demo MVP — push daily to /dev</footer>
    </div>
  );
}
