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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-2"
    >
      {/* Pallino azzurro lampeggiante neon */}
      <motion.div
        className="w-2 h-2 bg-[#00D1FF] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          boxShadow: "0 0 8px rgba(0, 209, 255, 0.6), 0 0 16px rgba(0, 209, 255, 0.4)"
        }}
      />
      
      {/* Agent Code - 🚀 NATIVE: Font più grande e visibile */}
      <span 
        className="text-[15px] font-orbitron font-bold text-[#00D1FF] agent-code-badge tracking-wider"
        style={{
          textShadow: "0 0 12px rgba(0, 209, 255, 0.7), 0 0 24px rgba(0, 209, 255, 0.4)"
        }}
      >
        {agentCode}
      </span>
    </motion.div>
  );
};

export default ReferralCodeDisplay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™