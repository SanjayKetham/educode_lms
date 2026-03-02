import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge } from '../../components/UI';
import api from '../../utils/api';

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/assessments').then(r => { setAssessments(r.data.assessments); setLoading(false); });
  }, []);

  const statusColor = { open:'#10b981', closed:'#ef4444', upcoming:'#f59e0b', draft:'#64748b' };

  return (
    <div className="fade-in">
      <PageHeader title="Assessments" />
      <div style={{ padding:'22px 28px' }}>
        {loading ? <div style={{ color:'#64748b' }}>Loading...</div> :
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {assessments.map(a => {
              const sub = a.userSubmission;
              return (
                <Card key={a._id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <Badge color={statusColor[a.status] || '#64748b'}>{a.status}</Badge>
                    <span style={{ fontSize:11, color:'#64748b' }}>{a.category}</span>
                  </div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:8 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:'#64748b', lineHeight:2 }}>
                    ❓ {a.questions?.length || 0} Questions<br/>
                    ⏱️ {a.duration} Minutes<br/>
                    📊 Pass: {a.passingScore}%<br/>
                    {sub ? <span>✅ Your Score: <span style={{ color:'#10b981', fontWeight:600 }}>{sub.percentage}%</span></span> : '📋 Not Attempted'}
                  </div>
                  <div style={{ marginTop:16 }}>
                    {a.status === 'open' && !sub ? (
                      <button onClick={() => navigate(`/assessments/${a._id}/take`)}
                        style={{ width:'100%', padding:'10px', background:'linear-gradient(135deg,#7c3aed,#00d4ff)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        Start Assessment →
                      </button>
                    ) : sub ? (
                      <div style={{ textAlign:'center', padding:'10px', background: sub.percentage >= a.passingScore ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius:9, fontSize:13, color: sub.percentage >= a.passingScore ? '#10b981' : '#ef4444', fontWeight:600 }}>
                        {sub.percentage >= a.passingScore ? '🏆 Passed' : '❌ Failed'} — {sub.percentage}%
                      </div>
                    ) : (
                      <div style={{ textAlign:'center', padding:10, background:'rgba(100,116,139,0.1)', borderRadius:9, fontSize:12, color:'#64748b' }}>
                        {a.status === 'upcoming' ? '⏰ Opens soon' : '🔒 Closed'}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            {assessments.length === 0 && <div style={{ color:'#64748b', fontSize:13 }}>No assessments available yet.</div>}
          </div>
        }
      </div>
    </div>
  );
}
