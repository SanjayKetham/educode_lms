import React, { useState, useEffect } from 'react';
import { DiffBadge, PageHeader } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TEMPLATES = { C:'#include <stdio.h>\nint main() {\n    // solve here\n    return 0;\n}', 'C++':'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // solve here\n}', Java:'public class Solution {\n    public static void main(String[] args) {\n        // solve here\n    }\n}', Python:'# solve here\n' };

export default function Problems() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [code, setCode] = useState(TEMPLATES['C']);
  const [lang, setLang] = useState('C');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/questions?type=coding').then(r => { setQuestions(r.data.questions); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? questions : questions.filter(q => q.difficulty === filter);

  const selectQ = (q) => { setSelected(q); setResults(null); setCode(q.starterCode?.c || TEMPLATES['C']); };

  const submit = async () => {
    if (!selected) return;
    setRunning(true); setResults(null);
    try {
      const { data } = await api.post(`/questions/${selected._id}/submit`, { code, language: lang.toLowerCase() });
      setResults(data);
      if (data.allPassed) { toast.success('All test cases passed! 🎉'); setQuestions(prev => prev.map(q => q._id === selected._id ? {...q, solved:true} : q)); }
      else toast.error(`${data.passed}/${data.total} test cases passed`);
    } catch { toast.error('Submission error'); }
    setRunning(false);
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') { e.preventDefault(); const {selectionStart} = e.target; const n = code.substring(0,selectionStart)+'  '+code.substring(e.target.selectionEnd); setCode(n); setTimeout(()=>{ e.target.selectionStart = e.target.selectionEnd = selectionStart+2; },0); }
  };

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <PageHeader title="Problem Set">
        <span style={{ fontSize:13, color:'#64748b' }}>{questions.filter(q=>q.solved).length}/{questions.length} Solved</span>
      </PageHeader>
      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', flex:1, overflow:'hidden' }}>
        {/* Problem list */}
        <div style={{ borderRight:'1px solid #1e2d45', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid #1e2d45', display:'flex', gap:6 }}>
            {['all','easy','medium','hard'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:'4px 12px', borderRadius:20, fontSize:11, cursor:'pointer', border:'1px solid',
                  borderColor: filter===f ? '#00d4ff' : '#1e2d45', background: filter===f ? 'rgba(0,212,255,0.08)' : 'transparent',
                  color: filter===f ? '#00d4ff' : '#64748b' }}>{f}</button>
            ))}
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {loading ? <div style={{ padding:20, color:'#64748b', fontSize:13 }}>Loading...</div> :
              filtered.map((q,i) => (
                <div key={q._id} onClick={() => selectQ(q)}
                  style={{ padding:'12px 14px', borderBottom:'1px solid #1e2d45', cursor:'pointer', transition:'background .15s',
                    background: selected?._id === q._id ? 'rgba(0,212,255,0.05)' : 'transparent',
                    borderLeft: selected?._id === q._id ? '3px solid #00d4ff' : '3px solid transparent' }}>
                  <div style={{ fontSize:11, color:'#64748b', fontFamily:'Space Mono,monospace' }}>#{i+1} · {q.category} {q.solved && '✅'}</div>
                  <div style={{ fontSize:13, fontWeight:600, margin:'3px 0' }}>{q.title}</div>
                  <DiffBadge diff={q.difficulty} />
                </div>
              ))
            }
            {!loading && filtered.length === 0 && <div style={{ padding:24, color:'#64748b', fontSize:13 }}>No problems found.</div>}
          </div>
        </div>

        {/* Problem detail + editor */}
        {selected ? (
          <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ flex:'0 0 45%', overflowY:'auto', padding:22, borderBottom:'1px solid #1e2d45' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>{selected.title}</div>
                <DiffBadge diff={selected.difficulty} />
              </div>
              <p style={{ fontSize:14, color:'#94a3b8', lineHeight:1.7, marginBottom:16 }}>{selected.description}</p>
              {selected.examples?.map((ex, i) => (
                <div key={i} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:10, padding:'12px 14px', marginBottom:10 }}>
                  <div style={{ fontSize:11, color:'#00d4ff', fontWeight:600, marginBottom:6 }}>Example {i+1}</div>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:12 }}>
                    <div><span style={{ color:'#64748b' }}>Input:</span> {ex.input}</div>
                    <div><span style={{ color:'#64748b' }}>Output:</span> {ex.output}</div>
                    {ex.explanation && <div style={{ color:'#64748b', marginTop:4 }}>// {ex.explanation}</div>}
                  </div>
                </div>
              ))}
              {selected.constraints && <div style={{ fontSize:12, color:'#64748b', marginTop:8 }}>Constraints: {selected.constraints}</div>}
            </div>

            <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'8px 14px', background:'#111827', borderBottom:'1px solid #1e2d45', display:'flex', alignItems:'center', gap:8 }}>
                <select value={lang} onChange={e => { setLang(e.target.value); setCode(TEMPLATES[e.target.value]); }}
                  style={{ background:'#0a0e1a', border:'1px solid #1e2d45', color:'#e2e8f0', padding:'5px 10px', borderRadius:7, fontSize:12 }}>
                  {Object.keys(TEMPLATES).map(l => <option key={l}>{l}</option>)}
                </select>
                <button onClick={submit} disabled={running}
                  style={{ marginLeft:'auto', padding:'7px 18px', background: running ? '#1e2d45' : '#10b981', border:'none', color:'#fff', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {running ? '⏳ Running...' : '▶ Submit'}
                </button>
              </div>
              <textarea value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleTab} spellCheck={false}
                style={{ flex:1, background:'#0d1117', color:'#c9d1d9', fontFamily:'Space Mono,monospace', fontSize:13, lineHeight:1.7, padding:14, border:'none', outline:'none', resize:'none' }} />
              {results && (
                <div style={{ padding:14, borderTop:'1px solid #1e2d45', background:'#111827' }}>
                  <div style={{ marginBottom:8, fontSize:13, fontWeight:600, color: results.allPassed ? '#10b981' : '#f59e0b' }}>
                    {results.allPassed ? '🎉 All tests passed!' : `⚠️ ${results.passed}/${results.total} tests passed`}
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {results.results?.map((r,i) => (
                      <div key={i} style={{ padding:'4px 10px', borderRadius:6, fontSize:11, background: r.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: r.passed ? '#10b981' : '#ef4444', border:`1px solid ${r.passed?'#10b98144':'#ef444444'}` }}>
                        TC {r.testCase}: {r.passed ? '✓' : '✗'} {r.runtime}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:14 }}>
            ← Select a problem to start solving
          </div>
        )}
      </div>
    </div>
  );
}
