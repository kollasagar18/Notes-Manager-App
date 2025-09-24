import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetOtpPage from './pages/ResetOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserNotesPage from './pages/UserNotesPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Components
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!token || isAdmin) {
    return <Navigate to="/user/login" replace />;
  }
  
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!token || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* User Routes */}
            <Route path="/user" element={<UserPage />} />
            <Route path="/user/login" element={<UserLoginPage />} />
            <Route path="/user/register" element={<UserRegisterPage />} />
            <Route path="/user/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/user/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/user/reset-otp" element={<ResetOtpPage />} />
            <Route path="/user/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected User Routes */}
            <Route path="/user/notes" element={
              <ProtectedUserRoute>
                <UserNotesPage />
              </ProtectedUserRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLoginPage />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;