// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Agent Diary Content - REVOLUT STYLE (identico design agli altri modali)
import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Plus, RefreshCw, Sparkles, User, Activity, Target, Search, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAgentCode } from "@/hooks/useAgentCode";
import { useAgentEnergy } from "@/features/pulse/hooks/useAgentEnergy";

const AgentLabModal = lazy(() => import("@/components/agent/AgentLabModal").then(m => ({ default: m.AgentLabModal })));

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

interface AgentDiaryContentProps {
  onClose: () => void;
}

export const AgentDiaryContent: React.FC<AgentDiaryContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { agentCode } = useAgentCode();
  const { energy } = useAgentEnergy();
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
      const { count: cluesCount } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: stripePaymentsCount } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const { data: buzzMapAreas, count: buzzMapCount } = await supabase
        .from('user_map_areas')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: buzzActivities } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: recentClues } = await supabase
        .from('user_clues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const newEntries: DiaryEntry[] = [];

      if (recentClues) {
        recentClues.forEach(clue => {
          newEntries.push({
            type: 'clue',
            content: `🔍 Indizio scoperto: ${clue.title_it || clue.clue_id}`,
            timestamp: clue.created_at || new Date().toISOString()
          });
        });
      }

      if (buzzMapAreas) {
        buzzMapAreas.forEach(area => {
          newEntries.push({
            type: 'buzz',
            content: `🗺️ BUZZ MAP: Area ${Math.round(area.radius_km || 0)}km generata`,
            timestamp: area.created_at || new Date().toISOString()
          });
        });
      }

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

      localNotes.forEach(note => {
        newEntries.push(note);
      });

      newEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const buzzNotifCount = buzzActivities?.filter(a => a.type === 'buzz' || a.title?.includes('BUZZ')).length || 0;
      const totalActivities = (cluesCount || 0) + (stripePaymentsCount || 0) + buzzNotifCount + (buzzMapCount || 0) + localNotes.length;
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

  const handleOpenAgentLab = () => {
    setShowAgentLab(true);
  };

  const handleMissionShortcut = (type: string) => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openMissionModal', { detail: type }));
    }, 300);
  };

  return (
    <>
      <div 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {/* HEADER - REVOLUT STYLE */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.3) 0%, rgba(124, 58, 237, 0.2) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </button>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ 
                color: '#00D1FF', 
                fontSize: '18px', 
                fontWeight: 700,
                letterSpacing: '1px',
              }}>
                {t('home_agent_title')}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>
                {t('home_agent_header_subtitle')}
              </p>
            </div>

            {/* Agent Code Badge */}
            <div 
              style={{
                padding: '6px 10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                border: '1px solid rgba(0, 209, 255, 0.3)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#00D1FF', fontSize: '10px', fontWeight: 700 }}>{agentCode || '---'}</p>
              <p style={{ color: '#A855F7', fontSize: '9px' }}>{energy?.rank?.code || 'AG-01'}</p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Agent Lab Quick Access */}
          <GlassCard 
            onClick={handleOpenAgentLab}
            style={{ marginBottom: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.3) 0%, rgba(124, 58, 237, 0.3) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#00D1FF' }} />
                </div>
                <div>
                  <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>{t('home_agent_lab_title')}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{t('home_agent_lab_subtitle')}</p>
                </div>
              </div>
              <span style={{ fontSize: '24px' }}>🧬</span>
            </div>
          </GlassCard>

          {/* Mission Shortcuts */}
          <GlassCard style={{ marginBottom: '16px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Target style={{ width: '16px', height: '16px', color: '#00D1FF' }} />
              <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>{t('home_agent_quick_actions')}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ShortcutButton 
                icon={Search} 
                label={t('home_agent_clues_found')} 
                sublabel={t('home_agent_treasure_progress')} 
                color="#22C55E" 
                onClick={() => handleMissionShortcut('clues')} 
              />
              <ShortcutButton 
                icon={Target} 
                label={t('home_agent_mission_status')} 
                sublabel={t('home_agent_full_overview')} 
                color="#00D1FF" 
                onClick={() => handleMissionShortcut('status')} 
              />
              <ShortcutButton 
                icon={Clock} 
                label={t('home_agent_time_remaining')} 
                sublabel={t('home_agent_countdown_deadline')} 
                color="#F59E0B" 
                onClick={() => handleMissionShortcut('time')} 
              />
            </div>
          </GlassCard>

          {/* Agent Statistics */}
          <GlassCard style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User style={{ width: '16px', height: '16px', color: '#00D1FF' }} />
                <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>Statistiche Agente</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); fetchRealData(); }}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#00D1FF', 
                  fontSize: '11px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw style={{ width: '12px', height: '12px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Aggiorna
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <StatBox value={loading ? '...' : stats.totalActivities} label="Attività Totali" color="#3B82F6" />
              <StatBox value={loading ? '...' : stats.notesCount} label="Note Personali" color="#22C55E" />
              <StatBox value={loading ? '...' : stats.purchasesCount} label="Acquisti" color="#EAB308" />
              <StatBox value={loading ? '...' : stats.cluesCount} label="Indizi" color="#A855F7" />
            </div>
          </GlassCard>

          {/* Add Note Section */}
          <GlassCard style={{ marginBottom: '16px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowAddNote(!showAddNote); }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(54, 94, 255, 0.2) 0%, rgba(252, 30, 255, 0.2) 100%)',
                border: '1px solid rgba(54, 94, 255, 0.3)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              {t('home_agent_add_note')}
            </button>

            <AnimatePresence>
              {showAddNote && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: '12px', overflow: 'hidden' }}
                >
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={t('home_agent_note_placeholder')}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      resize: 'none',
                      outline: 'none',
                      marginBottom: '10px',
                    }}
                    rows={3}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddNote(); }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #00D1FF, #7C3AED)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t('home_agent_save_note')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAddNote(false); setNewNote(""); }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {t('home_cashback_cancel')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Diary Entries */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>📋</span>
              <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>{t('home_agent_diary')}</p>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <RefreshCw style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.5)', margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{t('home_agent_loading')}</p>
              </div>
            ) : entries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {entries.map((entry, index) => (
                  <motion.div
                    key={`${entry.timestamp}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{getEntryIcon(entry.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#FFFFFF', fontSize: '13px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                          {entry.content}
                        </p>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <User style={{ width: '28px', height: '28px', color: 'rgba(255,255,255,0.3)' }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{t('home_agent_no_activities')}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>{t('home_agent_buzz_hint')}</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Agent Lab Modal (separate) */}
      <Suspense fallback={null}>
        <AgentLabModal 
          isOpen={showAgentLab} 
          onClose={() => setShowAgentLab(false)} 
        />
      </Suspense>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

// GLASS CARD
const GlassCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

// STAT BOX
const StatBox: React.FC<{ value: string | number; label: string; color: string }> = ({ value, label, color }) => (
  <div 
    style={{
      padding: '12px',
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
    }}
  >
    <p style={{ color, fontSize: '20px', fontWeight: 700 }}>{value}</p>
    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '2px' }}>{label}</p>
  </div>
);

// SHORTCUT BUTTON
const ShortcutButton: React.FC<{
  icon: React.ElementType;
  label: string;
  sublabel: string;
  color: string;
  onClick: () => void;
}> = ({ icon: Icon, label, sublabel, color, onClick }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    style={{
      width: '100%',
      padding: '10px 12px',
      borderRadius: '10px',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div 
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon style={{ width: '16px', height: '16px', color }} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 500 }}>{label}</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{sublabel}</p>
      </div>
    </div>
    <ChevronRight style={{ width: '16px', height: '16px', color: `${color}80` }} />
  </button>
);

export default AgentDiaryContent;
