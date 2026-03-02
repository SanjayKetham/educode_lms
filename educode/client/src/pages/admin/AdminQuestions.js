import React, { useState, useEffect } from 'react';
import { PageHeader, Modal, Input, Select, Textarea, Btn, DiffBadge, Badge } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { type:'mcq', title:'', description:'', category:'DSA', difficulty:'easy', marks:2, options:['','','',''], correctAnswer:0, examples:[{input:'',output:'',explanation:''}], starterCode:{c:'',java:'',python:''},testCases:[{input:'',output:'',isHidden:false}] };

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('mcq');
  const [loading, setLoading] = useState(true);

  const load = () => api.get(`/questions?type=${tab}`).then(r => { setQuestions(r.data.questions); setLoading(false); });
  useEffect(() => { load(); }, [tab]);

  const set = k => v => setForm(f => ({...f, [k]: v}));
  const setOpt = (i, v) => setForm(f => { const opts = [...f.options]; opts[i]=v; return {...f, options:opts}; });

  const save = async () => {
    try {
      if (editing) { await api.put(`/questions/${editing}`, form); toast.success('Updated'); }
      else { await api.post('/questions', form); toast.success('Created'); }
      setModal(false); setEditing(null); setForm({...EMPTY}); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete question?')) return;
    await api.delete(`/questions/${id}`);
    toast.success('Deleted'); load();
  };

  const openEdit = (q) => { setForm({...EMPTY, ...q}); setEditing(q._id); setModal(true); };

  return (
    <div className="fade-in">
      <PageHeader title="Question Bank">
        <Btn onClick={() => { setForm({...EMPTY, type:tab}); setEditing(null); setModal(true); }}>+ Add Question</Btn>
      </PageHeader>
      <div style={{ padding:'22px 28px' }}>
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid #1e2d45', marginBottom:20 }}>
          {['mcq','coding'].map(t => (
            <button key={t} onClick={() => { setTab(t); setLoading(true); }}
              style={{ padding:'10px 20px', fontSize:13, fontWeight:500, cursor:'pointer', border:'none', background:'transparent', borderBottom:'2px solid', marginBottom:-1, textTransform:'capitalize',
                borderBottomColor: tab===t ? '#00d4ff' : 'transparent', color: tab===t ? '#00d4ff' : '#64748b' }}>
              {t === 'mcq' ? 'MCQ Questions' : 'Coding Problems'}
            </button>
          ))}
        </div>

        <div style={{ background:'#141c2e', border:'1px solid #1e2d45', borderRadius:12, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['#','Question','Category','Difficulty','Marks','Actions'].map(c => (
                <th key={c} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', borderBottom:'1px solid #1e2d45' }}>{c}</th>
              ))}</tr>
            </thead>
            <tbody>
              {!loading && questions.map((q,i) => (
                <tr key={q._id} style={{ borderBottom:'1px solid #1e2d45' }}>
                  <td style={{ padding:'12px 16px', color:'#64748b', fontSize:13 }}>{i+1}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, maxWidth:300 }}>{q.title}</td>
                  <td style={{ padding:'12px 16px' }}><Badge color="#00d4ff">{q.category}</Badge></td>
                  <td style={{ padding:'12px 16px' }}><DiffBadge diff={q.difficulty} /></td>
                  <td style={{ padding:'12px 16px', fontSize:13 }}>{q.marks}</td>
                  <td style={{ padding:'12px 16px', display:'flex', gap:8 }}>
                    <Btn variant="outline" style={{ padding:'5px 12px', fontSize:12 }} onClick={() => openEdit(q)}>Edit</Btn>
                    <Btn variant="danger" style={{ padding:'5px 12px', fontSize:12 }} onClick={() => del(q._id)}>Delete</Btn>
                  </td>
                </tr>
              ))}
              {!loading && questions.length === 0 && (
                <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#64748b', fontSize:13 }}>No questions yet. Add one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Question' : 'Add Question'} width={600}>
        <Select label="Type" value={form.type} onChange={e => set('type')(e.target.value)}>
          <option value="mcq">MCQ</option><option value="coding">Coding</option>
        </Select>
        <Input label="Title" value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Question title" />
        <Textarea label="Description / Question Text" value={form.description} onChange={e => set('description')(e.target.value)} placeholder="Full question..." />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <Select label="Category" value={form.category} onChange={e => set('category')(e.target.value)}>
            <option>DSA</option><option>Java</option><option>C</option><option>SQL</option>
          </Select>
          <Select label="Difficulty" value={form.difficulty} onChange={e => set('difficulty')(e.target.value)}>
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </Select>
          <Input label="Marks" type="number" value={form.marks} onChange={e => set('marks')(+e.target.value)} />
        </div>

        {form.type === 'mcq' ? (
          <>
            {[0,1,2,3].map(i => (
              <Input key={i} label={`Option ${String.fromCharCode(65+i)}`} value={form.options?.[i]||''} onChange={e => setOpt(i, e.target.value)} />
            ))}
            <Select label="Correct Answer" value={form.correctAnswer} onChange={e => set('correctAnswer')(+e.target.value)}>
              {[0,1,2,3].map(i => <option key={i} value={i}>Option {String.fromCharCode(65+i)}</option>)}
            </Select>
          </>
        ) : (
          <>
            <Input label="Example Input" value={form.examples?.[0]?.input||''} onChange={e => setForm(f => ({...f, examples:[{...f.examples?.[0], input:e.target.value}]}))} />
            <Input label="Example Output" value={form.examples?.[0]?.output||''} onChange={e => setForm(f => ({...f, examples:[{...f.examples?.[0], output:e.target.value}]}))} />
            <Textarea label="Starter Code (C)" value={form.starterCode?.c||''} onChange={e => setForm(f => ({...f, starterCode:{...f.starterCode, c:e.target.value}}))} />
            <Input label="Test Case Input" value={form.testCases?.[0]?.input||''} onChange={e => setForm(f => ({...f, testCases:[{...f.testCases?.[0], input:e.target.value}]}))} />
            <Input label="Test Case Output" value={form.testCases?.[0]?.output||''} onChange={e => setForm(f => ({...f, testCases:[{...f.testCases?.[0], output:e.target.value}]}))} />
          </>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={save}>{editing ? 'Update' : 'Create'} Question</Btn>
        </div>
      </Modal>
    </div>
  );
}
