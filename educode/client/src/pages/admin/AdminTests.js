import React, { useState, useEffect } from 'react';
import { PageHeader, Modal, Input, Btn, Badge, Card } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [codingQs, setCodingQs] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:'', college:'', duration:120, startTime:'', mcqQuestions:[], codingQuestions:[], passingScore:60, maxStudents:500 });

  const load = async () => {
    const [t,q,c] = await Promise.all([api.get('/tests'), api.get('/questions?type=mcq'), api.get('/questions?type=coding')]);
    setTests(t.data.tests); setQuestions(q.data.questions); setCodingQs(c.data.questions);
  };
  useEffect(() => { load(); }, []);

  const toggleMcq = id => setForm(f => ({ ...f, mcqQuestions: f.mcqQuestions.includes(id) ? f.mcqQuestions.filter(x=>x!==id) : [...f.mcqQuestions,id] }));
  const toggleCoding = id => setForm(f => ({ ...f, codingQuestions: f.codingQuestions.includes(id) ? f.codingQuestions.filter(x=>x!==id) : [...f.codingQuestions,id] }));

  const save = async () => {
    try {
      await api.post('/tests', form); toast.success('Test created!'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => { await api.put(`/tests/${id}/status`, { status }); toast.success('Updated'); load(); };

  const statusColor = { scheduled:'#f59e0b', live:'#10b981', completed:'#64748b', cancelled:'#ef4444' };

  return (
    <div className="fade-in">
      <PageHeader title="College Tests">
        <Btn onClick={() => { setForm({ title:'', college:'', duration:120, startTime:'', mcqQuestions:[], codingQuestions:[], passingScore:60, maxStudents:500 }); setModal(true); }}>+ Create Test</Btn>
      </PageHeader>
      <div style={{ padding:'22px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {tests.map(t => (
            <Card key={t._id}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <Badge color={statusColor[t.status]||'#64748b'}>{t.status}</Badge>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:12, color:'#00d4ff' }}>{t.testCode}</span>
              </div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, marginBottom:4 }}>{t.title}</div>
              <div style={{ fontSize:12, color:'#00d4ff', marginBottom:12 }}>🏫 {t.college}</div>
              <div style={{ fontSize:12, color:'#64748b', lineHeight:2 }}>
                ⏱️ {t.duration} min<br/>
                👥 {t.registeredStudents?.length||0} registered<br/>
                ❓ {t.mcqQuestions?.length||0} MCQ + {t.codingQuestions?.length||0} Coding
              </div>
              <div style={{ display:'flex', gap:8, marginTop:14 }}>
                <select value={t.status} onChange={e => updateStatus(t._id, e.target.value)}
                  style={{ flex:1, background:'#0a0e1a', border:'1px solid #1e2d45', color:'#e2e8f0', padding:'7px', borderRadius:8, fontSize:12 }}>
                  {['scheduled','live','completed','cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </Card>
          ))}
          {tests.length === 0 && <div style={{ color:'#64748b', fontSize:13 }}>No tests created yet.</div>}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create College Test" width={640}>
        <Input label="Test Title" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Campus Tech Fest 2026" />
        <Input label="College Name" value={form.college} onChange={e => setForm(f=>({...f,college:e.target.value}))} placeholder="ABC Engineering College" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Duration (minutes)" type="number" value={form.duration} onChange={e => setForm(f=>({...f,duration:+e.target.value}))} />
          <Input label="Max Students" type="number" value={form.maxStudents} onChange={e => setForm(f=>({...f,maxStudents:+e.target.value}))} />
        </div>
        <Input label="Start Date & Time" type="datetime-local" value={form.startTime} onChange={e => setForm(f=>({...f,startTime:e.target.value}))} />
        <Input label="Pass Score (%)" type="number" value={form.passingScore} onChange={e => setForm(f=>({...f,passingScore:+e.target.value}))} />

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>MCQ Questions ({form.mcqQuestions.length} selected)</div>
          <div style={{ maxHeight:160, overflowY:'auto', border:'1px solid #1e2d45', borderRadius:9 }}>
            {questions.map(q => (
              <label key={q._id} style={{ display:'flex', gap:10, padding:'9px 12px', cursor:'pointer', borderBottom:'1px solid #1e2d45', fontSize:13, alignItems:'center' }}>
                <input type="checkbox" checked={form.mcqQuestions.includes(q._id)} onChange={() => toggleMcq(q._id)} />
                <span style={{ flex:1 }}>{q.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Coding Problems ({form.codingQuestions.length} selected)</div>
          <div style={{ maxHeight:140, overflowY:'auto', border:'1px solid #1e2d45', borderRadius:9 }}>
            {codingQs.map(q => (
              <label key={q._id} style={{ display:'flex', gap:10, padding:'9px 12px', cursor:'pointer', borderBottom:'1px solid #1e2d45', fontSize:13, alignItems:'center' }}>
                <input type="checkbox" checked={form.codingQuestions.includes(q._id)} onChange={() => toggleCoding(q._id)} />
                <span style={{ flex:1 }}>{q.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="success" onClick={save}>Create & Activate Test</Btn>
        </div>
      </Modal>
    </div>
  );
}
