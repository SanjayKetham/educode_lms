import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', college:'' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm({...form, [k]: e.target.value});
  const inp = (label, key, type='text', placeholder='') => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{label}</label>
      <input required type={type} placeholder={placeholder} value={form[key]} onChange={set(key)}
        style={{ width:'100%', padding:'11px 14px', background:'#0a0e1a', border:'1px solid #1e2d45', borderRadius:9, color:'#e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' }} />
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      const path = user.role === 'admin' ? '/admin' : user.role === 'college' ? '/college' : '/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e1a', display:'flex', alignItems:'center', justifyContent:'center',
      backgroundImage:'radial-gradient(ellipse at 80% 50%,rgba(124,58,237,0.07) 0%,transparent 60%)' }}>
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:44, width:420, boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, marginBottom:4 }}>
          Create Account
        </div>
        <div style={{ color:'#64748b', fontSize:13, marginBottom:28 }}>Join EduCode LMS today</div>
        <form onSubmit={handleSubmit}>
          {inp('Full Name', 'name', 'text', 'John Doe')}
          {inp('Email', 'email', 'email', 'you@college.edu')}
          {inp('Password', 'password', 'password', 'Min 6 characters')}
          {inp('College Name', 'college', 'text', 'ABC Engineering College')}
          <div style={{ marginBottom:22 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Role</label>
            <select value={form.role} onChange={set('role')}
              style={{ width:'100%', padding:'11px 14px', background:'#0a0e1a', border:'1px solid #1e2d45', borderRadius:9, color:'#e2e8f0', fontSize:14, outline:'none' }}>
              <option value="student">Student</option>
              <option value="admin">Admin / Faculty</option>
              <option value="college">College</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#7c3aed,#00d4ff)', border:'none', borderRadius:10, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>
        <div style={{ textAlign:'center', marginTop:18, fontSize:13, color:'#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#00d4ff', textDecoration:'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
