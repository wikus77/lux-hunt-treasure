
// © 2025 Joseph MULÉ – M1SSION™
import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAgentCode } from '@/hooks/useAgentCode';

const AgentCodeDisplay: React.FC = () => {
  const { agentCode, isLoading } = useAgentCode();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <motion.div 
          className="text-sm font-mono text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div 
        className="text-lg font-orbitron font-bold text-white tracking-wider"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          textShadow: "0 0 10px rgba(255, 255, 255, 0.3)"
        }}
      >
        {agentCode || 'AGENT'}
      </motion.div>
    </div>
  );
};

export default AgentCodeDisplay;
