
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Import route groups
import PublicRoutes from './groups/PublicRoutes';
import UserRoutes from './groups/UserRoutes';
import AdminRoutes from './groups/AdminRoutes';
import PaymentRoutes from './groups/PaymentRoutes';
import PremiumRoutes from './groups/PremiumRoutes';
import SettingsRoutes from './groups/SettingsRoutes';

// Import individual pages that don't belong to groups
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      {PublicRoutes()}
      
      {/* User routes */}
      {UserRoutes()}
      
      {/* Settings routes */}
      {SettingsRoutes()}
      
      {/* Admin routes */}
      {AdminRoutes()}
      
      {/* Payment routes */}
      {PaymentRoutes()}
      
      {/* Premium routes */}
      {PremiumRoutes()}
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
