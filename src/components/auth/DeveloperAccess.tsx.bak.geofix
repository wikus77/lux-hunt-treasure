
import React from 'react';

// Developer access component now redirects to standard login
const DeveloperAccess: React.FC = () => {
  // Redirect to standard login
  React.useEffect(() => {
    console.log('🔄 Developer access redirecting to standard login');
    window.location.href = '/login';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="text-white text-lg mb-4">Reindirizzamento al login...</div>
        <div className="text-white/60 text-sm">
          Sistema di login unificato attivo
        </div>
      </div>
    </div>
  );
};

export default DeveloperAccess;
