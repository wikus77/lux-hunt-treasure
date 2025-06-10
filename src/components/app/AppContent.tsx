import React from 'react';
import AppRoutes from './AppRoutes';
import { ErrorBoundary } from 'react-error-boundary';
import TestDebugButton from '@/components/admin/TestDebugButton';

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <ErrorBoundary>
        <div className="pb-safe">
          <AppRoutes />
          <TestDebugButton />
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default AppContent;
