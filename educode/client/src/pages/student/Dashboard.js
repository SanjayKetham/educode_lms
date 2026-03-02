import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Stat, Card } from '../../components/UI';
import api from '../../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ courses:[], assessments:[], leaderboard:[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cr, as, lb] = await Promise.all([
          api.get('/courses'),
          api.get('/assessments'),
          api.get('/leaderboard'),
        ]);
        setData({ courses: cr.data.courses?.slice(0,4) || [], assessments: as.data.assessments || [], leaderboard: lb.data.leaderboard?.slice(0,3) || [] });
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const solvedCount = user?.solvedProblems?.length || 0;
  const enrolledCount = user?.enrolledCourses?.length || 0;
  const bestScore = data.assessments.filter(a => a.userSubmission).reduce((max, a) => Math.max(max, a.userSubmission?.percentage || 0), 0);

  return (
    <div className="fade-in">
      <PageHeader title="Dashboard">
        <span style={{ fontSize:13, color:'var(--text-muted)' }}>📅 {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
      </PageHeader>
      <div style={{ padding:'24px 28px' }}>
        <div style={{ marginBottom:22 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>
            Welcome back, <span style={{ color:'var(--accent)' }}>{user?.name}</span> 👋
          </div>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>Continue your learning journey. Keep it up!</div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
          <Stat icon="📚" value={enrolledCount} label="Enrolled Courses" change="Active learner" color="var(--accent)" />
          <Stat icon="✅" value={solvedCount} label="Problems Solved" change="Keep practicing!" color="#7c3aed" />
          <Stat icon="🎯" value={`${bestScore}%`} label="Best Assessment" change="Great score!" color="#10b981" />
          <Stat icon="🔥" value={user?.streak || 0} label="Day Streak" change="Don't break it!" color="#f59e0b" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}>
          {/* Courses progress */}
          <Card>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>My Courses</div>
              <span style={{ fontSize:12, color:'var(--accent)', cursor:'pointer' }} onClick={() => navigate('/courses')}>View All →</span>
            </div>
            {loading ? <div style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</div> :
              data.courses.length === 0 ? <div style={{ color:'var(--text-muted)', fontSize:13 }}>No courses yet. <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => navigate('/courses')}>Browse courses →</span></div> :
              data.courses.map((c, i) => {
                const prog = user?.courseProgress?.find(p => p.course === c._id);
                const pct = prog?.progress || 0;
                const icons = { DSA:'🗂️', Java:'☕', SQL:'🗄️', C:'⚙️' };
                return (
                  <div key={c._id} onClick={() => navigate(`/courses/${c._id}`)} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i < data.courses.length-1 ? '1px solid var(--border)' : 'none', cursor:'pointer' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'rgba(0,212,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{icons[c.category] || '📚'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{c.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.totalLessons} lessons · {c.level}</div>
                      <div style={{ height:3, background:'var(--border)', borderRadius:2, marginTop:5 }}>
                        <div style={{ height:'100%', background:'linear-gradient(90deg,#7c3aed,var(--accent))', borderRadius:2, width:`${pct}%` }} />
                      </div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--accent)' }}>{pct}%</div>
                  </div>
                );
              })
            }
          </Card>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Upcoming assessments */}
            <Card>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>Upcoming</div>
              {data.assessments.filter(a => a.status === 'open' && !a.userSubmission).slice(0,3).map(a => (
                <div key={a._id} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', marginTop:4, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:500 }}>{a.title}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.duration} min · {a.questions?.length || 0} Qs</div>
                  </div>
                </div>
              ))}
              {data.assessments.filter(a => a.status === 'open' && !a.userSubmission).length === 0 &&
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>No pending assessments 🎉</div>}
            </Card>

            {/* Mini leaderboard */}
            <Card>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>Top Students</div>
              {data.leaderboard.map(l => (
                <div key={l._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:14, fontWeight:700, width:26, color: l.rank===1?'#f59e0b':l.rank===2?'#94a3b8':'#c2773a' }}>#{l.rank}</span>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>{l.name[0]}</div>
                  <span style={{ flex:1, fontSize:13 }}>{l.name} {l.isCurrentUser && <span style={{ fontSize:10, color:'var(--accent)' }}>(you)</span>}</span>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:13, color:'var(--accent)' }}>{l.totalScore}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
