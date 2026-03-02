import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, Btn } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = { DSA:'rgba(0,212,255,0.12)', Java:'rgba(124,58,237,0.12)', SQL:'rgba(16,185,129,0.12)', C:'rgba(245,158,11,0.12)' };
const ICONS  = { DSA:'🗂️', Java:'☕', SQL:'🗄️', C:'⚙️' };

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(r => { setCourses(r.data.courses); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const enroll = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const cats = ['All', 'DSA', 'Java', 'C', 'SQL'];
  const filtered = courses.filter(c =>
    (filter === 'All' || c.category === filter) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <PageHeader title="Course Library">
        <input placeholder="🔍 Search courses..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'9px 14px', background:'#0a0e1a', border:'1px solid #1e2d45', borderRadius:9, color:'#e2e8f0', fontSize:13, outline:'none', width:200 }} />
      </PageHeader>
      <div style={{ padding:'22px 28px' }}>
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer', border:'1px solid',
                borderColor: filter===c ? '#00d4ff' : '#1e2d45', background: filter===c ? 'rgba(0,212,255,0.08)' : 'transparent',
                color: filter===c ? '#00d4ff' : '#64748b' }}>
              {c}
            </button>
          ))}
        </div>
        {loading ? <div style={{ color:'#64748b', padding:40, textAlign:'center' }}>Loading courses...</div> :
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {filtered.map(c => (
              <div key={c._id} onClick={() => navigate(`/courses/${c._id}`)}
                style={{ background:'#141c2e', border:'1px solid #1e2d45', borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'transform .2s, border-color .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='#00d4ff'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='#1e2d45'}}>
                <div style={{ height:90, background:COLORS[c.category]||'#1e2d45', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38 }}>
                  {c.icon || ICONS[c.category] || '📚'}
                </div>
                <div style={{ padding:16 }}>
                  <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700, textTransform:'uppercase', background:COLORS[c.category]||'#1e2d45', color:'#e2e8f0', marginBottom:8 }}>{c.category}</span>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:4 }}>{c.title}</div>
                  <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5, marginBottom:12 }}>{c.description?.substring(0,90)}...</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontSize:11, color:'#64748b' }}>{c.totalLessons} lessons · {c.enrolledCount?.toLocaleString()} enrolled · {c.level}</div>
                    <button onClick={(e) => enroll(e, c._id)}
                      style={{ padding:'6px 14px', background:'rgba(0,212,255,0.08)', border:'1px solid #00d4ff', color:'#00d4ff', borderRadius:7, fontSize:12, cursor:'pointer' }}>
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
