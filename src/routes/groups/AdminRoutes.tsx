
import { Routes, Route } from 'react-router-dom';
import Admin from '@/pages/Admin'; // Ensure correct import path
import RoleBasedProtectedRoute from '@/components/auth/RoleBasedProtectedRoute';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route 
        path="/admin" 
        element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </RoleBasedProtectedRoute>
        } 
      />
    </Routes>
  );
}
