import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/student/Dashboard';
import GroupManagement from './components/student/GroupManagement';
import AssignmentList from './components/student/AssignmentList';
import SubmissionTracker from './components/student/SubmissionTracker';
import AdminDashboard from './components/admin/AdminDashboard';
import AssignmentManager from './components/admin/AssignmentManager';
import Analytics from './components/admin/Analytics';
import GroupTracker from './components/admin/GroupTracker';
import ProtectedRoute from './components/shared/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="groups" element={<GroupManagement />} />
            <Route path="assignments" element={<AssignmentList />} />
            <Route path="submissions" element={<SubmissionTracker />} />
            
            <Route path="admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/assignments" element={<ProtectedRoute adminOnly={true}><AssignmentManager /></ProtectedRoute>} />
            <Route path="admin/analytics" element={<ProtectedRoute adminOnly={true}><Analytics /></ProtectedRoute>} />
            <Route path="admin/groups" element={<ProtectedRoute adminOnly={true}><GroupTracker /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
