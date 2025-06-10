import React from 'react';
import AgentBadge from '@/components/AgentBadge';

interface AgentCodeDisplayProps {
  agentCode?: string;
}

// This component is now just a wrapper for AgentBadge
// We keep it for backward compatibility
const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = () => {
  return <AgentBadge />;
};

export default AgentCodeDisplay;
