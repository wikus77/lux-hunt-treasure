/**
 * M1SSION AGENT™ - Agent Diary with FULLSCREEN Modal + Agent Lab
 * REVOLUT STYLE: stesse animazioni e design degli altri modali
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronDown, User, Activity, Target, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAgentCode } from "@/hooks/useAgentCode";
import { useAgentEnergy } from "@/features/pulse/hooks/useAgentEnergy";
import { useLongPress } from "@/hooks/useLongPress";
import { LongPressInfoModal } from "@/components/ui/LongPressInfoModal";
import { AgentDiaryFlipOverlay } from "./AgentDiaryFlipOverlay";
import { AgentDiaryContent } from "./AgentDiaryContent";

interface AgentStats {
  totalActivities: number;
  notesCount: number;
  purchasesCount: number;
  cluesCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function AgentDiary() {
  const { user } = useAuth();
  const { agentCode } = useAgentCode();
  const { energy } = useAgentEnergy();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [stats, setStats] = useState<AgentStats>({
    totalActivities: 0,
    notesCount: 0,
    purchasesCount: 0,
    cluesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Long press handler for quick info modal
  const longPressHandlers = useLongPress(() => setShowInfoModal(true), {
    threshold: 500,
    hapticFeedback: true,
    hapticPattern: [50]
  });

  // Fetch stats for preview card
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const { count: cluesCount } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: stripePaymentsCount } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const { count: buzzMapCount } = await supabase
        .from('user_map_areas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data: buzzActivities } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'buzz');

      // Get local notes count
      const savedNotes = localStorage.getItem(`agent_notes_${user.id}`);
      const notesCount = savedNotes ? JSON.parse(savedNotes).length : 0;

      const buzzNotifCount = buzzActivities?.length || 0;
      const totalActivities = (cluesCount || 0) + (stripePaymentsCount || 0) + buzzNotifCount + (buzzMapCount || 0) + notesCount;
      const totalPurchases = (stripePaymentsCount || 0) + (buzzMapCount || 0);
      
      setStats({
        totalActivities,
        notesCount,
        purchasesCount: totalPurchases,
        cluesCount: cluesCount || 0
      });
    } catch (error) {
      console.error('Error fetching agent stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleOpenModal = (e: React.MouseEvent<HTMLDivElement>) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Compact Card - Tap to open modal, Long press for quick info */}
      <motion.div 
        className="m1-relief rounded-[20px] overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 mb-4 relative"
        onClick={handleOpenModal}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...longPressHandlers}
      >
        {/* Animated glow strip - WHITE MICRO-ENERGY */}
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%)',
              animation: 'slideGlowAgent 4s ease-in-out infinite',
              width: '200%',
              left: '-100%'
            }}
          />
        </div>
        <style>{`
          @keyframes slideGlowAgent {
            0% { transform: translateX(0); }
            50% { transform: translateX(50%); }
            100% { transform: translateX(0); }
          }
        `}</style>
        
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <h2 className="text-lg font-orbitron font-bold text-white">
                M1SSION AGENT
              </h2>
              {/* 🔧 FIX: Agent Code + Rank Badge (replaces FlaskConical icon) */}
              <motion.div
                className="px-2 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex flex-col items-center justify-center"
                style={{ 
                  minWidth: '60px',
                  textShadow: '0 0 8px rgba(0, 212, 255, 0.5)'
                }}
              >
                <span className="text-[9px] font-orbitron font-bold text-cyan-400 leading-tight">
                  {agentCode || '---'}
                </span>
                <span className="text-[8px] font-orbitron text-purple-400 leading-tight" style={{ textShadow: '0 0 6px rgba(168, 85, 247, 0.5)' }}>
                  {energy?.rank?.code || 'AG-01'}
                </span>
              </motion.div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </div>
          
          {/* Quick Stats Preview */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{loading ? '...' : stats.totalActivities}</p>
              <p className="text-[10px] text-white/50">Attività</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{loading ? '...' : stats.notesCount}</p>
              <p className="text-[10px] text-white/50">Note</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-400">{loading ? '...' : stats.purchasesCount}</p>
              <p className="text-[10px] text-white/50">Acquisti</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-400">{loading ? '...' : stats.cluesCount}</p>
              <p className="text-[10px] text-white/50">Indizi</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Agent Diary FULLSCREEN Modal - REVOLUT STYLE */}
      <AgentDiaryFlipOverlay
        open={isModalOpen}
        originRect={originRect}
        onClose={() => setIsModalOpen(false)}
      >
        <AgentDiaryContent onClose={() => setIsModalOpen(false)} />
      </AgentDiaryFlipOverlay>
      
      {/* Long Press Info Modal */}
      <LongPressInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="M1SSION AGENT"
        subtitle="Il tuo profilo operativo"
        accentColor="#00D1FF"
        content={
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="font-semibold text-cyan-400">Codice Agente</p>
                <p className="text-white/70 text-xs">{agentCode || 'Non assegnato'} • Rango: {energy?.rank?.code || 'AG-01'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-semibold text-blue-400">Attività Totali</p>
                <p className="text-white/70 text-xs">{stats.totalActivities} azioni completate nella missione</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-semibold text-purple-400">Indizi Trovati</p>
                <p className="text-white/70 text-xs">{stats.cluesCount} indizi scoperti tramite BUZZ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-semibold text-green-400">Note Personali</p>
                <p className="text-white/70 text-xs">{stats.notesCount} note salvate nel diario</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <p className="text-[10px] text-white/40">Tocca la card per aprire il diario completo</p>
            </div>
          </div>
        }
      />
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
