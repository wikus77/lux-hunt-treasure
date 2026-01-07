// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
import React from 'react';
import { motion } from 'framer-motion';
import { useAgentCode } from '@/hooks/useAgentCode';

const ReferralCodeDisplay: React.FC = () => {
  const { agentCode, isLoading } = useAgentCode();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse"></div>
        <span className="text-sm text-slate-500 font-orbitron">Loading...</span>
      </div>
    );
  }

  if (!agentCode) {
    return null;
  }

  // 🔴 MCP = Master Control Program - ROSSO NEON per Admin
  const isMCP = agentCode === 'MCP';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center"
    >
      {/* Agent Code - 🚀 NATIVE: Font più grande e visibile - Pallino RIMOSSO */}
      <span 
        className={`text-[15px] font-orbitron font-bold agent-code-badge tracking-wider ${
          isMCP ? 'text-red-500' : 'text-[#00D1FF]'
        }`}
        style={{
          textShadow: isMCP
            ? "0 0 12px rgba(255, 0, 0, 0.8), 0 0 24px rgba(255, 0, 0, 0.5), 0 0 36px rgba(255, 0, 0, 0.3)"
            : "0 0 12px rgba(0, 209, 255, 0.7), 0 0 24px rgba(0, 209, 255, 0.4)"
        }}
      >
        {agentCode}
      </span>
    </motion.div>
  );
};

export default ReferralCodeDisplay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™