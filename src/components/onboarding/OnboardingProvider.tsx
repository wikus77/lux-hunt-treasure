/**
 * ONBOARDING PROVIDER - Global State Management
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Gestisce lo stato globale del tutorial interattivo
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { ONBOARDING_STEPS_ACTIVE, PAGE_ORDER, TOTAL_STEPS, OnboardingStep } from '@/data/onboardingSteps';
import { useAuthContext } from '@/contexts/auth';

// 🎯 Use the active steps (already determined by LITE_MODE flag in onboardingSteps.ts)
const ACTIVE_STEPS = ONBOARDING_STEPS_ACTIVE;

interface OnboardingState {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: OnboardingStep | null;
  isCompleted: boolean;
  isSkipped: boolean;
  isSandboxMode: boolean;
}

interface OnboardingContextValue extends OnboardingState {
  // Actions
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  pauseOnboarding: () => void;
  resumeOnboarding: () => void;
  
  // Sandbox mode
  enableSandboxMode: () => void;
  disableSandboxMode: () => void;
  
  // Helpers
  totalSteps: number;
  progressPercent: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentPageSteps: OnboardingStep[];
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// 🔐 Chiavi localStorage legate all'utente per persistenza cross-session
const getStorageKeys = (userId?: string) => {
  const suffix = userId ? `_${userId}` : '';
  return {
    COMPLETED: `m1ssion_onboarding_completed${suffix}`,
    SKIPPED: `m1ssion_onboarding_skipped${suffix}`,
    CURRENT_STEP: `m1ssion_onboarding_step${suffix}`,
    PAUSED: `m1ssion_onboarding_paused${suffix}`,
  };
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [location, navigate] = useLocation();
  
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentStepIndex: 0,
    currentStep: null,
    isCompleted: false,
    isSkipped: false,
    isSandboxMode: false,
  });

  // 🔐 Get storage keys based on user ID
  const STORAGE_KEYS = getStorageKeys(user?.id);

  // Initialize from localStorage (user-specific with legacy fallback)
  useEffect(() => {
    if (!user?.id) return; // Aspetta che l'utente sia loggato
    
    const userStorageKeys = getStorageKeys(user.id);
    const legacyKeys = getStorageKeys(); // Chiavi senza userId
    
    // 🔐 Controlla prima chiavi user-specific, poi fallback a legacy
    let completed = localStorage.getItem(userStorageKeys.COMPLETED) === 'true';
    let skipped = localStorage.getItem(userStorageKeys.SKIPPED) === 'true';
    
    // 🔄 Fallback: se non trovato in user-specific, controlla legacy
    if (!completed && !skipped) {
      const legacyCompleted = localStorage.getItem(legacyKeys.COMPLETED) === 'true';
      const legacySkipped = localStorage.getItem(legacyKeys.SKIPPED) === 'true';
      
      // Se trovato in legacy, migra alla nuova chiave
      if (legacyCompleted) {
        localStorage.setItem(userStorageKeys.COMPLETED, 'true');
        completed = true;
        console.log('[ONBOARDING] 🔄 Migrated completed status to user-specific key');
      }
      if (legacySkipped) {
        localStorage.setItem(userStorageKeys.SKIPPED, 'true');
        skipped = true;
        console.log('[ONBOARDING] 🔄 Migrated skipped status to user-specific key');
      }
    }
    
    const savedStep = parseInt(localStorage.getItem(userStorageKeys.CURRENT_STEP) || '0', 10);
    const paused = localStorage.getItem(userStorageKeys.PAUSED) === 'true';
    
    setState(prev => ({
      ...prev,
      isCompleted: completed,
      isSkipped: skipped,
      currentStepIndex: savedStep,
      currentStep: ACTIVE_STEPS[savedStep] || null,
    }));

    // Auto-start for new users (only if logged in and not completed/skipped)
    if (!completed && !skipped && !paused) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isActive: true,
          currentStep: ACTIVE_STEPS[savedStep] || ACTIVE_STEPS[0],
        }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.id]); // 🔐 Re-run quando cambia l'utente

  // Navigate to correct page when step changes
  useEffect(() => {
    if (!state.isActive || !state.currentStep) return;
    
    const targetPage = state.currentStep.page;
    if (location !== targetPage) {
      navigate(targetPage);
    }
  }, [state.isActive, state.currentStep, location, navigate]);

  // Save progress (user-specific)
  useEffect(() => {
    if (state.isActive && user?.id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, state.currentStepIndex.toString());
    }
  }, [state.currentStepIndex, state.isActive, user?.id, STORAGE_KEYS.CURRENT_STEP]);

  const startOnboarding = useCallback(() => {
    if (!user?.id) return; // Non avviare se non c'è utente
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.SKIPPED);
    localStorage.removeItem(STORAGE_KEYS.PAUSED);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, '0');
    
    setState({
      isActive: true,
      currentStepIndex: 0,
      currentStep: ACTIVE_STEPS[0],
      isCompleted: false,
      isSkipped: false,
      isSandboxMode: false,
    });
  }, [user?.id, STORAGE_KEYS]);

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentStepIndex + 1;
      
      if (nextIndex >= TOTAL_STEPS) {
        // Complete onboarding
        localStorage.setItem(STORAGE_KEYS.COMPLETED, 'true');
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
        return {
          ...prev,
          isActive: false,
          isCompleted: true,
          currentStep: null,
        };
      }
      
      return {
        ...prev,
        currentStepIndex: nextIndex,
        currentStep: ACTIVE_STEPS[nextIndex],
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      if (prev.currentStepIndex <= 0) return prev;
      
      const prevIndex = prev.currentStepIndex - 1;
      return {
        ...prev,
        currentStepIndex: prevIndex,
        currentStep: ACTIVE_STEPS[prevIndex],
      };
    });
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_STEPS) return;
    
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStepIndex: index,
        currentStep: ACTIVE_STEPS[index],
    }));
  }, []);

  const skipOnboarding = useCallback(() => {
    if (!user?.id) return;
    localStorage.setItem(STORAGE_KEYS.SKIPPED, 'true');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    
    setState(prev => ({
      ...prev,
      isActive: false,
      isSkipped: true,
      currentStep: null,
    }));
  }, [user?.id, STORAGE_KEYS]);

  const completeOnboarding = useCallback(() => {
    if (!user?.id) return;
    localStorage.setItem(STORAGE_KEYS.COMPLETED, 'true');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    
    setState(prev => ({
      ...prev,
      isActive: false,
      isCompleted: true,
      currentStep: null,
    }));
  }, [user?.id, STORAGE_KEYS]);

  const resetOnboarding = useCallback(() => {
    if (!user?.id) return;
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.SKIPPED);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    localStorage.removeItem(STORAGE_KEYS.PAUSED);
    
    setState({
      isActive: false,
      currentStepIndex: 0,
      currentStep: null,
      isCompleted: false,
      isSkipped: false,
      isSandboxMode: false,
    });
  }, [user?.id, STORAGE_KEYS]);

  const pauseOnboarding = useCallback(() => {
    if (!user?.id) return;
    localStorage.setItem(STORAGE_KEYS.PAUSED, 'true');
    setState(prev => ({ ...prev, isActive: false }));
  }, [user?.id, STORAGE_KEYS]);

  const resumeOnboarding = useCallback(() => {
    if (!user?.id) return;
    localStorage.removeItem(STORAGE_KEYS.PAUSED);
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: ACTIVE_STEPS[prev.currentStepIndex],
    }));
  }, [user?.id, STORAGE_KEYS]);

  const enableSandboxMode = useCallback(() => {
    setState(prev => ({ ...prev, isSandboxMode: true, isActive: true }));
  }, []);

  const disableSandboxMode = useCallback(() => {
    setState(prev => ({ ...prev, isSandboxMode: false, isActive: false }));
  }, []);

  const currentPageSteps = ACTIVE_STEPS.filter(s => s.page === location);

  const value: OnboardingContextValue = {
    ...state,
    startOnboarding,
    nextStep,
    prevStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    pauseOnboarding,
    resumeOnboarding,
    enableSandboxMode,
    disableSandboxMode,
    totalSteps: TOTAL_STEPS,
    progressPercent: ((state.currentStepIndex + 1) / TOTAL_STEPS) * 100,
    isFirstStep: state.currentStepIndex === 0,
    isLastStep: state.currentStepIndex === TOTAL_STEPS - 1,
    currentPageSteps,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

export default OnboardingProvider;

