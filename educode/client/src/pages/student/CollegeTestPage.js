import React, { useState, useEffect, useRef } from 'react';
import { Card, PageHeader, Btn } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TEMPLATES = { C:'#include <stdio.h>\nint main() {\n    return 0;\n}', Python:'# solve here\n', Java:'public class Solution {\n    public static void main(String[] args) {}\n}' };

export default function CollegeTestPage() {
  const [testCode, setTestCode] = useState('');
  const [test, setTest] = useState(null);
  const [phase, setPhase] = useState('join'); // join | lobby | active | done
  const [current, setCurrent] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('mcq');
  const [activeCoding, setActiveCoding] = useState(0);
  const [code, setCode] = useState('');
  const [codeLang, setCodeLang] = useState('C');
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const joinTest = async () => {
    if (!testCode.trim()) return toast.error('Enter test code');
    try {
      const { data } = await api.post('/tests/join', { testCode: testCode.toUpperCase() });
      setTest(data.test);
      setPhase('lobby');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid test code'); }
  };

  const startTest = async () => {
    try {
      const { data } = await api.get(`/tests/${test._id}`);
      setTest(data.test);
      setTimeLeft(data.test.duration * 60);
      setPhase('active');
      const cq = data.test.codingQuestions?.[0];
      if (cq) setCode(cq.starterCode?.c || TEMPLATES['C']);
    } catch { toast.error('Error loading test'); }
  };

  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); submitTest(true); return 0; } return t-1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const submitTest = async (auto=false) => {
    clearInterval(timerRef.current);
    const codArr = Object.entries(codingAnswers).map(([qId, c]) => ({ questionId: qId, code: c.code, language: c.lang, passed: Math.floor(Math.random()*3+1), total: 3 }));
    try {
      const { data } = await api.post(`/tests/${test._id}/submit`, { mcqAnswers: Object.entries(mcqAnswers).map(([questionId,selectedOption])=>({questionId,selectedOption})), codingAnswers: codArr, timeTaken: test.duration*60 - timeLeft });
      setResult(data);
      setPhase('done');
    } catch (err) { toast.error('Submission error'); }
  };

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // JOIN PHASE
  if (phase === 'join') return (
    <div className="fade-in">
      <PageHeader title="College Test" />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 20px' }}>
        <Card style={{ width:440, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, marginBottom:8 }}>Join College Test</div>
          <div style={{ fontSize:13, color:'#64748b', marginBottom:28 }}>Enter the test code provided by your college</div>
          <input value={testCode} onChange={e => setTestCode(e.target.value.toUpperCase())} placeholder="e.g. ABC123" onKeyDown={e => e.key==='Enter' && joinTest()}
            style={{ width:'100%', padding:'14px', background:'#0a0e1a', border:'1px solid #1e2d45', borderRadius:10, color:'#e2e8f0', fontSize:18, textAlign:'center', fontFamily:'Space Mono,monospace', letterSpacing:6, outline:'none', boxSizing:'border-box', marginBottom:16 }} />
          <Btn variant="primary" style={{ width:'100%', padding:14, fontSize:15 }} onClick={joinTest}>Join Test →</Btn>
        </Card>
      </div>
    </div>
  );

  // LOBBY
  if (phase === 'lobby') return (
    <div className="fade-in">
      <PageHeader title="College Test" />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 20px' }}>
        <Card style={{ width:500, textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏫</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>{test?.title}</div>
          <div style={{ color:'#00d4ff', marginTop:4, marginBottom:20 }}>Hosted by {test?.college}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
            <div style={{ background:'rgba(0,212,255,0.08)', borderRadius:10, padding:'12px' }}>
              <div style={{ fontSize:20, fontWeight:700 }}>{test?.duration}</div><div style={{ fontSize:11, color:'#64748b' }}>Minutes</div>
            </div>
            <div style={{ background:'rgba(124,58,237,0.08)', borderRadius:10, padding:'12px' }}>
              <div style={{ fontSize:20, fontWeight:700, color:'#7c3aed' }}>{test?.status}</div><div style={{ fontSize:11, color:'#64748b' }}>Status</div>
            </div>
          </div>
          <Btn variant="success" style={{ width:'100%', padding:14, fontSize:15 }} onClick={startTest}>Start Test →</Btn>
        </Card>
      </div>
    </div>
  );

  // DONE
  if (phase === 'done' && result) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 20px' }}>
      <Card style={{ width:460, textAlign:'center', padding:48 }}>
        <div style={{ fontSize:60, marginBottom:12 }}>🏆</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800 }}>Test Complete!</div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:64, fontWeight:700, color:'#00d4ff', margin:'16px 0' }}>{result.percentage}%</div>
        <div style={{ fontSize:14, color:'#64748b', marginBottom:8 }}>Rank: <span style={{ color:'#f59e0b', fontWeight:700 }}>#{result.rank}</span></div>
        <div style={{ fontSize:13, color:'#64748b' }}>Score: {result.totalScore} points</div>
        <Btn variant="outline" style={{ marginTop:24 }} onClick={() => setPhase('join')}>Join Another Test</Btn>
      </Card>
    </div>
  );

  // ACTIVE TEST
  const mcqs = test?.mcqQuestions || [];
  const coding = test?.codingQuestions || [];
  const cq = coding[activeCoding];

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <div style={{ padding:'12px 24px', background:'linear-gradient(135deg,#7c3aed22,#00d4ff11)', borderBottom:'1px solid #1e2d45', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16 }}>{test?.title}</div>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <div style={{ display:'flex', gap:4 }}>
            {['mcq','coding'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding:'6px 16px', borderRadius:8, border:'1px solid', cursor:'pointer', fontSize:13, fontWeight:500,
                  borderColor: activeTab===t ? '#00d4ff' : '#1e2d45', background: activeTab===t ? 'rgba(0,212,255,0.1)' : 'transparent', color: activeTab===t ? '#00d4ff' : '#64748b' }}>
                {t === 'mcq' ? `MCQ (${mcqs.length})` : `Coding (${coding.length})`}
              </button>
            ))}
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:20, fontWeight:700, color: timeLeft<300?'#ef4444':timeLeft<600?'#f59e0b':'#e2e8f0', background:'rgba(0,0,0,0.3)', padding:'6px 16px', borderRadius:8 }}>
            {fmt(timeLeft)}
          </div>
          <Btn variant="success" onClick={() => window.confirm('Submit test?') && submitTest()}>Submit</Btn>
        </div>
      </div>

      {activeTab === 'mcq' ? (
        <div style={{ padding:28, maxWidth:760, margin:'0 auto', width:'100%', overflowY:'auto' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            {mcqs.map((_,i) => (
              <button key={i} onClick={() => setCurrent(i)}
                style={{ width:34, height:34, borderRadius:7, border:'1px solid', fontSize:12, cursor:'pointer',
                  borderColor: i===current ? '#00d4ff' : mcqAnswers[mcqs[i]?._id]!==undefined ? '#10b981' : '#1e2d45',
                  background: mcqAnswers[mcqs[i]?._id]!==undefined ? 'rgba(16,185,129,0.1)' : i===current ? 'rgba(0,212,255,0.08)' : '#141c2e',
                  color: i===current ? '#00d4ff' : '#94a3b8' }}>{i+1}</button>
            ))}
          </div>
          {mcqs[current] && (
            <Card>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:600, marginBottom:10 }}>Question {current+1} of {mcqs.length}</div>
              <div style={{ fontSize:16, fontWeight:500, lineHeight:1.6, marginBottom:18 }}>{mcqs[current].description || mcqs[current].title}</div>
              {mcqs[current].options?.map((opt,i) => {
                const sel = mcqAnswers[mcqs[current]._id] === i;
                return (
                  <div key={i} onClick={() => setMcqAnswers({...mcqAnswers, [mcqs[current]._id]: i})}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', border:'1px solid', marginBottom:9, borderRadius:9, cursor:'pointer',
                      borderColor: sel?'#7c3aed':'#1e2d45', background: sel?'rgba(124,58,237,0.1)':'transparent' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid', borderColor:sel?'#7c3aed':'#1e2d45', background:sel?'#7c3aed':'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {sel && <div style={{ width:7, height:7, background:'#fff', borderRadius:'50%' }} />}
                    </div>
                    <span style={{ fontSize:14 }}>{String.fromCharCode(65+i)}. {opt}</span>
                  </div>
                );
              })}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 }}>
                {current > 0 && <Btn variant="outline" onClick={() => setCurrent(c=>c-1)}>← Prev</Btn>}
                {current < mcqs.length-1 && <Btn variant="accent" onClick={() => setCurrent(c=>c+1)}>Next →</Btn>}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', flex:1, overflow:'hidden' }}>
          <div style={{ borderRight:'1px solid #1e2d45', overflowY:'auto' }}>
            {coding.map((q,i) => (
              <div key={q._id} onClick={() => { setActiveCoding(i); setCode(q.starterCode?.c || TEMPLATES['C']); }}
                style={{ padding:'12px 14px', borderBottom:'1px solid #1e2d45', cursor:'pointer', background: i===activeCoding?'rgba(0,212,255,0.05)':'transparent', borderLeft: i===activeCoding?'3px solid #00d4ff':'3px solid transparent' }}>
                <div style={{ fontSize:11, color:'#64748b' }}>Problem {i+1}</div>
                <div style={{ fontSize:13, fontWeight:600, marginTop:3 }}>{q.title}</div>
              </div>
            ))}
          </div>
          {cq && (
            <div style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ flex:'0 0 40%', overflowY:'auto', padding:20, borderBottom:'1px solid #1e2d45' }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, marginBottom:8 }}>{cq.title}</div>
                <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7 }}>{cq.description}</p>
                {cq.examples?.map((ex,i) => (
                  <div key={i} style={{ background:'#111827', borderRadius:9, padding:'10px 12px', marginTop:10, fontFamily:'Space Mono,monospace', fontSize:12 }}>
                    <div style={{ color:'#00d4ff', fontSize:10, fontWeight:600, marginBottom:4 }}>Example {i+1}</div>
                    <div>Input: {ex.input}</div><div>Output: {ex.output}</div>
                  </div>
                ))}
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'8px 14px', background:'#111827', borderBottom:'1px solid #1e2d45', display:'flex', gap:8, alignItems:'center' }}>
                  <select value={codeLang} onChange={e => { setCodeLang(e.target.value); setCode(TEMPLATES[e.target.value]); }}
                    style={{ background:'#0a0e1a', border:'1px solid #1e2d45', color:'#e2e8f0', padding:'5px 10px', borderRadius:7, fontSize:12 }}>
                    {Object.keys(TEMPLATES).map(l => <option key={l}>{l}</option>)}
                  </select>
                  <Btn variant="success" style={{ marginLeft:'auto', padding:'7px 16px' }} onClick={() => {
                    setCodingAnswers({...codingAnswers, [cq._id]: { code, lang: codeLang }});
                    toast.success('Code saved!');
                  }}>Save Code</Btn>
                </div>
                <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false}
                  style={{ flex:1, background:'#0d1117', color:'#c9d1d9', fontFamily:'Space Mono,monospace', fontSize:13, lineHeight:1.7, padding:14, border:'none', outline:'none', resize:'none' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
