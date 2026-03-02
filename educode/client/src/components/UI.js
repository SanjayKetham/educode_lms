import React from 'react';

const s = {
  btn: {
    base: { border: 'none', borderRadius: 9, padding: '9px 18px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .2s' },
    primary: { background: 'linear-gradient(135deg,#7c3aed,var(--accent))', color: '#fff' },
    accent:  { background: 'var(--accent)', color: 'var(--bg)' },
    success: { background: '#10b981', color: '#fff' },
    danger:  { background: '#ef4444', color: '#fff' },
    warn:    { background: '#f59e0b', color: 'var(--bg)' },
    outline: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' },
    ghost:   { background: 'transparent', color: 'var(--text-muted)' },
  },
};

export const Btn = ({ variant = 'primary', children, style, ...p }) => (
  <button style={{ ...s.btn.base, ...s.btn[variant], ...style }} {...p}>{children}</button>
);

export const Card = ({ children, style }) => (
  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, transition: 'background 0.3s ease, border 0.3s ease', ...style }}>{children}</div>
);

export const Badge = ({ children, color = '#00d4ff' }) => (
  <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:`${color}22`, color, border:`1px solid ${color}44` }}>{children}</span>
);

export const DiffBadge = ({ diff }) => {
  const map = { easy:['#10b981'], medium:['#f59e0b'], hard:['#ef4444'] };
  const [c] = map[diff] || ['#64748b'];
  return <Badge color={c}>{diff}</Badge>;
};

export const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</label>}
    <input style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:9, color:'var(--text)', fontSize:14, outline:'none', fontFamily:'DM Sans, sans-serif', boxSizing:'border-box', transition: 'all 0.3s ease' }} {...props} />
  </div>
);

export const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</label>}
    <select style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:9, color:'var(--text)', fontSize:14, outline:'none', fontFamily:'DM Sans, sans-serif', transition: 'all 0.3s ease' }} {...props}>{children}</select>
  </div>
);

export const Textarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</label>}
    <textarea style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:9, color:'var(--text)', fontSize:14, outline:'none', fontFamily:'DM Sans, sans-serif', resize:'vertical', minHeight:80, boxSizing:'border-box', transition: 'all 0.3s ease' }} {...props} />
  </div>
);

export const Spinner = () => (
  <div style={{ width:20, height:20, border:'2px solid var(--border)', borderTop:'2px solid var(--accent)', borderRadius:'50%' }} className="spin" />
);

export const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:32, width, maxWidth:'90vw', maxHeight:'85vh', overflowY:'auto', boxShadow:'var(--shadow)', transition: 'all 0.3s ease' }}>
        {title && <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, marginBottom:24 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
};

export const Table = ({ cols, rows, renderRow }) => (
  <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', transition: 'all 0.3s ease' }}>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead>
        <tr>{cols.map((c,i) => <th key={i} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{c}</th>)}</tr>
      </thead>
      <tbody>{rows.map((row, i) => <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>{renderRow(row, i)}</tr>)}</tbody>
    </table>
  </div>
);

export const Stat = ({ icon, value, label, change, color = 'var(--accent)' }) => (
  <Card style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
    <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color }}>{value}</div>
    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{label}</div>
    {change && <div style={{ fontSize:11, color:'#10b981', marginTop:6 }}>{change}</div>}
  </Card>
);

export const PageHeader = ({ title, children }) => (
  <div style={{ padding:'18px 28px', borderBottom:'1px solid var(--border)', background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, transition: 'all 0.3s ease' }}>
    <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700 }}>{title}</div>
    <div style={{ display:'flex', gap:10, alignItems:'center' }}>{children}</div>
  </div>
);

export const EmptyState = ({ icon, title, sub }) => (
  <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text-muted)' }}>
    <div style={{ fontSize:48, marginBottom:14 }}>{icon}</div>
    <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginBottom:6 }}>{title}</div>
    {sub && <div style={{ fontSize:13 }}>{sub}</div>}
  </div>
);
