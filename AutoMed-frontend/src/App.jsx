import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Submit from './pages/Submit';
import Dashboard from './pages/Dashboard';
import ChatAssistant from './components/ChatAssistant';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/submit" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/submit" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ChatAssistant />
    </AuthProvider>
  );
}
