import React, { useState, useEffect } from 'react';
import { PageHeader, Modal, Input, Btn, Badge, Card } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CollegePortal() {
  const [tests, setTests] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:'', college:'', duration:120, startTime:'', mcqQuestions:[], codingQuestions:[], passingScore:60, maxStudents:500 });
  const [questions, setQuestions] = useState([]);
  const [codingQs, setCodingQs] = useState([]);

  const load = async () => {
    const [t,q,c] = await Promise.all([api.get('/tests'), api.get('/questions?type=mcq'), api.get('/questions?type=coding')]);
    setTests(t.data.tests); setQuestions(q.data.questions); setCodingQs(c.data.questions);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await api.post('/tests', form); toast.success('Test created! Share the test code with students.'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => { await api.put(`/tests/${id}/status`, { status }); toast.success('Status updated'); load(); };

  const statusColor = { scheduled:'#f59e0b', live:'#10b981', completed:'#64748b', cancelled:'#ef4444' };

  return (
    <div className="fade-in">
      <PageHeader title="College Test Portal">
        <Btn variant="success" onClick={() => setModal(true)}>+ Create Test</Btn>
      </PageHeader>
      <div style={{ padding:'22px 28px' }}>
        {tests.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {tests.map(t => (
              <Card key={t._id}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <Badge color={statusColor[t.status]||'#64748b'}>{t.status}</Badge>
                </div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, marginBottom:4 }}>{t.title}</div>
                <div style={{ fontSize:12, color:'#00d4ff', marginBottom:14 }}>🏫 {t.college}</div>

                <div style={{ background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:14, textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'#64748b', textTransform:'uppercase', marginBottom:4 }}>Student Test Code</div>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:24, fontWeight:700, color:'#00d4ff', letterSpacing:6 }}>{t.testCode}</div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>Share this code with students</div>
                </div>

                <div style={{ fontSize:12, color:'#64748b', lineHeight:2, marginBottom:14 }}>
                  ⏱️ {t.duration} min<br/>
                  👥 {t.registeredStudents?.length||0} / {t.maxStudents} students<br/>
                  ❓ {t.mcqQuestions?.length||0} MCQ + {t.codingQuestions?.length||0} Coding
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  {t.status === 'scheduled' && (
                    <Btn variant="success" style={{ flex:1, padding:'8px', fontSize:12 }} onClick={() => updateStatus(t._id, 'live')}>▶ Go Live</Btn>
                  )}
                  {t.status === 'live' && (
                    <Btn variant="danger" style={{ flex:1, padding:'8px', fontSize:12 }} onClick={() => updateStatus(t._id, 'completed')}>⏹ End Test</Btn>
                  )}
                  <button onClick={() => window.open(`/tests/${t._id}/results`)}
                    style={{ flex:1, padding:8, background:'transparent', border:'1px solid #1e2d45', borderRadius:8, color:'#e2e8f0', fontSize:12, cursor:'pointer' }}>
                    Results
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'80px 20px', color:'#64748b' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🏫</div>
            <div style={{ fontSize:18, fontWeight:600, color:'#e2e8f0', marginBottom:8 }}>No Tests Created Yet</div>
            <div style={{ fontSize:13, marginBottom:24 }}>Create your first test and share the code with students</div>
            <Btn variant="primary" onClick={() => setModal(true)}>+ Create First Test</Btn>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create College Test" width={640}>
        <Input label="Test Title" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Campus Hackathon 2026" />
        <Input label="College Name" value={form.college} onChange={e => setForm(f=>({...f,college:e.target.value}))} placeholder="Your College Name" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Duration (minutes)" type="number" value={form.duration} onChange={e => setForm(f=>({...f,duration:+e.target.value}))} />
          <Input label="Max Students" type="number" value={form.maxStudents} onChange={e => setForm(f=>({...f,maxStudents:+e.target.value}))} />
        </div>
        <Input label="Start Date & Time" type="datetime-local" value={form.startTime} onChange={e => setForm(f=>({...f,startTime:e.target.value}))} />

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Select MCQ Questions ({form.mcqQuestions.length})</div>
          <div style={{ maxHeight:150, overflowY:'auto', border:'1px solid #1e2d45', borderRadius:9 }}>
            {questions.map(q => (
              <label key={q._id} style={{ display:'flex', gap:10, padding:'9px 12px', cursor:'pointer', borderBottom:'1px solid #1e2d45', fontSize:13, alignItems:'center' }}>
                <input type="checkbox" checked={form.mcqQuestions.includes(q._id)} onChange={() => setForm(f => ({ ...f, mcqQuestions: f.mcqQuestions.includes(q._id) ? f.mcqQuestions.filter(x=>x!==q._id) : [...f.mcqQuestions,q._id] }))} />
                <span>{q.title}</span>
              </label>
            ))}
            {questions.length === 0 && <div style={{ padding:12, color:'#64748b', fontSize:12 }}>Ask admin to add questions first.</div>}
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Select Coding Problems ({form.codingQuestions.length})</div>
          <div style={{ maxHeight:130, overflowY:'auto', border:'1px solid #1e2d45', borderRadius:9 }}>
            {codingQs.map(q => (
              <label key={q._id} style={{ display:'flex', gap:10, padding:'9px 12px', cursor:'pointer', borderBottom:'1px solid #1e2d45', fontSize:13, alignItems:'center' }}>
                <input type="checkbox" checked={form.codingQuestions.includes(q._id)} onChange={() => setForm(f => ({ ...f, codingQuestions: f.codingQuestions.includes(q._id) ? f.codingQuestions.filter(x=>x!==q._id) : [...f.codingQuestions,q._id] }))} />
                <span>{q.title}</span>
              </label>
            ))}
            {codingQs.length === 0 && <div style={{ padding:12, color:'#64748b', fontSize:12 }}>No coding problems yet.</div>}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="success" onClick={save}>Create Test →</Btn>
        </div>
      </Modal>
    </div>
  );
}
