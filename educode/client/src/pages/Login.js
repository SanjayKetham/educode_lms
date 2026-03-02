import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.role);
      toast.success(`Welcome back, ${user.name}!`);
      const path = user.role === 'admin' ? '/admin' : user.role === 'college' ? '/college' : '/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: isDarkMode ? '#0a0e1a' : '#f8fafc',
    surface: isDarkMode ? '#111827' : '#ffffff',
    border: isDarkMode ? '#1e2d45' : '#e2e8f0',
    text: isDarkMode ? '#e2e8f0' : '#0f172a',
    muted: isDarkMode ? '#64748b' : '#64748b',
    shadow: isDarkMode ? '0 40px 80px rgba(0,0,0,0.5)' : '0 40px 80px rgba(0,0,0,0.05)',
    inputBg: isDarkMode ? '#0a0e1a' : '#f8fafc',
    gradientBg: isDarkMode
      ? 'radial-gradient(ellipse at 20% 50%,rgba(0,212,255,0.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(124,58,237,0.09) 0%,transparent 50%)'
      : 'radial-gradient(ellipse at 20% 50%,rgba(0,212,255,0.1) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(124,58,237,0.1) 0%,transparent 50%)',
    demoBg: isDarkMode ? 'rgba(0,212,255,0.05)' : 'rgba(0,212,255,0.1)',
    demoBorder: isDarkMode ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.25)',
  };

  return (
    <div style={{ minHeight:'100vh', background: theme.bg, display:'flex', alignItems:'center', justifyContent:'center', position: 'relative',
      backgroundImage: theme.gradientBg, transition: 'background 0.3s ease' }}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{ position: 'absolute', top: 20, right: 20, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: theme.text, transition: 'all 0.3s ease' }}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div style={{ background: theme.surface, border:`1px solid ${theme.border}`, borderRadius:20, padding:44, width:420, boxShadow: theme.shadow, transition: 'all 0.3s ease' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, marginBottom:4 }}>
          <span style={{ color:'#00d4ff' }}>Edu</span><span style={{ color:'#7c3aed' }}>Code</span> <span style={{ color: theme.text }}>LMS</span>
        </div>
        <div style={{ color: theme.muted, fontSize:13, marginBottom:32 }}>Sign in to your learning account</div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color: theme.muted, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Email</label>
            <input required type="email" placeholder="you@college.edu" value={form.email} onChange={e => setForm({...form, email:e.target.value})}
              style={{ width:'100%', padding:'12px 14px', background: theme.inputBg, border:`1px solid ${theme.border}`, borderRadius:10, color: theme.text, fontSize:14, outline:'none', boxSizing:'border-box', transition: 'all 0.3s ease' }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color: theme.muted, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Password</label>
            <input required type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password:e.target.value})}
              style={{ width:'100%', padding:'12px 14px', background: theme.inputBg, border:`1px solid ${theme.border}`, borderRadius:10, color: theme.text, fontSize:14, outline:'none', boxSizing:'border-box', transition: 'all 0.3s ease' }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color: theme.muted, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Role</label>
            <select value={form.role} onChange={e => setForm({...form, role:e.target.value})}
              style={{ width:'100%', padding:'12px 14px', background: theme.inputBg, border:`1px solid ${theme.border}`, borderRadius:10, color: theme.text, fontSize:14, outline:'none', transition: 'all 0.3s ease' }}>
              <option value="student">Student</option>
              <option value="admin">Admin / Faculty</option>
              <option value="college">College</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#7c3aed,#00d4ff)', border:'none', borderRadius:10, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1, transition: 'all 0.3s ease' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:20, fontSize:13, color: theme.muted }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'#00d4ff', textDecoration:'none' }}>Register</Link>
        </div>

        {/* <div style={{ marginTop:24, padding:'14px', background: theme.demoBg, border:`1px solid ${theme.demoBorder}`, borderRadius:10, fontSize:12, color: theme.muted, transition: 'all 0.3s ease' }}>
          <strong style={{ color:'#00d4ff' }}>Demo:</strong> Register first, then seed the DB with <code style={{ color:'#7c3aed' }}>npm run seed</code>
        </div> */}
      </div>
    </div>
  );
}

