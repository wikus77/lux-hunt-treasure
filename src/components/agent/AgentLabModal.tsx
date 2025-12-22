/**
 * AGENT LAB™ - Full-screen Modal for Agent Selection & Shop
 * BASE (FREE) / SPECIAL (50 M1U) / PREMIUM (100 M1U)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShoppingBag, Sparkles, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { AgentPreview } from './AgentPreview';
import { AgentShop } from './AgentShop';
import { useAgentCustomization } from './useAgentCustomization';
import { getDefaultAgent, getAgentById } from './agentCatalog';
import { toast } from 'sonner';

interface AgentLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentLabModal({ isOpen, onClose }: AgentLabModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'customize' | 'shop'>('shop');
  const [agentCode, setAgentCode] = useState<string>('AG-XXXX');
  
  // Use the customization hook
  const {
    state,
    isLoading,
    isSaving,
    selectAgent,
    addOwnedAgent,
    setSkinTone,
    saveCustomization,
    getSelectedAgent,
  } = useAgentCustomization();

  // Fetch agent code
  useEffect(() => {
    const fetchAgentCode = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('agent_code')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!error && data?.agent_code) {
          setAgentCode(data.agent_code);
        } else {
          // Fallback to localStorage
          const cached = localStorage.getItem('m1ssion_agent_code');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setAgentCode(parsed.code || 'AG-XXXX');
            } catch {
              setAgentCode('AG-XXXX');
            }
          }
        }
      } catch (err) {
        console.error('[AgentLab] Error fetching agent code:', err);
      }
    };
    
    fetchAgentCode();
  }, [user?.id]);

  // Handle close - save customization
  const handleClose = async () => {
    try {
      await saveCustomization();
    } catch {
      // Silent fail - localStorage already has the data
    }
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle agent purchased (from shop)
  const handleAgentPurchased = (agentId: string) => {
    addOwnedAgent(agentId);
  };

  // Handle agent selected (from shop or preview)
  const handleAgentSelected = (agentId: string) => {
    selectAgent(agentId);
  };

  const selectedAgent = getSelectedAgent();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            className="relative w-full h-[92vh] bg-gradient-to-b from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a] rounded-t-[32px] overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated glow border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{
                  animation: 'slideGlow 3s ease-in-out infinite',
                  width: '200%',
                  left: '-50%'
                }}
              />
            </div>
            
            <style>{`
              @keyframes slideGlow {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(25%); }
              }
            `}</style>
            
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
              
              {/* Save button */}
              <button
                onClick={saveCustomization}
                disabled={isSaving}
                className="absolute right-14 top-4 p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              
              {/* Title */}
              <div className="text-center pr-20">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                    AGENT LAB™
                  </h2>
                  <Sparkles className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-xs text-white/50 font-medium">
                  Select your field agent
                </p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex px-6 py-3 gap-3 border-b border-white/5">
              <button
                onClick={() => setActiveTab('shop')}
                className={`flex-1 py-3 px-4 rounded-xl font-orbitron text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'shop'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Agents Shop
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`flex-1 py-3 px-4 rounded-xl font-orbitron text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'customize'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4" />
                Preview
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto h-[calc(92vh-160px)] custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : activeTab === 'shop' ? (
                <AgentShop
                  ownedAgents={state.ownedAgents}
                  selectedAgentId={state.selectedAgentId}
                  agentCode={agentCode}
                  onAgentPurchased={handleAgentPurchased}
                  onAgentSelected={handleAgentSelected}
                />
              ) : (
                <AgentPreview
                  selectedAgentId={state.selectedAgentId}
                  skinToneId={state.skinToneId}
                  agentCode={agentCode}
                  onSkinToneChange={setSkinTone}
                  loading={isLoading}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
