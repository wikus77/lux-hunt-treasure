/**
 * ACTIVE AGENT BADGE - Shows current agent in home containers
 * Compact badge with agent name and code
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { 
  getAgentById, 
  getDefaultAgent, 
  CATEGORY_STYLES, 
  AgentDefinition 
} from './agentCatalog';

interface ActiveAgentBadgeProps {
  className?: string;
}

export function ActiveAgentBadge({ className = '' }: ActiveAgentBadgeProps) {
  const { user } = useAuth();
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [agentCode, setAgentCode] = useState<string>('AG-XXXX');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgentData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Load agent customization from localStorage first (fast)
        const localData = localStorage.getItem(`agent_customization_v2_${user.id}`);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed.selectedAgentId) {
              const foundAgent = getAgentById(parsed.selectedAgentId);
              setAgent(foundAgent || getDefaultAgent());
            }
          } catch (e) {
            setAgent(getDefaultAgent());
          }
        } else {
          setAgent(getDefaultAgent());
        }

        // Load agent code from profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('agent_code, agent_customization')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && profile) {
          if (profile.agent_code) {
            setAgentCode(profile.agent_code);
          }
          
          // Also check Supabase for agent customization
          if (profile.agent_customization) {
            const dbData = profile.agent_customization as { selectedAgentId?: string };
            if (dbData.selectedAgentId) {
              const foundAgent = getAgentById(dbData.selectedAgentId);
              if (foundAgent) {
                setAgent(foundAgent);
              }
            }
          }
        }

        // Fallback for agent code
        if (!profile?.agent_code) {
          const cached = localStorage.getItem('m1ssion_agent_code');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setAgentCode(parsed.code || 'AG-XXXX');
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('[ActiveAgentBadge] Error loading:', err);
        setAgent(getDefaultAgent());
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentData();

    // Listen for agent changes
    const handleAgentChange = () => {
      loadAgentData();
    };
    window.addEventListener('agent-customization-updated', handleAgentChange);
    
    return () => {
      window.removeEventListener('agent-customization-updated', handleAgentChange);
    };
  }, [user?.id]);

  // Don't render if loading or no agent
  if (isLoading || !agent) {
    return null;
  }

  const categoryStyle = CATEGORY_STYLES[agent.category];

  // Get icon based on category
  const getCategoryIcon = () => {
    switch (agent.category) {
      case 'PREMIUM':
        return <Crown className="w-3.5 h-3.5 text-yellow-400" />;
      case 'SPECIAL':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(0, 10, 30, 0.9) 0%, rgba(5, 20, 50, 0.8) 100%)',
        borderColor: agent.category === 'PREMIUM' 
          ? 'rgba(251, 191, 36, 0.4)' 
          : agent.category === 'SPECIAL' 
            ? 'rgba(34, 211, 238, 0.4)' 
            : 'rgba(156, 163, 175, 0.3)',
        boxShadow: agent.category === 'PREMIUM'
          ? '0 0 20px rgba(251, 191, 36, 0.2)'
          : agent.category === 'SPECIAL'
            ? '0 0 20px rgba(34, 211, 238, 0.2)'
            : '0 0 10px rgba(0, 0, 0, 0.3)'
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryStyle.bg} border ${categoryStyle.border} flex items-center justify-center`}>
        {getCategoryIcon()}
      </div>
      
      {/* Info */}
      <div className="flex flex-col">
        <span className="text-[10px] text-white/40 font-medium leading-none mb-0.5">
          ACTIVE AGENT
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-orbitron font-medium ${categoryStyle.text} truncate max-w-[100px]`}>
            {agent.name}
          </span>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            {agentCode}
          </span>
        </div>
      </div>
    </motion.div>
  );
}



