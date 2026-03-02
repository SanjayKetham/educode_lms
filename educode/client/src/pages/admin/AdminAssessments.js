// AdminAssessments.js
import React, { useState, useEffect } from 'react';
import { PageHeader, Modal, Input, Select, Textarea, Btn, Badge } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function AdminAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', category:'Mixed', questions:[], duration:30, passingScore:60, status:'draft', shuffleQuestions:false });

  const load = async () => {
    const [a, q, c] = await Promise.all([api.get('/assessments'), api.get('/questions?type=mcq'), api.get('/courses')]);
    setAssessments(a.data.assessments); setQuestions(q.data.questions); setCourses(c.data.courses);
  };
  useEffect(() => { load(); }, []);

  const toggleQ = (id) => setForm(f => ({ ...f, questions: f.questions.includes(id) ? f.questions.filter(q => q!==id) : [...f.questions, id] }));

  const save = async () => {
    try {
      await api.post('/assessments', form);
      toast.success('Assessment created!'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/assessments/${id}`, { status });
    toast.success('Status updated'); load();
  };

  const statusColor = { open:'#10b981', closed:'#ef4444', upcoming:'#f59e0b', draft:'#64748b' };

  return (
    <div className="fade-in">
      <PageHeader title="Manage Assessments">
        <Btn onClick={() => setModal(true)}>+ Create Assessment</Btn>
      </PageHeader>
      <div style={{ padding:'22px 28px' }}>
        <div style={{ background:'#141c2e', border:'1px solid #1e2d45', borderRadius:12, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['#','Title','Category','Questions','Duration','Status','Actions'].map(c => (
                <th key={c} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', borderBottom:'1px solid #1e2d45' }}>{c}</th>
              ))}</tr>
            </thead>
            <tbody>
              {assessments.map((a,i) => (
                <tr key={a._id} style={{ borderBottom:'1px solid #1e2d45' }}>
                  <td style={{ padding:'12px 16px', color:'#64748b' }}>{i+1}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:500 }}>{a.title}</td>
                  <td style={{ padding:'12px 16px' }}><Badge color="#00d4ff">{a.category}</Badge></td>
                  <td style={{ padding:'12px 16px', fontSize:13 }}>{a.questions?.length || 0}</td>
                  <td style={{ padding:'12px 16px', fontSize:13 }}>{a.duration} min</td>
                  <td style={{ padding:'12px 16px' }}><Badge color={statusColor[a.status]||'#64748b'}>{a.status}</Badge></td>
                  <td style={{ padding:'12px 16px' }}>
                    <select value={a.status} onChange={e => updateStatus(a._id, e.target.value)}
                      style={{ background:'#0a0e1a', border:'1px solid #1e2d45', color:'#e2e8f0', padding:'5px 10px', borderRadius:7, fontSize:12, cursor:'pointer' }}>
                      {['draft','open','upcoming','closed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#64748b', fontSize:13 }}>No assessments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Assessment" width={620}>
        <Input label="Assessment Title" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. DSA Mid-Term 2026" />
        <Textarea label="Description (optional)" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <Select label="Category" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
            <option>Mixed</option><option>DSA</option><option>Java</option><option>C</option><option>SQL</option>
          </Select>
          <Input label="Duration (min)" type="number" value={form.duration} onChange={e => setForm(f=>({...f,duration:+e.target.value}))} />
          <Input label="Pass Score (%)" type="number" value={form.passingScore} onChange={e => setForm(f=>({...f,passingScore:+e.target.value}))} />
        </div>
        <Select label="Initial Status" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
          <option>draft</option><option>upcoming</option><option>open</option>
        </Select>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Select Questions ({form.questions.length} selected)</div>
          <div style={{ maxHeight:200, overflowY:'auto', border:'1px solid #1e2d45', borderRadius:9 }}>
            {questions.map(q => (
              <label key={q._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', cursor:'pointer', borderBottom:'1px solid #1e2d45', fontSize:13 }}>
                <input type="checkbox" checked={form.questions.includes(q._id)} onChange={() => toggleQ(q._id)} />
                <span style={{ flex:1 }}>{q.title}</span>
                <Badge color="#64748b">{q.category}</Badge>
              </label>
            ))}
            {questions.length === 0 && <div style={{ padding:16, color:'#64748b', fontSize:12 }}>No MCQ questions yet. Add questions first.</div>}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={save}>Create Assessment</Btn>
        </div>
      </Modal>
    </div>
  );
}

export default AdminAssessments;
