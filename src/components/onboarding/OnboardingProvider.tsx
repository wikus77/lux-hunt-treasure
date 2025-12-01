/**
 * ONBOARDING PROVIDER - Global State Management
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Gestisce lo stato globale del tutorial interattivo
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { ONBOARDING_STEPS, PAGE_ORDER, TOTAL_STEPS, OnboardingStep } from '@/data/onboardingSteps';
import { useAuthContext } from '@/contexts/auth';

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

const STORAGE_KEYS = {
  COMPLETED: 'm1ssion_onboarding_completed',
  SKIPPED: 'm1ssion_onboarding_skipped',
  CURRENT_STEP: 'm1ssion_onboarding_step',
  PAUSED: 'm1ssion_onboarding_paused',
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

  // Initialize from localStorage
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED) === 'true';
    const skipped = localStorage.getItem(STORAGE_KEYS.SKIPPED) === 'true';
    const savedStep = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_STEP) || '0', 10);
    const paused = localStorage.getItem(STORAGE_KEYS.PAUSED) === 'true';
    
    setState(prev => ({
      ...prev,
      isCompleted: completed,
      isSkipped: skipped,
      currentStepIndex: savedStep,
      currentStep: ONBOARDING_STEPS[savedStep] || null,
    }));

    // Auto-start for new users (only if logged in and not completed/skipped)
    if (user && !completed && !skipped && !paused) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isActive: true,
          currentStep: ONBOARDING_STEPS[savedStep] || ONBOARDING_STEPS[0],
        }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Navigate to correct page when step changes
  useEffect(() => {
    if (!state.isActive || !state.currentStep) return;
    
    const targetPage = state.currentStep.page;
    if (location !== targetPage) {
      navigate(targetPage);
    }
  }, [state.isActive, state.currentStep, location, navigate]);

  // Save progress
  useEffect(() => {
    if (state.isActive) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, state.currentStepIndex.toString());
    }
  }, [state.currentStepIndex, state.isActive]);

  const startOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.SKIPPED);
    localStorage.removeItem(STORAGE_KEYS.PAUSED);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, '0');
    
    setState({
      isActive: true,
      currentStepIndex: 0,
      currentStep: ONBOARDING_STEPS[0],
      isCompleted: false,
      isSkipped: false,
      isSandboxMode: false,
    });
  }, []);

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
        currentStep: ONBOARDING_STEPS[nextIndex],
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
        currentStep: ONBOARDING_STEPS[prevIndex],
      };
    });
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_STEPS) return;
    
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStepIndex: index,
      currentStep: ONBOARDING_STEPS[index],
    }));
  }, []);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.SKIPPED, 'true');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    
    setState(prev => ({
      ...prev,
      isActive: false,
      isSkipped: true,
      currentStep: null,
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, 'true');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    
    setState(prev => ({
      ...prev,
      isActive: false,
      isCompleted: true,
      currentStep: null,
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
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
  }, []);

  const pauseOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.PAUSED, 'true');
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  const resumeOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.PAUSED);
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: ONBOARDING_STEPS[prev.currentStepIndex],
    }));
  }, []);

  const enableSandboxMode = useCallback(() => {
    setState(prev => ({ ...prev, isSandboxMode: true, isActive: true }));
  }, []);

  const disableSandboxMode = useCallback(() => {
    setState(prev => ({ ...prev, isSandboxMode: false, isActive: false }));
  }, []);

  const currentPageSteps = ONBOARDING_STEPS.filter(s => s.page === location);

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

