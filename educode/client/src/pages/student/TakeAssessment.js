import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/assessments/${id}`).then(r => {
      if (r.data.userSubmission) { toast.error('Already submitted'); navigate('/assessments'); return; }
      setAssessment(r.data.assessment);
      setTimeLeft(r.data.assessment.duration * 60);
      setLoading(false);
    }).catch(() => navigate('/assessments'));
  }, [id]);

  useEffect(() => {
    if (!assessment || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [assessment, submitted]);

  const formatTime = (s) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const timeColor = timeLeft < 300 ? '#ef4444' : timeLeft < 600 ? '#f59e0b' : '#e2e8f0';

  const handleSubmit = async (auto = false) => {
    if (submitted) return;
    clearInterval(timerRef.current);
    setSubmitted(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const answersArr = Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption }));
    try {
      const { data } = await api.post(`/assessments/${id}/submit`, { answers: answersArr, timeTaken });
      setResult(data);
      toast.success(auto ? 'Auto-submitted' : 'Submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission error');
      setSubmitted(false);
    }
  };

  if (loading) return <div style={{ padding:40, color:'#64748b' }}>Loading assessment...</div>;
  if (!assessment) return null;

  const questions = assessment.questions || [];
  const q = questions[current];

  if (result) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
        <Card style={{ textAlign:'center', padding:48, maxWidth:500, width:'100%' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>{result.passed ? '🎉' : '😔'}</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800 }}>Test Submitted!</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:72, fontWeight:700, color: result.passed ? '#10b981' : '#ef4444', margin:'16px 0' }}>{result.percentage}%</div>
          <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:24 }}>
            <div style={{ background:'rgba(16,185,129,0.1)', padding:'12px 20px', borderRadius:10 }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#10b981' }}>{result.score}</div>
              <div style={{ fontSize:11, color:'#64748b' }}>Score</div>
            </div>
            <div style={{ background:'rgba(0,212,255,0.1)', padding:'12px 20px', borderRadius:10 }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#00d4ff' }}>{result.totalMarks}</div>
              <div style={{ fontSize:11, color:'#64748b' }}>Total</div>
            </div>
          </div>
          <button onClick={() => navigate('/assessments')}
            style={{ padding:'11px 24px', background:'linear-gradient(135deg,#7c3aed,#00d4ff)', border:'none', borderRadius:9, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Back to Assessments
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding:28, maxWidth:860, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius:16, padding:24, marginBottom:22 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800 }}>{assessment.title}</div>
            <div style={{ fontSize:13, opacity:0.8, marginTop:2 }}>{questions.length} Questions · {assessment.duration} Minutes</div>
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:22, fontWeight:700, color:timeColor, background:'rgba(0,0,0,0.2)', padding:'8px 18px', borderRadius:10 }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Question navigation */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {questions.map((_,i) => (
          <button key={i} onClick={() => setCurrent(i)}
            style={{ width:36, height:36, borderRadius:8, border:'1px solid', fontSize:13, cursor:'pointer',
              borderColor: i === current ? '#00d4ff' : answers[questions[i]?._id] !== undefined ? '#10b981' : '#1e2d45',
              background: answers[questions[i]?._id] !== undefined ? 'rgba(16,185,129,0.15)' : i === current ? 'rgba(0,212,255,0.1)' : '#141c2e',
              color: i === current ? '#00d4ff' : answers[questions[i]?._id] !== undefined ? '#10b981' : '#64748b' }}>
            {i+1}
          </button>
        ))}
      </div>

      {/* Question */}
      {q && (
        <Card style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, color:'#64748b', fontWeight:600, textTransform:'uppercase', marginBottom:10 }}>
            Question {current+1} of {questions.length}
          </div>
          <div style={{ fontSize:16, fontWeight:500, lineHeight:1.6, marginBottom:20 }}>{q.description || q.title}</div>
          {q.options?.map((opt, i) => {
            const sel = answers[q._id] === i;
            return (
              <div key={i} onClick={() => setAnswers({...answers, [q._id]: i})}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', border:'1px solid', marginBottom:10, borderRadius:10, cursor:'pointer', transition:'all .15s',
                  borderColor: sel ? '#7c3aed' : '#1e2d45', background: sel ? 'rgba(124,58,237,0.1)' : 'transparent' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  borderColor: sel ? '#7c3aed' : '#1e2d45', background: sel ? '#7c3aed' : 'transparent' }}>
                  {sel && <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />}
                </div>
                <span style={{ fontSize:14 }}>{String.fromCharCode(65+i)}. {opt}</span>
              </div>
            );
          })}
        </Card>
      )}

      {/* Nav */}
      <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
        {current > 0 && <button onClick={() => setCurrent(c => c-1)} style={{ padding:'9px 18px', background:'transparent', border:'1px solid #1e2d45', borderRadius:9, color:'#e2e8f0', cursor:'pointer' }}>← Prev</button>}
        {current < questions.length-1 && <button onClick={() => setCurrent(c => c+1)} style={{ padding:'9px 18px', background:'transparent', border:'1px solid #1e2d45', borderRadius:9, color:'#e2e8f0', cursor:'pointer' }}>Next →</button>}
        <button onClick={() => { if(window.confirm('Submit assessment?')) handleSubmit(); }}
          style={{ padding:'9px 20px', background:'#10b981', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Submit ✓
        </button>
      </div>

      <div style={{ marginTop:14, fontSize:12, color:'#64748b', textAlign:'right' }}>
        Answered: {Object.keys(answers).length}/{questions.length}
      </div>
    </div>
  );
}
