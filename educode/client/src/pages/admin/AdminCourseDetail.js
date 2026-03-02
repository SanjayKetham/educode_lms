import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PageHeader, Modal, Input, Select, Btn, Badge, Card } from '../../components/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [lessonModal, setLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', duration: 10, videoUrl: '' });
  
  // Assessment linking
  const [selectedAssessment, setSelectedAssessment] = useState('');

  const load = async () => {
    try {
      const [courseRes, assessRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get('/assessments')
      ]);
      setCourse(courseRes.data.course);
      setAssessments(assessRes.data.assessments);
      setSelectedAssessment(courseRes.data.course.assessment?._id || '');
      setLoading(false);
    } catch (err) {
      toast.error('Error loading course details');
      navigate('/admin/courses');
    }
  };

  useEffect(() => { load(); }, [id]);

  const saveLesson = async () => {
    try {
      if (editingLesson) {
        await api.put(`/courses/${id}/lessons/${editingLesson}`, lessonForm);
        toast.success('Lesson updated!');
      } else {
        await api.post(`/courses/${id}/lessons`, lessonForm);
        toast.success('Lesson added!');
      }
      setLessonModal(false);
      load();
    } catch {
      toast.error('Error saving lesson');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/courses/${id}/lessons/${lessonId}`);
      toast.success('Lesson deleted!');
      load();
    } catch {
      toast.error('Error deleting lesson');
    }
  };

  const openAddLesson = () => {
    setLessonForm({ title: '', content: '', duration: 10, videoUrl: '' });
    setEditingLesson(null);
    setLessonModal(true);
  };

  const openEditLesson = (lesson) => {
    setLessonForm({ title: lesson.title, content: lesson.content, duration: lesson.duration, videoUrl: lesson.videoUrl });
    setEditingLesson(lesson._id);
    setLessonModal(true);
  };

  const linkAssessment = async () => {
    try {
      await api.put(`/courses/${id}`, { assessment: selectedAssessment || null });
      toast.success('Assessment linked successfully!');
      load();
    } catch {
      toast.error('Error linking assessment');
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading...</div>;
  if (!course) return null;

  return (
    <div className="fade-in" style={{ paddingBottom: 60 }}>
      <PageHeader title={`Manage: ${course.title}`}>
        <Btn variant="outline" onClick={() => navigate('/admin/courses')}>← Back to Courses</Btn>
      </PageHeader>
      
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Course Info & Assessment Linking */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 24, alignItems: 'start' }}>
          <Card>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 40 }}>{course.icon}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>{course.title}</h2>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Badge color="#7c3aed">{course.category}</Badge>
                  <Badge color="#64748b">{course.level}</Badge>
                </div>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{course.description}</p>
          </Card>

          <Card title="Course Assessment">
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, marginTop: -4 }}>
              Link an assessment for students to take at the end of this course.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <select 
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                style={{ 
                  flex: 1, background: '#111827', border: '1px solid #1e2d45', 
                  color: '#e2e8f0', padding: '8px 12px', borderRadius: 6, fontSize: 14 
                }}
              >
                <option value="">-- No Assessment --</option>
                {assessments.map(a => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
              <Btn variant="primary" onClick={linkAssessment}>Save</Btn>
            </div>
          </Card>
        </div>

        {/* Lessons List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Lessons ({course.lessons?.length || 0})</h3>
            <Btn variant="success" onClick={openAddLesson}>+ Add Lesson</Btn>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {course.lessons?.length > 0 ? course.lessons.map((lesson, idx) => (
              <div key={lesson._id} style={{ 
                background: '#141c2e', border: '1px solid #1e2d45', borderRadius: 8, 
                padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e2d45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>{lesson.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      Duration: {lesson.duration} min {lesson.videoUrl && '• 📹 Has Video'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="outline" onClick={() => openEditLesson(lesson)}>Edit</Btn>
                  <Btn variant="danger" onClick={() => deleteLesson(lesson._id)}>Delete</Btn>
                </div>
              </div>
            )) : (
              <Card style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                No lessons added yet. Click "+ Add Lesson" to start building this course.
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      <Modal open={lessonModal} onClose={() => setLessonModal(false)} title={editingLesson ? 'Edit Lesson' : 'Add Lesson'}>
        <Input label="Lesson Title" value={lessonForm.title} onChange={e => setLessonForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Introduction to Arrays" />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>Content</label>
          <div style={{ background: '#fff', color: '#000', borderRadius: 4 }}>
            <ReactQuill theme="snow" value={lessonForm.content} onChange={val => setLessonForm(f => ({...f, content: val}))} style={{ minHeight: 150 }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Duration (minutes)" type="number" value={lessonForm.duration} onChange={e => setLessonForm(f => ({...f, duration: +e.target.value}))} />
          <Input label="Video URL (optional)" value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({...f, videoUrl: e.target.value}))} placeholder="https://..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="outline" onClick={() => setLessonModal(false)}>Cancel</Btn>
          <Btn variant="success" onClick={saveLesson}>{editingLesson ? 'Update' : 'Save'} Lesson</Btn>
        </div>
      </Modal>
    </div>
  );
}
