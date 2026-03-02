import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PageHeader, Modal, Input, Select, Textarea, Btn, Badge } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { title:'', description:'', category:'DSA', level:'Beginner', icon:'📚', color:'rgba(0,212,255,0.12)', lessons:[] };

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/courses').then(r => setCourses(r.data.courses));
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const save = async () => {
    try {
      if (editing) { await api.put(`/courses/${editing}`, form); toast.success('Course updated'); }
      else { await api.post('/courses', form); toast.success('Course created'); }
      setModal(false); setEditing(null); setForm({...EMPTY}); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete course?')) return;
    await api.delete(`/courses/${id}`); toast.success('Deleted'); load();
  };

  const openEdit = (c) => { setForm({...EMPTY, ...c}); setEditing(c._id); setModal(true); };

  return (
    <div className="fade-in">
      <PageHeader title="Manage Courses">
        <Btn onClick={() => { setForm({...EMPTY}); setEditing(null); setModal(true); }}>+ Add Course</Btn>
      </PageHeader>
      <div style={{ padding:'22px 28px' }}>
        <div style={{ background:'#141c2e', border:'1px solid #1e2d45', borderRadius:12, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['#','Course','Category','Level','Lessons','Enrolled','Actions'].map(c => (
                <th key={c} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', borderBottom:'1px solid #1e2d45' }}>{c}</th>
              ))}</tr>
            </thead>
            <tbody>
              {courses.map((c,i) => (
                <tr key={c._id} style={{ borderBottom:'1px solid #1e2d45' }}>
                  <td style={{ padding:'12px 16px', color:'#64748b' }}>{i+1}</td>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontSize:18, marginRight:8 }}>{c.icon}</span><span style={{ fontSize:13, fontWeight:600 }}>{c.title}</span></td>
                  <td style={{ padding:'12px 16px' }}><Badge color="#7c3aed">{c.category}</Badge></td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#94a3b8' }}>{c.level}</td>
                  <td style={{ padding:'12px 16px', fontSize:13 }}>{c.totalLessons}</td>
                  <td style={{ padding:'12px 16px', fontSize:13 }}>{c.enrolledCount?.toLocaleString()}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn variant="outline" style={{ padding:'5px 10px', fontSize:11 }} onClick={() => openEdit(c)}>Edit</Btn>
                      <Btn variant="success" style={{ padding:'5px 10px', fontSize:11 }} onClick={() => navigate(`/admin/courses/${c._id}`)}>Manage</Btn>
                      <Btn variant="danger" style={{ padding:'5px 10px', fontSize:11 }} onClick={() => del(c._id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#64748b', fontSize:13 }}>No courses yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Course' : 'Add Course'}>
        <Input label="Course Title" value={form.title} onChange={set('title')} placeholder="e.g. Data Structures & Algorithms" />
        <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="Course description..." />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Select label="Category" value={form.category} onChange={set('category')}>
            <option>DSA</option><option>Java</option><option>C</option><option>SQL</option>
          </Select>
          <Select label="Level" value={form.level} onChange={set('level')}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </Select>
        </div>
        <Input label="Icon (emoji)" value={form.icon} onChange={set('icon')} placeholder="📚" />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={save}>{editing ? 'Update' : 'Create'} Course</Btn>
        </div>
      </Modal>

    </div>
  );
}
