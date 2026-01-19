/**
 * M1SSION AGENT™ - Agent Diary with Modal + Agent Lab
 * Tap header to open full-screen modal, Agent Lab button opens customization
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, RefreshCw, Sparkles, User, Activity, Target, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
// 🔥 CRITICAL: Lazy load AgentLabModal to prevent THREE.js hook errors
const AgentLabModal = lazy(() => import("@/components/agent/AgentLabModal").then(m => ({ default: m.AgentLabModal })));
import { GlassModal } from "@/components/ui/GlassModal";
import { useAgentCode } from "@/hooks/useAgentCode";
import { useAgentEnergy } from "@/features/pulse/hooks/useAgentEnergy";
import { useLongPress } from "@/hooks/useLongPress";
import { LongPressInfoModal } from "@/components/ui/LongPressInfoModal";

interface DiaryEntry {
  type: "purchase" | "note" | "achievement" | "clue" | "buzz";
  content: string;
  timestamp: string;
}

interface AgentStats {
  totalActivities: number;
  notesCount: number;
  purchasesCount: number;
  cluesCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT DIARY MODAL CONTENT
// ═══════════════════════════════════════════════════════════════════════════
interface AgentDiaryModalContentProps {
  stats: AgentStats;
  entries: DiaryEntry[];
  loading: boolean;
  newNote: string;
  setNewNote: (note: string) => void;
  showAddNote: boolean;
  setShowAddNote: (show: boolean) => void;
  handleAddNote: () => void;
  fetchRealData: () => void;
  onOpenAgentLab: () => void;
  onClose: () => void;
}

function AgentDiaryModalContent({
  stats,
  entries,
  loading,
  newNote,
  setNewNote,
  showAddNote,
  setShowAddNote,
  handleAddNote,
  fetchRealData,
  onOpenAgentLab,
  onClose
}: AgentDiaryModalContentProps) {

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'clue': return '🔍';
      case 'buzz': return '⚡';
      case 'purchase': return '💰';
      case 'note': return '📝';
      case 'achievement': return '🏆';
      default: return '📌';
    }
  };

  return (
    <>
      {/* Agent Lab Quick Access Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
          setTimeout(onOpenAgentLab, 300);
        }}
        className="w-full mb-5 p-4 rounded-2xl border border-cyan-500/30 hover:border-cyan-500/50 transition-all group"
        style={{ background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.08) 0%, rgba(123, 46, 255, 0.08) 100%)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-orbitron font-bold text-white group-hover:text-cyan-400 transition-colors">
                AGENT LAB™
              </p>
              <p className="text-xs text-white/50">
                Customize • Shop • Upgrades
              </p>
            </div>
          </div>
          <div className="text-2xl">🧬</div>
        </div>
      </motion.button>

      {/* Agent Statistics */}
      <div 
        className="rounded-2xl p-4 mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.1) 0%, rgba(123, 46, 255, 0.05) 100%)',
          border: '1px solid rgba(0, 209, 255, 0.25)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Statistiche Agente
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchRealData();
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
            <p className="text-2xl font-bold text-blue-400">
              {loading ? '...' : stats.totalActivities}
            </p>
            <p className="text-xs text-white/50 mt-1">Attività Totali</p>
          </div>
          <div className="rounded-xl p-3 text-center border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
            <p className="text-2xl font-bold text-green-400">
              {loading ? '...' : stats.notesCount}
            </p>
            <p className="text-xs text-white/50 mt-1">Note Personali</p>
          </div>
          <div className="rounded-xl p-3 text-center border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
            <p className="text-2xl font-bold text-yellow-400">
              {loading ? '...' : stats.purchasesCount}
            </p>
            <p className="text-xs text-white/50 mt-1">Acquisti</p>
          </div>
          <div className="rounded-xl p-3 text-center border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
            <p className="text-2xl font-bold text-purple-400">
              {loading ? '...' : stats.cluesCount}
            </p>
            <p className="text-xs text-white/50 mt-1">Indizi</p>
          </div>
        </div>
      </div>

      {/* Add Note Section */}
      <div className="mb-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddNote(!showAddNote);
          }}
          className="w-full p-3 border border-[#365EFF]/30 rounded-xl text-white transition-all flex items-center justify-center space-x-2"
          style={{ background: 'linear-gradient(135deg, rgba(54, 94, 255, 0.15) 0%, rgba(252, 30, 255, 0.15) 100%)' }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-orbitron">Aggiungi Nota Personale</span>
        </button>

        <AnimatePresence>
          {showAddNote && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 overflow-hidden"
            >
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Scrivi la tua nota personale..."
                  className="w-full p-3 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-cyan-500/50"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  rows={3}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNote();
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl text-sm font-orbitron font-medium"
                  >
                    Salva Nota
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddNote(false);
                      setNewNote("");
                    }}
                    className="px-4 py-2.5 text-white/70 rounded-xl text-sm font-orbitron border border-white/20"
                    style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Diary Entries */}
      <div>
        <h3 className="text-white font-medium mb-3 font-orbitron flex items-center gap-2">
          📋 Diario delle Attività
        </h3>
        
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-white/50">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
              <p className="text-sm">Caricamento attività...</p>
            </div>
          ) : entries.length > 0 ? (
            entries.map((entry, index) => (
              <motion.div
                key={`${entry.timestamp}-${index}`}
                className="p-3 rounded-xl border border-white/10"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg flex-shrink-0">{getEntryIcon(entry.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed break-words">
                      {entry.content}
                    </p>
                    <span className="text-xs text-white/40 mt-1 block">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <User className="w-7 h-7 text-white/30" />
              </div>
              <p className="text-white/60 text-sm">Nessuna attività registrata</p>
              <p className="text-xs text-white/40 mt-1">Usa BUZZ per scoprire indizi!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function AgentDiary() {
  const { user } = useAuth();
  const { agentCode } = useAgentCode();
  const { energy } = useAgentEnergy();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAgentLab, setShowAgentLab] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [stats, setStats] = useState<AgentStats>({
    totalActivities: 0,
    notesCount: 0,
    purchasesCount: 0,
    cluesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [localNotes, setLocalNotes] = useState<DiaryEntry[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Long press handler for quick info modal
  const longPressHandlers = useLongPress(() => setShowInfoModal(true), {
    threshold: 500,
    hapticFeedback: true,
    hapticPattern: [50]
  });

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`agent_notes_${user.id}`);
      if (saved) {
        try {
          setLocalNotes(JSON.parse(saved));
        } catch {
          setLocalNotes([]);
        }
      }
    }
  }, [user?.id]);

  const fetchRealData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      // 🔧 FIX: Traccia TUTTE le attività
      
      // 1. Indizi BUZZ
      const { count: cluesCount } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // 2. Acquisti (payment_transactions) - Stripe payments
      const { count: stripePaymentsCount } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // 3. BUZZ MAP (user_map_areas)
      const { data: buzzMapAreas, count: buzzMapCount } = await supabase
        .from('user_map_areas')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // 4. Notifiche/Attività generiche
      const { data: buzzActivities } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // 5. Indizi recenti
      const { data: recentClues } = await supabase
        .from('user_clues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const newEntries: DiaryEntry[] = [];

      // Aggiungi indizi BUZZ
      if (recentClues) {
        recentClues.forEach(clue => {
          newEntries.push({
            type: 'clue',
            content: `🔍 Indizio scoperto: ${clue.title_it || clue.clue_id}`,
            timestamp: clue.created_at || new Date().toISOString()
          });
        });
      }

      // 🔧 FIX: Aggiungi BUZZ MAP
      if (buzzMapAreas) {
        buzzMapAreas.forEach(area => {
          newEntries.push({
            type: 'buzz',
            content: `🗺️ BUZZ MAP: Area ${Math.round(area.radius_km || 0)}km generata`,
            timestamp: area.created_at || new Date().toISOString()
          });
        });
      }

      // Aggiungi altre attività (notifiche)
      if (buzzActivities) {
        buzzActivities.forEach(activity => {
          if (activity.type === 'buzz' || activity.title?.includes('BUZZ')) {
            newEntries.push({
              type: 'buzz',
              content: activity.message || activity.title || 'Attività BUZZ',
              timestamp: activity.created_at
            });
          }
        });
      }

      // Aggiungi note personali
      localNotes.forEach(note => {
        newEntries.push(note);
      });

      // Ordina per data
      newEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // 🔧 FIX: Conta TUTTE le attività (incluso BUZZ MAP)
      const buzzNotifCount = buzzActivities?.filter(a => a.type === 'buzz' || a.title?.includes('BUZZ')).length || 0;
      const totalActivities = (cluesCount || 0) + (stripePaymentsCount || 0) + buzzNotifCount + (buzzMapCount || 0) + localNotes.length;

      // 🔧 ACQUISTI = Stripe payments + Buzz Map purchases
      const totalPurchases = (stripePaymentsCount || 0) + (buzzMapCount || 0);
      
      setStats({
        totalActivities,
        notesCount: localNotes.length,
        purchasesCount: totalPurchases,
        cluesCount: cluesCount || 0
      });

      setEntries(newEntries.slice(0, 30));

    } catch (error) {
      console.error('Error fetching agent data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, localNotes]);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  // 🔄 REALTIME: Subscription per aggiornamenti acquisti in tempo reale
  useEffect(() => {
    if (!user?.id) return;

    console.log('[AgentDiary] 🔄 Setting up realtime subscriptions for purchases...');

    // Channel per payment_transactions (Stripe purchases)
    const paymentsChannel = supabase
      .channel('agent-diary-payments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[AgentDiary] 💰 New payment detected:', payload);
          // Refresh data when new payment is inserted
          fetchRealData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[AgentDiary] 💰 Payment updated:', payload);
          fetchRealData();
        }
      )
      .subscribe();

    // Channel per user_map_areas (Buzz Map purchases)
    const buzzMapChannel = supabase
      .channel('agent-diary-buzzmap')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_map_areas',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[AgentDiary] 🗺️ New Buzz Map detected:', payload);
          fetchRealData();
        }
      )
      .subscribe();

    // Channel per user_clues (Buzz clues - acquisti indizi)
    const cluesChannel = supabase
      .channel('agent-diary-clues')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_clues',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[AgentDiary] 🔍 New clue detected:', payload);
          fetchRealData();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[AgentDiary] 🔄 Cleaning up realtime subscriptions...');
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(buzzMapChannel);
      supabase.removeChannel(cluesChannel);
    };
  }, [user?.id, fetchRealData]);

  // 🔧 FIX: Listen for mission reset to clear data
  useEffect(() => {
    const handleMissionReset = () => {
      console.log('🔄 [AgentDiary] Mission reset - clearing data...');
      setEntries([]);
      setStats({
        totalActivities: 0,
        notesCount: 0,
        purchasesCount: 0,
        cluesCount: 0
      });
      // Clear local notes for this user
      if (user?.id) {
        localStorage.removeItem(`agent_notes_${user.id}`);
        setLocalNotes([]);
      }
      // Reload fresh data after a short delay
      setTimeout(() => fetchRealData(), 1000);
    };

    // 🔧 FIX: Check localStorage for cross-page reset signal on mount
    const lastResetStr = localStorage.getItem('m1ssion_last_reset');
    const lastCheckedStr = localStorage.getItem(`agent_diary_last_checked_${user?.id}`);
    
    if (lastResetStr && user?.id) {
      const lastReset = parseInt(lastResetStr, 10);
      const lastChecked = lastCheckedStr ? parseInt(lastCheckedStr, 10) : 0;
      
      // If reset happened after last check, trigger reset
      if (lastReset > lastChecked) {
        console.log('🔄 [AgentDiary] Detected cross-page mission reset, clearing data...');
        handleMissionReset();
        localStorage.setItem(`agent_diary_last_checked_${user.id}`, Date.now().toString());
      }
    }

    window.addEventListener('missionLaunched', handleMissionReset);
    window.addEventListener('missionReset', handleMissionReset);
    window.addEventListener('mission:reset', handleMissionReset);

    return () => {
      window.removeEventListener('missionLaunched', handleMissionReset);
      window.removeEventListener('missionReset', handleMissionReset);
      window.removeEventListener('mission:reset', handleMissionReset);
    };
  }, [user?.id, fetchRealData]);

  const handleAddNote = () => {
    if (newNote.trim() && user?.id) {
      const newNoteEntry: DiaryEntry = {
        type: 'note',
        content: newNote.trim(),
        timestamp: new Date().toISOString()
      };
      
      const updatedNotes = [newNoteEntry, ...localNotes];
      setLocalNotes(updatedNotes);
      localStorage.setItem(`agent_notes_${user.id}`, JSON.stringify(updatedNotes));
      
      setEntries(prev => [newNoteEntry, ...prev].slice(0, 30));
      setStats(prev => ({
        ...prev,
        notesCount: prev.notesCount + 1,
        totalActivities: prev.totalActivities + 1
      }));
      
      setNewNote("");
      setShowAddNote(false);
    }
  };

  const handleOpenModal = () => {
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
        {/* Animated glow strip */}
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
            style={{
              animation: 'slideGlowAgent 3s ease-in-out infinite',
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

      {/* Agent Diary Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accentColor="#00D1FF"
        title="M1SSION AGENT"
        subtitle="Il tuo diario operativo e statistiche"
      >
        <AgentDiaryModalContent
          stats={stats}
          entries={entries}
          loading={loading}
          newNote={newNote}
          setNewNote={setNewNote}
          showAddNote={showAddNote}
          setShowAddNote={setShowAddNote}
          handleAddNote={handleAddNote}
          fetchRealData={fetchRealData}
          onOpenAgentLab={() => setShowAgentLab(true)}
          onClose={() => setIsModalOpen(false)}
        />
      </GlassModal>

      {/* Agent Lab Modal (separate) - Lazy loaded to prevent THREE.js errors */}
      <Suspense fallback={null}>
        <AgentLabModal 
          isOpen={showAgentLab} 
          onClose={() => setShowAgentLab(false)} 
        />
      </Suspense>
      
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
