import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentNav = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/courses', icon: '📚', label: 'My Courses' },
    { to: '/compiler', icon: '💻', label: 'Code Practice' },
    { to: '/problems', icon: '🧩', label: 'Problem Set', badge: 'NEW' },
  ]},
  { section: 'Assessments', items: [
    { to: '/assessments', icon: '📝', label: 'Assessments' },
    { to: '/college-test', icon: '🎯', label: 'College Test' },
    { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  ]},
];

const adminNav = [
  { section: 'Admin Panel', items: [
    { to: '/admin', icon: '📊', label: 'Overview', exact: true },
    { to: '/admin/courses', icon: '📚', label: 'Manage Courses' },
    { to: '/admin/questions', icon: '❓', label: 'Question Bank' },
    { to: '/admin/assessments', icon: '📋', label: 'Assessments' },
    { to: '/admin/tests', icon: '🏫', label: 'College Tests' },
    { to: '/admin/students', icon: '👥', label: 'Students' },
  ]},
];

const collegeNav = [
  { section: 'College Portal', items: [
    { to: '/college', icon: '🏫', label: 'Test Portal' },
  ]},
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navConfig = user?.role === 'admin' ? adminNav : user?.role === 'college' ? collegeNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  const themeVars = isDarkMode ? {
    '--bg': '#0a0e1a',
    '--surface': '#111827',
    '--surface2': '#141c2e',
    '--border': '#1e2d45',
    '--text': '#e2e8f0',
    '--text-muted': '#64748b',
    '--accent': '#00d4ff',
    '--shadow': '0 40px 80px rgba(0,0,0,0.5)'
  } : {
    '--bg': '#f8fafc',
    '--surface': '#ffffff',
    '--surface2': '#ffffff',
    '--border': '#e2e8f0',
    '--text': '#0f172a',
    '--text-muted': '#64748b',
    '--accent': '#0284c7',
    '--shadow': '0 4px 6px -1px rgba(0,0,0,0.1)'
  };

  const activeBg = isDarkMode ? 'rgba(0,212,255,0.08)' : 'rgba(2,132,199,0.08)';

  return (
    <div style={{ ...themeVars, display:'flex', height:'100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'background 0.3s ease, color 0.3s ease' }}>
      {/* Sidebar */}
      <aside style={{ width:260, minWidth:260, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', transition: 'background 0.3s ease, border 0.3s ease' }}>
        {/* Logo */}
        <div style={{ padding:'22px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800 }}>
              <span style={{ color:'var(--accent)' }}>Edu</span><span style={{ color:'#7c3aed' }}>Code</span>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}
              title="Toggle Theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#fff' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color: 'var(--text)' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {navConfig.map(section => (
            <div key={section.section} style={{ padding:'12px 12px 4px' }}>
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', padding:'0 8px', marginBottom:4 }}>{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                    borderRadius:10, textDecoration:'none', fontSize:13, fontWeight:500,
                    marginBottom:2, transition:'all .15s',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    background: isActive ? activeBg : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  })}
                >
                  <span style={{ fontSize:16, width:20, textAlign:'center' }}>{item.icon}</span>
                  <span style={{ flex:1 }}>{item.label}</span>
                  {item.badge && <span style={{ background:'#7c3aed', color:'#fff', fontSize:9, padding:'2px 6px', borderRadius:8, fontWeight:700 }}>{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:16, borderTop:'1px solid var(--border)' }}>
          {user?.college && <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>🏫 {user.college}</div>}
          <div onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, color:'#ef4444', cursor:'pointer', fontSize:13, padding:8, borderRadius:8, transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            🚪 Logout
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:'auto', background:'var(--bg)', display:'flex', flexDirection:'column', transition: 'background 0.3s ease' }}>
        <Outlet />
      </main>
    </div>
  );
}
