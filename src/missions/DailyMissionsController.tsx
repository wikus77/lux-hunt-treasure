/**
 * DAILY MISSIONS CONTROLLER
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Main controller for daily missions system.
 * Mounted once in App.tsx, runs in background.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';
import { MISSIONS_ENABLED } from './missionsRegistry';

// Routes where Daily Missions should NOT appear (sandbox, testing, etc.)
const EXCLUDED_ROUTES = ['/sandbox/', '/onboarding-test', '/landing'];
import { areMissionsCompleted as areMicroMissionsCompleted } from '@/config/firstSessionConfig';
import { 
  getMissionState, 
  startMission, 
  markBriefingShown,
  isPhase2Available,
} from './missionState';
import { 
  getEngineState, 
  handlePhase1Complete, 
  handlePhase2Complete,
} from './missionEngine';

// UI Components
import MissionBriefingModal from './ui/MissionBriefingModal';
import MissionCompletionModal from './ui/MissionCompletionModal';
import Phase2ResumeModal from './ui/Phase2ResumeModal';
import MissionProgressPill from './ui/MissionProgressPill';
import MissionActionsModal from './ui/MissionActionsModal';

// ═══════════════════════════════════════════════════════════════
// 🎮 CONTROLLER COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DailyMissionsController() {
  const [location] = useLocation();
  const { isAuthenticated } = useUnifiedAuth();
  const registerActivePopup = useEntityOverlayStore((s) => s.registerActivePopup);
  const unregisterActivePopup = useEntityOverlayStore((s) => s.unregisterActivePopup);

  // Don't render on excluded routes (sandbox, testing, etc.)
  const isExcludedRoute = EXCLUDED_ROUTES.some(route => location.startsWith(route));
  if (isExcludedRoute) {
    return null;
  }

  // Modal states
  const [showBriefing, setShowBriefing] = useState(false);
  const [showPhase2Resume, setShowPhase2Resume] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState<{ phase: 1 | 2; reward: number } | null>(null);

  // Engine state
  const [engineState, setEngineState] = useState(getEngineState);

  // Refresh engine state
  const refreshState = useCallback(() => {
    setEngineState(getEngineState());
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 🚀 INITIAL LOAD - Check what to show
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!MISSIONS_ENABLED || !isAuthenticated) return;

    // ✅ FIX 23/12/2025: Aspetta che le micro-missions siano completate
    // prima di mostrare le Daily Missions
    if (!areMicroMissionsCompleted()) {
      console.log('[DailyMissions] ⏳ Waiting for micro-missions to complete...');
      return;
    }

    const timer = setTimeout(() => {
      const state = getEngineState();
      setEngineState(state);

      console.log('[DailyMissions] 🔍 Engine state:', {
        enabled: state.enabled,
        shouldShowBriefing: state.shouldShowBriefing,
        shouldShowPhase2Resume: state.shouldShowPhase2Resume,
        phase: state.missionState.phase,
      });

      // Show appropriate modal
      if (state.shouldShowPhase2Resume) {
        setShowPhase2Resume(true);
        registerActivePopup('DailyMissions:Phase2Resume');
      } else if (state.shouldShowBriefing) {
        setShowBriefing(true);
        registerActivePopup('DailyMissions:Briefing');
      }
    }, 2000); // 2 second delay after login

    return () => clearTimeout(timer);
  }, [isAuthenticated, registerActivePopup]);

  // ═══════════════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleStartMission = useCallback(() => {
    if (!engineState.currentMission) return;
    
    startMission(engineState.currentMission.id);
    markBriefingShown();
    setShowBriefing(false);
    unregisterActivePopup('DailyMissions:Briefing');
    refreshState();
    console.log('[DailyMissions] 🚀 Mission started');
    
    // ✅ FIX: Apri automaticamente il modal delle azioni dopo START MISSION
    // Così l'utente sa cosa fare per completare la fase 1
    setTimeout(() => {
      setShowActionsModal(true);
      registerActivePopup('DailyMissions:Actions');
      console.log('[DailyMissions] 📋 Opened actions modal automatically');
    }, 300);
  }, [engineState.currentMission, unregisterActivePopup, refreshState, registerActivePopup]);

  const handleDismissBriefing = useCallback(() => {
    markBriefingShown();
    setShowBriefing(false);
    unregisterActivePopup('DailyMissions:Briefing');
  }, [unregisterActivePopup]);

  const handlePhase1Action = useCallback(async (progressData?: Record<string, string | number>) => {
    try {
      const reward = await handlePhase1Complete(progressData);
      setShowActionsModal(false);
      setCompletionData({ phase: 1, reward });
      setShowCompletionModal(true);
      registerActivePopup('DailyMissions:Completion');
      refreshState();
    } catch (err) {
      console.error('[DailyMissions] Phase 1 error:', err);
    }
  }, [registerActivePopup, refreshState]);

  const handlePhase2Action = useCallback(async (progressData?: Record<string, string | number>) => {
    try {
      const reward = await handlePhase2Complete(progressData);
      setShowPhase2Resume(false);
      unregisterActivePopup('DailyMissions:Phase2Resume');
      setCompletionData({ phase: 2, reward });
      setShowCompletionModal(true);
      registerActivePopup('DailyMissions:Completion');
      refreshState();
    } catch (err) {
      console.error('[DailyMissions] Phase 2 error:', err);
    }
  }, [registerActivePopup, unregisterActivePopup, refreshState]);

  const handleDismissPhase2 = useCallback(() => {
    setShowPhase2Resume(false);
    unregisterActivePopup('DailyMissions:Phase2Resume');
  }, [unregisterActivePopup]);

  const handleCloseCompletion = useCallback(() => {
    setShowCompletionModal(false);
    setCompletionData(null);
    unregisterActivePopup('DailyMissions:Completion');
  }, [unregisterActivePopup]);

  const handlePillClick = useCallback(() => {
    const state = getMissionState();
    
    // If mission not started, show briefing
    if (state.phase === 0) {
      setShowBriefing(true);
      registerActivePopup('DailyMissions:Briefing');
    }
    // If phase 2 is available, show that modal
    else if (isPhase2Available()) {
      setShowPhase2Resume(true);
      registerActivePopup('DailyMissions:Phase2Resume');
    } 
    // Otherwise show actions modal
    else {
      setShowActionsModal(true);
      registerActivePopup('DailyMissions:Actions');
    }
  }, [registerActivePopup]);

  const handleCloseActionsModal = useCallback(() => {
    setShowActionsModal(false);
    unregisterActivePopup('DailyMissions:Actions');
  }, [unregisterActivePopup]);

  // ═══════════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════════

  if (!MISSIONS_ENABLED || !isAuthenticated) return null;

  return (
    <>
      {/* NOTE: MissionPill is now mounted directly in MapTiler3D.tsx */}

      {/* Briefing Modal */}
      {engineState.currentMission && (
        <MissionBriefingModal
          mission={engineState.currentMission}
          isOpen={showBriefing}
          onStart={handleStartMission}
          onDismiss={handleDismissBriefing}
        />
      )}

      {/* Phase 2 Resume Modal */}
      {engineState.currentMission && (
        <Phase2ResumeModal
          mission={engineState.currentMission}
          isOpen={showPhase2Resume}
          onConfirmComplete={handlePhase2Action}
          onDismiss={handleDismissPhase2}
        />
      )}

      {/* Actions Modal (from pill click) */}
      {engineState.currentMission && (
        <MissionActionsModal
          mission={engineState.currentMission}
          missionState={engineState.missionState}
          isOpen={showActionsModal}
          onCompletePhase1={handlePhase1Action}
          onClose={handleCloseActionsModal}
        />
      )}

      {/* Completion Modal */}
      {completionData && engineState.currentMission && (
        <MissionCompletionModal
          isOpen={showCompletionModal}
          phase={completionData.phase}
          rewardAmount={completionData.reward}
          missionTitle={engineState.currentMission.title}
          onClose={handleCloseCompletion}
        />
      )}
    </>
  );
}

