
import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
      <Route path="/*" element={<PublicRoutes />} />
      
      {/* User routes */}
      <Route path="/*" element={<UserRoutes />} />
      
      {/* Settings routes */}
      <Route path="/*" element={<SettingsRoutes />} />
      
      {/* Admin routes */}
      <Route path="/*" element={<AdminRoutes />} />
      
      {/* Payment routes */}
      <Route path="/*" element={<PaymentRoutes />} />
      
      {/* Premium routes */}
      <Route path="/*" element={<PremiumRoutes />} />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
