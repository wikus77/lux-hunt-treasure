
import React from 'react';

interface AgentCodeDisplayProps {
  agentCode: string;
}

const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = ({ agentCode }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="px-3 py-1 bg-black/40 border border-cyan-400/30 rounded-md flex items-center">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse mr-2"></div>
        <span className="text-sm text-cyan-400 font-mono">{agentCode}</span>
      </div>
    </div>
  );
};

export default AgentCodeDisplay;
