
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Target, ChevronDown, Bell, Calendar, Hourglass, AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { GlassModal } from "@/components/ui/GlassModal";
import { useClueMilestones, CLUE_MILESTONES } from "@/hooks/useClueMilestones";
import { ClueMilestoneModal } from "@/components/milestones/ClueMilestoneModal";
import { useLongPress } from "@/hooks/useLongPress";
import { LongPressInfoModal, InfoItem } from "@/components/ui/LongPressInfoModal";

// ═══════════════════════════════════════════════════════════════════════════
// PULSE INTENSITY CALCULATOR (Day -10 to Day 0)
// ═══════════════════════════════════════════════════════════════════════════
function getPulseIntensity(daysRemaining: number): number {
  // Clamp between 0 and 10
  const clamped = Math.max(0, Math.min(10, daysRemaining));
  // Base 1.0 at day 10, +0.1 for each day closer to 0
  return 1.0 + (10 - clamped) * 0.1;
}

function shouldShowPulse(daysRemaining: number): boolean {
  return daysRemaining >= 0 && daysRemaining <= 10;
}

function shouldShowEndWarning(daysRemaining: number): boolean {
  return daysRemaining >= 0 && daysRemaining <= 5;
}

function getWarningModalKey(daysRemaining: number): string {
  const today = new Date().toISOString().split('T')[0];
  return `mission_end_warning_${today}_day${daysRemaining}`;
}

function hasShownWarningToday(daysRemaining: number): boolean {
  // Day 0: always show (override gating)
  if (daysRemaining === 0) return false;
  
  const key = getWarningModalKey(daysRemaining);
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function markWarningShown(daysRemaining: number): void {
  const key = getWarningModalKey(daysRemaining);
  try {
    localStorage.setItem(key, 'true');
  } catch {}
}

interface ActiveMissionBoxProps {
  mission: {
    id: string;
    title: string;
    totalClues: number;
    foundClues: number;
    timeLimit: string;
    startTime: string;
    remainingDays: number;
    totalDays: number;
  };
  purchasedClues?: any[];
  progress?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// FOUND CLUES MODAL
// ═══════════════════════════════════════════════════════════════════════════
interface FoundCluesModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayCluesFound: number;
  totalClues: number;
  buzzClues: any[];
  latestBuzzClues: any[];
  goToNotifications: () => void;
}

function FoundCluesModal({
  isOpen, onClose, displayCluesFound, totalClues, buzzClues, latestBuzzClues, goToNotifications
}: FoundCluesModalProps) {
  const { t } = useTranslation();
  return (
    <GlassModal 
      isOpen={isOpen} 
      onClose={onClose} 
      accentColor="#22C55E"
      title={t('home_active_clues_title')}
      subtitle={t('home_active_clues_subtitle')}
    >
      {/* Stats Card */}
      <div 
        className="rounded-2xl p-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(0, 209, 255, 0.06) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="text-4xl font-bold text-green-400 mb-3">
          {displayCluesFound}<span className="text-white/60">/{totalClues}</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-3 mb-3">
          <motion.div 
            className={`h-3 rounded-full ${
              displayCluesFound === 0 ? 'bg-gray-500' :
              displayCluesFound < 50 ? 'bg-gradient-to-r from-[#22C55E] to-[#10B981]' :
              displayCluesFound < 100 ? 'bg-gradient-to-r from-[#10B981] to-[#00D1FF]' :
              displayCluesFound < 150 ? 'bg-gradient-to-r from-[#00D1FF] to-[#A855F7]' : 
              'bg-gradient-to-r from-[#A855F7] to-[#D946EF]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${(displayCluesFound / totalClues) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/80">{t('home_active_completed_pct', { pct: Math.round((displayCluesFound / totalClues) * 100) })}</span>
          <span className="text-green-400 font-medium">{totalClues - displayCluesFound} {t('home_active_remaining')}</span>
        </div>
      </div>
      
      {/* Latest Clues */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">{t('home_active_latest_clues')} {latestBuzzClues.length > 0 && `(${latestBuzzClues.length})`}</h3>
          {buzzClues.length > 5 && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); setTimeout(goToNotifications, 300); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 text-[#00D1FF] text-xs font-medium rounded-lg border border-[#00D1FF]/30 transition-all active:scale-95"
            >
              <Bell className="w-3 h-3" />
              {t('home_active_see_all', { count: buzzClues.length })}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {latestBuzzClues.length > 0 ? (
            latestBuzzClues.map((clue, index) => (
              <motion.div
                key={clue.id}
                className="rounded-xl p-4 border border-white/10"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-sm font-medium text-white flex-1 pr-2">{clue.title}</h5>
                  <span className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full flex-shrink-0">BUZZ</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-3">{clue.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">{new Date(clue.date).toLocaleDateString()}</span>
                  <span className="text-xs text-green-400">✅ {t('home_active_found_via_buzz')}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/80 mb-2">{t('home_active_no_clues')}</p>
              <p className="text-sm text-white/60">{t('home_active_press_buzz')}</p>
            </div>
          )}
        </div>
      </div>
      
      {buzzClues.length > 0 && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); onClose(); setTimeout(goToNotifications, 300); }}
          className="w-full py-3.5 text-white text-sm font-medium rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.12) 0%, rgba(123, 46, 255, 0.12) 100%)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Bell className="w-4 h-4 text-[#00D1FF]" />
          {t('home_active_open_notifications')}
        </motion.button>
      )}
    </GlassModal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIME REMAINING MODAL
// ═══════════════════════════════════════════════════════════════════════════
interface TimeRemainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingDays: number;
  totalDays: number;
  startTime: string;
  timeline: { event: string; date: string; status: string }[];
}

function TimeRemainingModal({ isOpen, onClose, remainingDays, totalDays, startTime, timeline }: TimeRemainingModalProps) {
  const { t } = useTranslation();
  const timeProgress = ((totalDays - remainingDays) / totalDays) * 100;
  const isUrgent = remainingDays <= 5;
  const isExpired = remainingDays <= 0;
  
  return (
    <GlassModal 
      isOpen={isOpen} 
      onClose={onClose} 
      accentColor="#F59E0B"
      title={t('home_active_time_title')}
      subtitle={t('home_active_time_subtitle')}
    >
      {/* Main Stats Card */}
      <div 
        className="rounded-2xl p-5 mb-5"
        style={{
          background: `linear-gradient(135deg, ${isExpired ? 'rgba(239, 68, 68, 0.12)' : isUrgent ? 'rgba(249, 115, 22, 0.12)' : 'rgba(245, 158, 11, 0.12)'} 0%, rgba(0, 209, 255, 0.06) 100%)`,
          border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.25)' : isUrgent ? 'rgba(249, 115, 22, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Hourglass className={`w-8 h-8 ${isExpired ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-amber-400'}`} />
          <div className={`text-5xl font-bold ${isExpired ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-amber-400'}`}>
            {remainingDays}
          </div>
          <span className="text-xl text-white/80">{t('home_active_days')}</span>
        </div>
        
        <div className="w-full bg-black/30 rounded-full h-3 mb-3">
          <motion.div 
            className={`h-3 rounded-full ${
              isExpired ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]' :
              remainingDays <= 5 ? 'bg-gradient-to-r from-[#F97316] to-[#EF4444]' :
              remainingDays <= 15 ? 'bg-gradient-to-r from-[#FBBF24] to-[#F97316]' : 
              'bg-gradient-to-r from-[#FDE047] to-[#FBBF24]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-white/80">{t('home_active_elapsed_pct', { pct: Math.round(timeProgress) })}</span>
          <span className="text-amber-400 font-medium">{t('home_active_of_total_days', { total: totalDays })}</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-4 border border-white/10 text-center" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
          <p className="text-2xl font-bold text-green-400">{totalDays - remainingDays}</p>
          <p className="text-xs text-white/70 mt-1">{t('home_active_days_elapsed')}</p>
        </div>
        <div className="rounded-xl p-4 border border-white/10 text-center" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
          <p className={`text-2xl font-bold ${isExpired ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-amber-400'}`}>{remainingDays}</p>
          <p className="text-xs text-white/70 mt-1">{t('home_active_days_remaining')}</p>
        </div>
      </div>
      
      {/* Timeline */}
      <div>
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          {t('home_active_timeline_title')}
        </h3>
        <div className="space-y-2">
          {timeline.map((item, index) => (
            <motion.div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-xl border border-white/10"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'completed' ? 'bg-green-400' :
                  item.status === 'current' ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'
                }`} />
                <span className="text-white text-sm">{item.event}</span>
              </div>
              <span className="text-xs text-white/70">{item.date}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassModal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MISSION STATUS MODAL
// ═══════════════════════════════════════════════════════════════════════════
interface MissionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingDays: number;
  totalDays: number;
  startTime: string;
  cluesFound: number;
  totalClues: number;
}

function MissionStatusModal({ isOpen, onClose, remainingDays, totalDays, startTime, cluesFound, totalClues }: MissionStatusModalProps) {
  const { t } = useTranslation();
  const timeProgress = ((totalDays - remainingDays) / totalDays) * 100;
  const clueProgress = (cluesFound / totalClues) * 100;
  const isActive = remainingDays > 0;
  const statusColor = isActive ? '#00D1FF' : '#EF4444';
  
  return (
    <GlassModal 
      isOpen={isOpen} 
      onClose={onClose} 
      accentColor={statusColor}
      title={t('home_active_status_title')}
      subtitle={t('home_active_status_subtitle')}
    >
      {/* Status Badge */}
      <div 
        className="rounded-2xl p-5 mb-5 text-center"
        style={{
          background: `linear-gradient(135deg, ${isActive ? 'rgba(0, 209, 255, 0.12)' : 'rgba(239, 68, 68, 0.12)'} 0%, rgba(123, 46, 255, 0.06) 100%)`,
          border: `1px solid ${isActive ? 'rgba(0, 209, 255, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Target className={`w-8 h-8 ${isActive ? 'text-[#00D1FF]' : 'text-red-400'}`} />
          <span className={`text-3xl font-orbitron font-bold ${isActive ? 'text-[#00D1FF]' : 'text-red-400'}`}>
            {isActive ? t('home_active_active') : t('home_active_expired')}
          </span>
        </div>
        
        <div className="text-sm text-white/80">
          {t('home_active_started_on')} <span className="text-white font-medium">{new Date(startTime).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="space-y-4 mb-5">
        {/* Time Progress */}
        <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              {t('home_active_time_elapsed')}
            </span>
            <span className="text-sm font-bold text-amber-400">{Math.round(timeProgress)}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2.5">
            <motion.div 
              className={`h-2.5 rounded-full ${
                remainingDays <= 0 ? 'bg-red-500' :
                remainingDays <= 5 ? 'bg-gradient-to-r from-yellow-400 to-red-500' :
                remainingDays <= 15 ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 
                'bg-gradient-to-r from-[#00D1FF] to-green-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${timeProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs text-white/80 mt-2">
            {totalDays - remainingDays}/{totalDays} {t('home_active_days')}
          </div>
        </div>
        
        {/* Clues Progress */}
        <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70 flex items-center gap-2">
              <Search className="w-4 h-4 text-green-400" />
              {t('home_active_clue_progress')}
            </span>
            <span className="text-sm font-bold text-green-400">{Math.round(clueProgress)}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2.5">
            <motion.div 
              className={`h-2.5 rounded-full ${
                cluesFound === 0 ? 'bg-gray-500' :
                cluesFound < 50 ? 'bg-gradient-to-r from-[#00D1FF] to-blue-400' :
                cluesFound < 150 ? 'bg-gradient-to-r from-green-400 to-[#00D1FF]' : 
                'bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF]'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${clueProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <div className="text-xs text-white/80 mt-2">
            {t('home_active_clues_found_count', { found: cluesFound, total: totalClues })}
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 border border-white/10 text-center" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
          <p className="text-2xl font-bold text-green-400">{cluesFound}</p>
          <p className="text-xs text-white/80 mt-1">{t('home_active_goals_reached')}</p>
        </div>
        <div className="rounded-xl p-4 border border-white/10 text-center" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
          <p className="text-2xl font-bold text-red-400">{totalClues - cluesFound}</p>
          <p className="text-xs text-white/80 mt-1">{t('home_active_goals_remaining')}</p>
        </div>
      </div>
    </GlassModal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function ActiveMissionBox({ mission, purchasedClues = [], progress = 0 }: ActiveMissionBoxProps) {
  const { t } = useTranslation();
  const [isCluesModalOpen, setIsCluesModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [showEndWarningModal, setShowEndWarningModal] = useState(false);
  
  // 🔧 FIX 28/01/2026: Listen for external modal triggers from M1SSION AGENT shortcuts
  useEffect(() => {
    const handleOpenMissionModal = (e: CustomEvent<string>) => {
      switch (e.detail) {
        case 'clues':
          setIsCluesModalOpen(true);
          break;
        case 'time':
          setIsTimeModalOpen(true);
          break;
        case 'status':
          setIsStatusModalOpen(true);
          break;
      }
    };
    
    window.addEventListener('openMissionModal', handleOpenMissionModal as EventListener);
    return () => window.removeEventListener('openMissionModal', handleOpenMissionModal as EventListener);
  }, []);
  
  // Long press info states
  const [showCluesLongPress, setShowCluesLongPress] = useState(false);
  const [showTimeLongPress, setShowTimeLongPress] = useState(false);
  const [showStatusLongPress, setShowStatusLongPress] = useState(false);
  
  const prevClueCount = useRef<number>(0);
  const warningChecked = useRef<boolean>(false);
  
  // Long press handlers
  const cluesLongPress = useLongPress(() => setShowCluesLongPress(true), { threshold: 500 });
  const timeLongPress = useLongPress(() => setShowTimeLongPress(true), { threshold: 500 });
  const statusLongPress = useLongPress(() => setShowStatusLongPress(true), { threshold: 500 });
  
  // 🏆 MILESTONE SYSTEM
  const { 
    pendingMilestone, 
    checkAndClaimMilestones, 
    dismissMilestone,
    claimedKeys 
  } = useClueMilestones();
  
  // ⏰ PULSE & WARNING SYSTEM
  const daysRemaining = mission.remainingDays;
  const showPulse = shouldShowPulse(daysRemaining);
  const pulseIntensity = showPulse ? getPulseIntensity(daysRemaining) : 1.0;
  const isFinalDay = daysRemaining === 0;
  const isUrgent = daysRemaining <= 5;

  // Check if should show end warning modal on mount
  useEffect(() => {
    if (warningChecked.current) return;
    warningChecked.current = true;
    
    if (shouldShowEndWarning(daysRemaining) && !hasShownWarningToday(daysRemaining)) {
      if (import.meta.env.DEV) {
        console.log('[MISSION_END_WARNING]', { 
          daysRemaining, 
          pulseIntensity, 
          shouldShowModal: true,
          isFinalDay 
        });
      }
      // Small delay to let UI render first
      setTimeout(() => {
        setShowEndWarningModal(true);
        markWarningShown(daysRemaining);
      }, 500);
    } else if (import.meta.env.DEV) {
      console.log('[MISSION_END_WARNING]', { 
        daysRemaining, 
        pulseIntensity, 
        shouldShowModal: false,
        reason: shouldShowEndWarning(daysRemaining) ? 'already_shown_today' : 'not_in_warning_range'
      });
    }
  }, [daysRemaining, pulseIntensity, isFinalDay]);
  
  const goToNotifications = () => {
    window.location.href = '/notifications';
  };
  
  const realCluesFound = mission.foundClues ?? 0;
  const totalClues = mission.totalClues || 200;

  const { notifications } = useNotifications();
  const buzzClues = notifications.filter(n => n.type === 'buzz');
  const fallbackFoundFromBuzz = buzzClues?.length || 0;
  const displayCluesFound = realCluesFound > 0 ? realCluesFound : fallbackFoundFromBuzz;
  const latestBuzzClues = buzzClues.slice(-5).reverse();

  // 🏆 Check milestones when clue count changes
  useEffect(() => {
    if (displayCluesFound > 0 && displayCluesFound !== prevClueCount.current) {
      // Check if we crossed a milestone threshold
      const crossedMilestone = CLUE_MILESTONES.find(m => 
        displayCluesFound >= m.threshold && 
        prevClueCount.current < m.threshold &&
        !claimedKeys.has(m.key)
      );
      
      if (crossedMilestone) {
        // Trigger level-up animation
        setLevelUpAnimation(true);
        setTimeout(() => setLevelUpAnimation(false), 2000);
      }
      
      // Check and claim milestones
      checkAndClaimMilestones(displayCluesFound);
      prevClueCount.current = displayCluesFound;
    }
  }, [displayCluesFound, checkAndClaimMilestones, claimedKeys]);

  // Find next milestone for progress display
  const nextMilestone = CLUE_MILESTONES.find(m => displayCluesFound < m.threshold);
  const prevMilestone = [...CLUE_MILESTONES].reverse().find(m => displayCluesFound >= m.threshold);
  const milestoneProgress = nextMilestone && prevMilestone
    ? ((displayCluesFound - prevMilestone.threshold) / (nextMilestone.threshold - prevMilestone.threshold)) * 100
    : nextMilestone 
    ? (displayCluesFound / nextMilestone.threshold) * 100 
    : 100;

  const getMissionTimeline = () => {
    const startDate = new Date(mission.startTime);
    return [
      { event: "Missione Iniziata", date: startDate.toLocaleDateString('it-IT'), status: "completed" },
      { event: "Primo Indizio", date: new Date(startDate.getTime() + 86400000).toLocaleDateString('it-IT'), status: "completed" },
      { event: "Fase Intermedia", date: new Date().toLocaleDateString('it-IT'), status: "current" },
      { event: "Deadline Finale", date: new Date(startDate.getTime() + (mission.totalDays * 86400000)).toLocaleDateString('it-IT'), status: "pending" }
    ];
  };

  return (
    <div className="w-full">
      {/* Header - 🔧 FIX 06/02/2026 v2: "DI RILEVAMENTO" e "ORACLE" BIANCO PURO */}
      <div className="mb-4">
        <h2 className="text-xl font-orbitron font-bold mb-2">
          <span className="text-[#00D1FF]">PROTOCOLLO</span>
          <span style={{ color: '#FFFFFF', opacity: 1 }}> DI RILEVAMENTO</span>
        </h2>
        <h3 className="text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]">MISSIONE ID:</span>
          <span style={{ color: '#FFFFFF', opacity: 1 }}> {mission.title}</span>
        </h3>
      </div>

      {/* 🔧 FIX 28/01/2026: Solo "Tempo Rimasto" visibile su Home */}
      {/* "Indizi Trovati" e "Stato Missione" spostati dentro M1SSION AGENT come shortcuts */}
      <div className="grid grid-cols-1 gap-4">

        {/* TEMPO RIMASTO - 🔧 FIX 06/02/2026 v2: Glass graphite + PULSE GLOW RIPRISTINATO */}
        <motion.div
          data-section="time"
          className={`m1-folder-glass--graphite rounded-2xl p-4 cursor-pointer transition-colors overflow-hidden relative ${
            isFinalDay ? 'border-red-500/50' : 
            isUrgent ? 'border-orange-500/40' : 
            ''
          }`}
          onClick={() => setIsTimeModalOpen(true)}
          {...timeLongPress}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* 🔧 PULSE GLOW RIPRISTINATO - overlay when <= 10 days */}
          {showPulse && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: isFinalDay 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)'
                  : isUrgent
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
              }}
              animate={{
                opacity: [0.3, 0.6 * pulseIntensity, 0.3],
                boxShadow: [
                  `0 0 ${10 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                  `0 0 ${25 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
                  `0 0 ${10 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                ],
              }}
              transition={{
                duration: Math.max(0.5, 2 - pulseIntensity * 0.5),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          
          {/* Animated glow strip */}
          <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
            <div 
              className={`absolute inset-0 bg-gradient-to-r from-transparent ${
                isFinalDay ? 'via-red-500' : isUrgent ? 'via-orange-400' : 'via-amber-400'
              } to-transparent`} 
              style={{ 
                animation: showPulse 
                  ? `slideGlow ${Math.max(1, 3 - pulseIntensity)}s ease-in-out infinite` 
                  : 'slideGlow 3s ease-in-out infinite', 
                width: '200%', 
                left: '-100%',
                opacity: 0.6 * pulseIntensity
              }} 
            />
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${
                isFinalDay ? 'bg-red-500' : isUrgent ? 'bg-orange-400' : 'bg-amber-400'
              }`}
              animate={showPulse ? { 
                scale: [1, 1.3 * (pulseIntensity / 2), 1],
                opacity: [1, 0.7, 1]
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-white font-semibold text-sm">{t('home_active_time_remaining')}</span>
            {isFinalDay && (
              <span className="text-[10px] text-red-400 font-bold ml-auto animate-pulse">{t('home_active_last_day_badge')}</span>
            )}
            {!isFinalDay && isUrgent && (
              <span className="text-[10px] text-orange-400 ml-auto">⚠️ {t('home_active_urgent')}</span>
            )}
          </div>
          
          <div className={`text-2xl font-bold mb-2 ${
            isFinalDay ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-amber-400'
          }`}>
            {mission.remainingDays} {mission.remainingDays === 1 ? t('home_active_day') : t('home_active_days_plural')}
          </div>
          
          {/* Progress bar with pulse effect */}
          <div className="relative w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
            <motion.div 
              className={`h-2 rounded-full transition-all duration-500 ${
                mission.remainingDays <= 0 ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]' : 
                mission.remainingDays <= 5 ? 'bg-gradient-to-r from-[#F97316] to-[#EF4444]' : 
                mission.remainingDays <= 15 ? 'bg-gradient-to-r from-[#FBBF24] to-[#F97316]' : 
                'bg-gradient-to-r from-[#FDE047] to-[#FBBF24]'
              }`} 
              style={{ width: `${((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100}%` }}
              animate={showPulse ? {
                boxShadow: [
                  `0 0 ${5 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
                  `0 0 ${15 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 191, 36, 0.8)'}`,
                  `0 0 ${5 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          
          <span className="text-xs text-white/80">{t('home_active_of_total', { total: mission.totalDays })}</span>
          <div className="absolute bottom-2 right-2 text-white/50"><ChevronDown className="w-4 h-4" /></div>
        </motion.div>

        {/* 🔧 FIX 28/01/2026: "Stato Missione" card rimossa da Home - ora accessibile solo da M1SSION AGENT */}
      </div>
      
      {/* Keyframes */}
      <style>{`
        @keyframes slideGlow {
          0% { transform: translateX(0); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      
      {/* Modals */}
      <FoundCluesModal
        isOpen={isCluesModalOpen}
        onClose={() => setIsCluesModalOpen(false)}
        displayCluesFound={displayCluesFound}
        totalClues={totalClues}
        buzzClues={buzzClues}
        latestBuzzClues={latestBuzzClues}
        goToNotifications={goToNotifications}
      />
      
      <TimeRemainingModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        remainingDays={mission.remainingDays}
        totalDays={mission.totalDays}
        startTime={mission.startTime}
        timeline={getMissionTimeline()}
      />
      
      <MissionStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        remainingDays={mission.remainingDays}
        totalDays={mission.totalDays}
        startTime={mission.startTime}
        cluesFound={realCluesFound}
        totalClues={totalClues}
      />
      
      {/* 🏆 Milestone Celebration Modal - MOVED TO GLOBAL ClueMilestoneWatcher in App.tsx */}
      {/* Modal ora gestito globalmente per funzionare anche sulla mappa */}
      
      {/* ⏰ Mission End Warning Modal */}
      <GlassModal
        isOpen={showEndWarningModal}
        onClose={() => setShowEndWarningModal(false)}
        accentColor={isFinalDay ? '#EF4444' : '#F97316'}
        title={isFinalDay ? t('home_active_last_day_title') : t('home_active_ending_soon_title')}
        subtitle={isFinalDay ? t('home_active_last_chance') : t('home_active_days_left', { count: daysRemaining })}
      >
        <div className="text-center py-4">
          {/* Warning Icon */}
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: isFinalDay 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)',
              border: `2px solid ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(249, 115, 22, 0.5)'}`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                `0 0 20px ${isFinalDay ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`,
                `0 0 40px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(249, 115, 22, 0.5)'}`,
                `0 0 20px ${isFinalDay ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className={`w-10 h-10 ${isFinalDay ? 'text-red-400' : 'text-orange-400'}`} />
          </motion.div>
          
          {/* Countdown display */}
          <div className={`text-5xl font-orbitron font-bold mb-4 ${isFinalDay ? 'text-red-400' : 'text-orange-400'}`}>
            {daysRemaining}
          </div>
          <div className="text-white/80 text-lg mb-6">
            {daysRemaining === 0 ? t('home_active_last_day') : daysRemaining === 1 ? t('home_active_day_left') : t('home_active_days_remaining_label')}
          </div>
          
          {/* Message */}
          <div 
            className="rounded-xl p-4 mb-6"
            style={{
              background: isFinalDay
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(249, 115, 22, 0.1)',
              border: `1px solid ${isFinalDay ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`,
            }}
          >
            <p className="text-white/90 text-sm leading-relaxed">
              {isFinalDay 
                ? t('home_active_last_day_msg')
                : t('home_active_ending_soon_msg', { count: daysRemaining, days: daysRemaining === 1 ? t('home_active_day') : t('home_active_days_plural') })
              }
            </p>
          </div>
          
          {/* CTA Button */}
          <motion.button
            onClick={() => setShowEndWarningModal(false)}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
              isFinalDay 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isFinalDay ? t('home_active_start_now') : t('home_active_got_it')}
          </motion.button>
        </div>
      </GlassModal>
      
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LONG PRESS INFO MODALS - Versione Breve */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      
      {/* INDIZI TROVATI - Long Press */}
      <LongPressInfoModal
        isOpen={showCluesLongPress}
        onClose={() => setShowCluesLongPress(false)}
        title={t('home_active_clues_title')}
        subtitle={t('home_active_progress_treasure')}
        icon={<Search className="w-5 h-5 text-green-400" />}
        accentColor="#22C55E"
        items={[
          { label: t('home_active_found'), value: `${displayCluesFound}/${totalClues}`, color: '#22C55E', icon: <Target className="w-4 h-4" /> },
          { label: t('home_active_completion'), value: `${Math.round((displayCluesFound / totalClues) * 100)}%`, color: '#00D1FF' },
          { label: t('home_active_remaining_label'), value: totalClues - displayCluesFound, color: '#FFD700' },
          { label: t('home_active_next_milestone'), value: nextMilestone ? `${nextMilestone.threshold}` : t('home_active_completed'), color: '#A855F7' },
        ]}
        footer={
          <p className="text-xs text-white/70 text-center">
            {t('home_active_touch_for_details')}
          </p>
        }
      />
      
      {/* TEMPO RIMASTO - Long Press */}
      <LongPressInfoModal
        isOpen={showTimeLongPress}
        onClose={() => setShowTimeLongPress(false)}
        title={t('home_active_time_title')}
        subtitle={t('home_active_countdown_mission')}
        icon={<Clock className="w-5 h-5" style={{ color: isFinalDay ? '#EF4444' : isUrgent ? '#F97316' : '#FBBF24' }} />}
        accentColor={isFinalDay ? '#EF4444' : isUrgent ? '#F97316' : '#FBBF24'}
        items={[
          { label: t('home_active_days_remaining'), value: mission.remainingDays, color: isFinalDay ? '#EF4444' : isUrgent ? '#F97316' : '#FBBF24', icon: <Hourglass className="w-4 h-4" /> },
          { label: t('home_active_days_elapsed'), value: mission.totalDays - mission.remainingDays, color: '#22C55E' },
          { label: t('home_active_total_duration'), value: `${mission.totalDays} ${t('home_active_days')}`, color: '#00D1FF' },
          { label: t('home_active_completion'), value: `${Math.round(((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100)}%`, color: '#A855F7' },
          { label: t('home_active_started_on'), value: new Date(mission.startTime).toLocaleDateString(), color: '#fff' },
        ]}
        footer={
          <p className="text-xs text-white/70 text-center">
            {isFinalDay ? t('home_active_last_day_alert') : isUrgent ? `⏰ ${t('home_active_hurry')}` : t('home_active_touch_for_details')}
          </p>
        }
      />
      
      {/* STATO MISSIONE - Long Press */}
      <LongPressInfoModal
        isOpen={showStatusLongPress}
        onClose={() => setShowStatusLongPress(false)}
        title={t('home_active_status_title')}
        subtitle={mission.title}
        icon={mission.remainingDays > 0 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
        accentColor="#00D1FF"
        items={[
          { label: t('home_active_status_label'), value: mission.remainingDays > 0 ? t('home_active_active') : t('home_active_expired'), color: mission.remainingDays > 0 ? '#22C55E' : '#EF4444', icon: <Zap className="w-4 h-4" /> },
          { label: t('home_active_mission_id'), value: mission.id, color: '#00D1FF' },
          { label: t('home_active_title'), value: mission.title, color: '#fff' },
          { label: t('home_active_clues_found'), value: `${displayCluesFound}/${totalClues}`, color: '#22C55E' },
          { label: t('home_active_time_remaining'), value: `${mission.remainingDays} ${t('home_active_days_plural')}`, color: mission.remainingDays <= 5 ? '#F97316' : '#FBBF24' },
          { label: t('home_active_advancement'), value: `${Math.round(((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100)}%`, color: '#A855F7' },
        ]}
        footer={
          <p className="text-xs text-white/70 text-center">
            {t('home_active_touch_timeline')}
          </p>
        }
      />
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
