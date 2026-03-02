import React, { useState, useEffect } from 'react';
import { PageHeader, Card } from '../../components/UI';
import api from '../../utils/api';

export default function Leaderboard() {
  const [lb, setLb] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard').then(r => { setLb(r.data.leaderboard); setLoading(false); });
  }, []);

  const rankColor = r => r===1?'#f59e0b':r===2?'#94a3b8':r===3?'#c2773a':'#64748b';
  const medal = r => r===1?'🥇':r===2?'🥈':r===3?'🥉':null;

  return (
    <div className="fade-in">
      <PageHeader title="Leaderboard" />
      <div style={{ padding:'22px 28px', maxWidth:700 }}>
        <Card>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:18 }}>🏆 Overall Rankings</div>
          {loading ? <div style={{ color:'#64748b', fontSize:13 }}>Loading...</div> :
            lb.map(l => (
              <div key={l._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 14px', borderRadius:10, marginBottom:6, background:'#111827', border: l.isCurrentUser ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent' }}>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:15, fontWeight:700, width:28, color:rankColor(l.rank) }}>
                  {medal(l.rank) || `#${l.rank}`}
                </div>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#00d4ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>{l.name[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>
                    {l.name}
                    {l.isCurrentUser && <span style={{ fontSize:10, color:'#00d4ff', marginLeft:8, background:'rgba(0,212,255,0.1)', padding:'2px 6px', borderRadius:4 }}>You</span>}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{l.college || 'Independent'}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:14, color:'#00d4ff', fontWeight:700 }}>{l.totalScore}</div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{l.solved} solved · {l.streak}🔥</div>
                </div>
              </div>
            ))
          }
          {!loading && lb.length === 0 && <div style={{ color:'#64748b', fontSize:13 }}>No rankings yet. Start solving problems!</div>}
        </Card>
      </div>
    </div>
  );
}
