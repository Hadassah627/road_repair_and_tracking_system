import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import ClerkDashboard from './pages/ClerkDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import AdministratorDashboard from './pages/AdministratorDashboard';
import MayorDashboard from './pages/MayorDashboard';
import SupportDashboard from './pages/SupportDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Dashboard Router based on role - redirects to role-specific route
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  // Redirect to role-specific dashboard route
  switch (user.role) {
    case 'resident':
      return <Navigate to="/resident/dashboard" replace />;
    case 'clerk':
      return <Navigate to="/clerk/dashboard" replace />;
    case 'supervisor':
      return <Navigate to="/supervisor/dashboard" replace />;
    case 'administrator':
      return <Navigate to="/admin/dashboard" replace />;
    case 'mayor':
      return <Navigate to="/mayor/dashboard" replace />;
    case 'support':
      return <Navigate to="/support/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Legacy dashboard route - redirects to role-specific route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Role-specific dashboard routes */}
          <Route
            path="/resident/dashboard"
            element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clerk/dashboard"
            element={
              <ProtectedRoute allowedRoles={['clerk']}>
                <ClerkDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/supervisor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['administrator']}>
                <AdministratorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mayor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['mayor']}>
                <MayorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/support/dashboard"
            element={
              <ProtectedRoute allowedRoles={['support']}>
                <SupportDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">
                    Unauthorized Access
                  </h1>
                  <p className="text-gray-600">
                    You don't have permission to access this page.
                  </p>
                </div>
              </div>
            }
          />

          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
