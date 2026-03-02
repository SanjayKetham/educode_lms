import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Student
import Dashboard from './pages/student/Dashboard';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import Compiler from './pages/student/Compiler';
import Problems from './pages/student/Problems';
import Assessments from './pages/student/Assessments';
import TakeAssessment from './pages/student/TakeAssessment';
import CollegeTestPage from './pages/student/CollegeTestPage';
import Leaderboard from './pages/student/Leaderboard';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminAssessments from './pages/admin/AdminAssessments';
import AdminTests from './pages/admin/AdminTests';
import AdminStudents from './pages/admin/AdminStudents';

// College
import CollegePortal from './pages/college/CollegePortal';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const defaultPath = user?.role === 'admin' ? '/admin' : user?.role === 'college' ? '/college' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={defaultPath} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={defaultPath} />} />

      {/* Student Routes */}
      <Route path="/" element={<ProtectedRoute roles={['student']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="courses"    element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="compiler"   element={<Compiler />} />
        <Route path="problems"   element={<Problems />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="assessments/:id/take" element={<TakeAssessment />} />
        <Route path="college-test" element={<CollegeTestPage />} />
        <Route path="leaderboard" element={<Leaderboard />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="courses"     element={<AdminCourses />} />
        <Route path="questions"   element={<AdminQuestions />} />
        <Route path="assessments" element={<AdminAssessments />} />
        <Route path="tests"       element={<AdminTests />} />
        <Route path="students"    element={<AdminStudents />} />
      </Route>

      {/* College Routes */}
      <Route path="/college" element={<ProtectedRoute roles={['college']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<CollegePortal />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? defaultPath : '/login'} />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#111827', color: '#e2e8f0', border: '1px solid #1e2d45', fontFamily: 'DM Sans, sans-serif' },
          success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
