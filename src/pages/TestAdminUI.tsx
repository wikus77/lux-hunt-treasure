import React from 'react';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

const TestAdminUI = () => {
  const { user, isAuthenticated } = useUnifiedAuth();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold mb-4">Test Admin UI</h1>
        {isAuthenticated ? (
          <div>
            <p>User ID: {user?.id}</p>
            <p>User Email: {user?.email}</p>
            <p>You are authenticated.</p>
          </div>
        ) : (
          <p>You are not authenticated.</p>
        )}
      </div>
    </div>
  );
};

export default TestAdminUI;
