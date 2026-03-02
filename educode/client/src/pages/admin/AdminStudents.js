import React, { useState, useEffect } from 'react';
import { PageHeader, Badge } from '../../components/UI';
import api from '../../utils/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users').then(r => setStudents(r.data.users || []));
  }, []);

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <PageHeader title="Students">
        <input placeholder="🔍 Search students..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'9px 14px', background:'#0a0e1a', border:'1px solid #1e2d45', borderRadius:9, color:'#e2e8f0', fontSize:13, outline:'none', width:200 }} />
      </PageHeader>
      <div style={{ padding:'22px 28px' }}>
        <div style={{ background:'#141c2e', border:'1px solid #1e2d45', borderRadius:12, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['#','Name','Email','College','Enrolled','Solved','Score','Actions'].map(c => (
                <th key={c} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', borderBottom:'1px solid #1e2d45' }}>{c}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((s,i) => (
                <tr key={s._id} style={{ borderBottom:'1px solid #1e2d45' }}>
                  <td style={{ padding:'12px 16px', color:'#64748b' }}>{i+1}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#00d4ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>{s.name[0]}</div>
                      <span style={{ fontSize:13, fontWeight:500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#64748b' }}>{s.email}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#94a3b8' }}>{s.college || '—'}</td>
                  <td style={{ padding:'12px 16px', fontSize:13 }}>{s.enrolledCourses?.length || 0}</td>
                  <td style={{ padding:'12px 16px', fontSize:13 }}>{s.solvedProblems?.length || 0}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, color: s.totalScore > 500 ? '#10b981' : '#f59e0b' }}>{s.totalScore}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <button style={{ padding:'5px 12px', background:'transparent', border:'1px solid #1e2d45', borderRadius:7, color:'#e2e8f0', fontSize:12, cursor:'pointer' }}>View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#64748b', fontSize:13 }}>No students yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
