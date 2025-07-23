// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AgentCodeDisplayProps {
  agentCode: string;
  className?: string;
}

export const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = ({
  agentCode,
  className = ""
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agentCode);
      setCopied(true);
      toast.success("Codice Agente copiato!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Errore nella copia del codice");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-5 h-5 text-cyan-400" />
        <span className="text-white font-semibold">Il tuo Codice Agente</span>
      </div>
      
      <div className="flex items-center justify-between">
        <code className="text-xl font-mono font-bold text-cyan-400 bg-black/30 px-3 py-2 rounded">
          {agentCode}
        </code>
        
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      <p className="text-white/60 text-xs mt-2">
        Questo codice ti identifica come agente verificato in M1SSION™
      </p>
    </motion.div>
  );
};

export default AgentCodeDisplay;