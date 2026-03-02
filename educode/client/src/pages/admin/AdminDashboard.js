import React, { useState, useEffect } from 'react';
import { PageHeader, Stat, Card } from '../../components/UI';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students:0, courses:0, questions:0, tests:0 });

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/courses'),
      api.get('/questions'),
      api.get('/tests'),
    ]).then(([u,c,q,t]) => {
      setStats({ students: u.data.users?.length||0, courses: c.data.courses?.length||0, questions: q.data.questions?.length||0, tests: t.data.tests?.length||0 });
    }).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <PageHeader title="Admin Overview" />
      <div style={{ padding:'22px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          <Stat icon="👥" value={stats.students} label="Total Students" color="#00d4ff" />
          <Stat icon="📚" value={stats.courses} label="Active Courses" color="#7c3aed" />
          <Stat icon="❓" value={stats.questions} label="Questions" color="#10b981" />
          <Stat icon="🏫" value={stats.tests} label="College Tests" color="#f59e0b" />
        </div>
        <Card style={{ maxWidth:600 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:12 }}>Quick Actions</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['Add Course','/admin/courses'],['Add Question','/admin/questions'],['Create Assessment','/admin/assessments'],['Create College Test','/admin/tests']].map(([l,h]) => (
              <a key={l} href={h} style={{ padding:14, background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:10, color:'#e2e8f0', textDecoration:'none', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
                ➕ {l}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
