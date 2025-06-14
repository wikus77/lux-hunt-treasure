import React from 'react';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, session } = useUnifiedAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>

        <div className="mb-4">
          <h2 className="text-lg font-semibold">User</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold">Session</h2>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold">Is Authenticated</h2>
          <p>{isAuthenticated ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
