import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Btn, Badge } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => {
      setCourse(r.data.course);
      setProgress(r.data.progress);
      setLoading(false);
    }).catch(() => { navigate('/courses'); });
  }, [id]);

  const markComplete = async (lessonIndex) => {
    try {
      const { data } = await api.put(`/courses/${id}/progress`, { lessonIndex });
      setProgress(prev => ({ ...prev, progress: data.progress, completedLessons: [...(prev?.completedLessons || []), lessonIndex] }));
      toast.success('Lesson completed!');
    } catch (err) {
      toast.error('Error updating progress');
    }
  };

  if (loading) return <div style={{ padding:40, color:'#64748b' }}>Loading...</div>;
  if (!course) return null;

  const lesson = course.lessons?.[activeLesson];
  const completedLessons = progress?.completedLessons || [];

  return (
    <div className="fade-in">
      <PageHeader title={course.title}>
        <Btn variant="outline" onClick={() => navigate('/courses')}>← Back</Btn>
        <span style={{ fontSize:12, color:'#00d4ff' }}>{progress?.progress || 0}% complete</span>
      </PageHeader>
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', height:'calc(100vh - 62px)' }}>
        {/* Lesson list */}
        <div style={{ borderRight:'1px solid #1e2d45', overflowY:'auto', background:'#111827' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #1e2d45' }}>
            <div style={{ height:4, background:'#1e2d45', borderRadius:2 }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#7c3aed,#00d4ff)', borderRadius:2, width:`${progress?.progress||0}%` }} />
            </div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:6 }}>{completedLessons.length}/{course.lessons?.length || 0} lessons done</div>
          </div>
          {(course.lessons || []).map((l, i) => (
            <div key={i} onClick={() => setActiveLesson(i)}
              style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #1e2d45', display:'flex', gap:10, alignItems:'flex-start',
                background: i === activeLesson ? 'rgba(0,212,255,0.06)' : 'transparent',
                borderLeft: i === activeLesson ? '3px solid #00d4ff' : '3px solid transparent' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', border:'1px solid', borderColor: completedLessons.includes(i) ? '#10b981' : '#1e2d45',
                background: completedLessons.includes(i) ? '#10b981' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, marginTop:1, flexShrink:0 }}>
                {completedLessons.includes(i) ? '✓' : i+1}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color: i === activeLesson ? '#e2e8f0' : '#94a3b8' }}>{l.title}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>{l.duration || 10} min</div>
              </div>
            </div>
          ))}
          {course.lessons?.length === 0 && <div style={{ padding:24, color:'#64748b', fontSize:13 }}>No lessons added yet.</div>}
        </div>

        {/* Lesson content */}
        <div style={{ overflowY:'auto', padding:32 }}>
          {lesson ? (
            <>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, marginBottom:8 }}>{lesson.title}</div>
              <div style={{ display:'flex', gap:12, marginBottom:24 }}>
                <Badge color="#00d4ff">{course.category}</Badge>
                <Badge color="#64748b">{lesson.duration || 10} min</Badge>
              </div>
              <Card style={{ marginBottom:20, lineHeight:1.8, fontSize:14, color:'#94a3b8', whiteSpace:'pre-wrap' }}>
                {lesson.content || `Welcome to the lesson: ${lesson.title}\n\nThis lesson covers fundamental concepts in ${course.category}. Content can be added by admin via the admin panel.\n\nKey topics:\n• Understanding core concepts\n• Practical examples\n• Hands-on exercises\n• Practice problems`}
              </Card>
              {lesson.videoUrl && (
                <Card style={{ marginBottom:20 }}>
                  <div style={{ fontSize:13, color:'#64748b' }}>📹 Video: <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color:'#00d4ff' }}>{lesson.videoUrl}</a></div>
                </Card>
              )}
              <div style={{ display:'flex', gap:12 }}>
                {activeLesson > 0 && <Btn variant="outline" onClick={() => setActiveLesson(activeLesson-1)}>← Previous</Btn>}
                {!completedLessons.includes(activeLesson) && <Btn variant="success" onClick={() => markComplete(activeLesson)}>✓ Mark Complete</Btn>}
                {activeLesson < (course.lessons?.length || 0) - 1 && <Btn variant="accent" onClick={() => setActiveLesson(activeLesson+1)}>Next Lesson →</Btn>}
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:80, color:'#64748b' }}>
              <div style={{ fontSize:48, marginBottom:14 }}>📚</div>
              <div style={{ fontSize:16, fontWeight:600, color:'#e2e8f0' }}>Select a lesson to begin</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
