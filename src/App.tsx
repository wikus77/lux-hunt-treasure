
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import AccessDenied from '@/pages/AccessDenied';
import { RoleBasedProtectedRoute } from '@/components/auth/RoleBasedProtectedRoute';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route path="/home" element={
          <RoleBasedProtectedRoute>
            <Home />
          </RoleBasedProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <RoleBasedProtectedRoute requireEmailVerification={false}>
            <Profile />
          </RoleBasedProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </RoleBasedProtectedRoute>
        } />
        
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

// New landing route that shows the landing page
function LandingRoute() {
  return <Landing />;
}

export default App;
