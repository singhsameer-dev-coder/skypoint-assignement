import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import PageLoader from './components/PageLoader';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate pages
import JobList from './pages/candidate/JobList';
import JobDetail from './pages/candidate/JobDetail';
import MyApplications from './pages/candidate/MyApplications';
import SavedJobs from './pages/candidate/SavedJobs';
import CandidateProfile from './pages/candidate/CandidateProfile';

// HR pages
import HRDashboard from './pages/hr/HRDashboard';
import PostJob from './pages/hr/PostJob';
import EditJob from './pages/hr/EditJob';
import ManageJobs from './pages/hr/ManageJobs';
import JobApplications from './pages/hr/JobApplications';
import CompanySetup from './pages/hr/CompanySetup';
import HRProfile from './pages/hr/HRProfile';

// Profile page — shows different component based on user role
const ProfilePage = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'employer' ? <HRProfile /> : <CandidateProfile />;
};

function AppRoutes() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public job routes */}
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Candidate-only routes */}
          <Route
            path="/my-applications"
            element={
              <PrivateRoute>
                <RoleRoute role="job_seeker">
                  <MyApplications />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/saved-jobs"
            element={
              <PrivateRoute>
                <RoleRoute role="job_seeker">
                  <SavedJobs />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Profile — role-aware */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* HR-only routes */}
          <Route
            path="/hr/dashboard"
            element={
              <PrivateRoute>
                <RoleRoute role="employer">
                  <HRDashboard />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/post-job"
            element={
              <PrivateRoute>
                <RoleRoute role="employer">
                  <PostJob />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/jobs/:id/edit"
            element={
              <PrivateRoute>
                <RoleRoute role="employer">
                  <EditJob />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/manage-jobs"
            element={
              <PrivateRoute>
                <RoleRoute role="employer">
                  <ManageJobs />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/jobs/:jobId/applications"
            element={
              <PrivateRoute>
                <RoleRoute role="employer">
                  <JobApplications />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/company"
            element={
              <PrivateRoute>
                <RoleRoute role="employer">
                  <CompanySetup />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
