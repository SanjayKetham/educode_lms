import React, { useState } from 'react';
import { PageHeader } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TEMPLATES = {
  c: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello, World!");\n    }\n}',
  python: '# Your code here\nprint("Hello, World!")',
  sql: '-- Your SQL query\nSELECT 1 + 1 AS result;',
};

const LANG_LABELS = { c:'C', cpp:'C++', java:'Java', python:'Python', sql:'SQL' };

export default function Compiler() {
  const [lang, setLang] = useState('c');
  const [code, setCode] = useState(TEMPLATES['c']);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);

  const changeLang = (l) => { setLang(l); setCode(TEMPLATES[l]); setOutput(null); };

  const runCode = async () => {
    if (!code.trim()) return toast.error('Write some code first!');
    setRunning(true);
    setOutput({ status:'running' });
    try {
      const { data } = await api.post('/compiler/run', { code, language: lang, stdin });
      setOutput(data);
    } catch (err) {
      setOutput({ status:'error', error: err.response?.data?.message || 'Server error' });
    } finally {
      setRunning(false);
    }
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newCode = code.substring(0, selectionStart) + '  ' + code.substring(selectionEnd);
      setCode(newCode);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = selectionStart + 2; }, 0);
    }
  };

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <PageHeader title="Code Practice IDE">
        <button onClick={() => setCode('')}
          style={{ padding:'7px 14px', background:'transparent', border:'1px solid #1e2d45', borderRadius:8, color:'#64748b', fontSize:13, cursor:'pointer' }}>
          Clear
        </button>
        <button onClick={() => setCode(TEMPLATES[lang])}
          style={{ padding:'7px 14px', background:'transparent', border:'1px solid #1e2d45', borderRadius:8, color:'#64748b', fontSize:13, cursor:'pointer' }}>
          Reset
        </button>
      </PageHeader>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', flex:1, overflow:'hidden' }}>
        {/* Editor */}
        <div style={{ display:'flex', flexDirection:'column', borderRight:'1px solid #1e2d45' }}>
          <div style={{ padding:'10px 14px', background:'#111827', borderBottom:'1px solid #1e2d45', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>✏️ Editor</span>
            <div style={{ display:'flex', gap:4, marginLeft:4 }}>
              {Object.entries(LANG_LABELS).map(([k,v]) => (
                <button key={k} onClick={() => changeLang(k)}
                  style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', border:'1px solid',
                    borderColor: lang===k ? '#00d4ff' : '#1e2d45', background: lang===k ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: lang===k ? '#00d4ff' : '#64748b' }}>{v}</button>
              ))}
            </div>
            <button onClick={runCode} disabled={running}
              style={{ marginLeft:'auto', padding:'7px 18px', background:'#10b981', border:'none', color:'#fff', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, opacity:running?0.7:1 }}>
              {running ? '⏳ Running...' : '▶ Run'}
            </button>
          </div>
          <textarea value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleTab} spellCheck={false}
            style={{ flex:1, background:'#0d1117', color:'#c9d1d9', fontFamily:'Space Mono,monospace', fontSize:13, lineHeight:1.7, padding:16, border:'none', outline:'none', resize:'none', tabSize:2 }} />
        </div>

        {/* Output */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'10px 14px', background:'#111827', borderBottom:'1px solid #1e2d45', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>🖥️ Output</span>
            {output?.status === 'accepted' && <span style={{ fontSize:11, color:'#10b981' }}>✓ Accepted · {output.runtime} · {output.memory}</span>}
            {output?.status === 'error' && <span style={{ fontSize:11, color:'#ef4444' }}>✗ Error</span>}
            <button onClick={() => setOutput(null)} style={{ marginLeft:'auto', padding:'4px 10px', background:'transparent', border:'1px solid #1e2d45', borderRadius:6, color:'#64748b', fontSize:11, cursor:'pointer' }}>Clear</button>
          </div>
          <div style={{ flex:1, background:'#0d1117', padding:16, fontFamily:'Space Mono,monospace', fontSize:13, lineHeight:1.7, overflowY:'auto', whiteSpace:'pre-wrap' }}>
            {!output && <span style={{ color:'#64748b' }}>// Run your code to see output here...</span>}
            {output?.status === 'running' && <span style={{ color:'#f59e0b' }}>⏳ Compiling and running...</span>}
            {output?.status === 'accepted' && <span style={{ color:'#3fb950' }}>{output.output || '// No output'}</span>}
            {output?.status === 'error' && <span style={{ color:'#f85149' }}>{output.error}</span>}
          </div>
          <div style={{ padding:'12px 14px', borderTop:'1px solid #1e2d45', background:'#111827' }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:5, textTransform:'uppercase' }}>Standard Input (stdin)</div>
            <textarea value={stdin} onChange={e => setStdin(e.target.value)} placeholder="Provide input for your program..."
              style={{ width:'100%', background:'#0d1117', border:'1px solid #1e2d45', color:'#e2e8f0', padding:'8px 12px', borderRadius:8, fontFamily:'Space Mono,monospace', fontSize:12, resize:'none', height:55, outline:'none', boxSizing:'border-box' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
