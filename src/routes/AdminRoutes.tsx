// © 2025 Joseph MULÉ – M1SSION™
import React from 'react';
import { Route } from 'wouter';
import SendNotificationPage from '@/pages/admin/SendNotificationPage';

export const AdminRoutes: React.FC = () => {
  return (
    <>
      <Route path="/admin/send-notification" component={SendNotificationPage} />
    </>
  );
};