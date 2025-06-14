import React from 'react';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

const AgentCodeDisplay = () => {
  const { user } = useUnifiedAuth();

  return (
    <div className="text-sm text-gray-500">
      {user?.id ? `Agente: ${user.id.substring(0, 8)}` : 'Agente: Sconosciuto'}
    </div>
  );
};

export default AgentCodeDisplay;

