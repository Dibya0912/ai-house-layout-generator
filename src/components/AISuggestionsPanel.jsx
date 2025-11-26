// src/components/AISuggestionsPanel.jsx
import React from 'react';

/**
 * Props:
 * - reports: [{id, score, grade, advantages, issues, suggestions, metrics}]
 * - summary: string
 * - recommendedId: string
 * - onApplyVariant(id) -> applies chosen variant
 * - onAIPick() -> apply recommended
 */
export default function AISuggestionsPanel({ reports = [], summary = '', recommendedId = null, onApplyVariant = () => {}, onAIPick = () => {} }) {
  if (!reports || reports.length === 0) return <div style={{padding:12}}>AI Advisor: no data</div>;

  return (
    <div style={{width:340, padding:10, background:'rgba(255,255,255,0.03)', borderRadius:8}}>
      <h4 style={{margin:'6px 0'}}>AI Advisor</h4>
      <div style={{fontSize:13, color:'#cbd5e1', marginBottom:8}}>{summary}</div>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <button onClick={onAIPick} style={{padding:'6px 10px', borderRadius:8, background:'#06b6d4', color:'#001'}}>AI Pick Best</button>
      </div>

      <div style={{display:'grid', gap:8, maxHeight:420, overflow:'auto'}}>
        {reports.map(r => (
          <div key={r.id} style={{padding:8, borderRadius:8, background: r.id === recommendedId ? '#e6fffb' : '#fff', border: r.id === recommendedId ? '2px solid #06b6d4' : '1px solid #ddd' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontWeight:700}}>{r.id} <span style={{fontSize:12, color:'#666'}}>score {Math.round(r.score)}</span></div>
              <div>
                <button onClick={()=>onApplyVariant(r.id)} style={{padding:'4px 8px', borderRadius:6}}>Apply</button>
              </div>
            </div>

            <div style={{marginTop:8, fontSize:12}}>
              <div><strong>Grade:</strong> {r.grade}</div>
              {r.advantages && r.advantages.length > 0 && <div style={{marginTop:6}}><strong>Good:</strong> <ul style={{margin:'4px 0 0 18px'}}>{r.advantages.map((a,i)=><li key={i}>{a}</li>)}</ul></div>}
              {r.issues && r.issues.length > 0 && <div style={{marginTop:6}}><strong>Issues:</strong> <ul style={{margin:'4px 0 0 18px', color:'#9b2c2c'}}>{r.issues.map((it,i)=><li key={i}>{it}</li>)}</ul></div>}
              {r.suggestions && r.suggestions.length > 0 && <div style={{marginTop:6}}><strong>Suggestions:</strong> <ul style={{margin:'4px 0 0 18px', color:'#0f5132'}}>{r.suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
