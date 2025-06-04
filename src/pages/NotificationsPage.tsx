
import React from 'react';

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-black text-white safe-padding-x pt-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Notifiche</h1>
        <div className="glass-card p-6 text-center">
          <p className="text-white/70">Nessuna notifica al momento</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
