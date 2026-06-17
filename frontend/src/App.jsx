import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobsPage from './pages/JobsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import StudentProfile from './pages/StudentProfile';
import RecruiterProfile from './pages/RecruiterProfile';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'STUDENT') return <Navigate to="/student-dashboard" replace />;
  return <Navigate to="/recruiter-dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/student-dashboard" element={
        <ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
      } />
      <Route path="/recruiter-dashboard" element={
        <ProtectedRoute roles={['RECRUITER', 'ADMIN']}><RecruiterDashboard /></ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute><JobsPage /></ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute><ApplicationsPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute roles={['STUDENT']}><StudentProfile /></ProtectedRoute>
      } />
      <Route path="/recruiter-profile" element={
        <ProtectedRoute roles={['RECRUITER', 'ADMIN']}><RecruiterProfile /></ProtectedRoute>
      } />


        <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
