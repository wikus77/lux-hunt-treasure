/**
 * ONBOARDING SANDBOX - Test Page
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Pagina dedicata per testare il tutorial interattivo
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { ONBOARDING_STEPS, PAGE_ORDER } from '@/data/onboardingSteps';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Eye, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Map,
  Zap,
  Bot,
  Bell,
  Trophy,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { hapticLight } from '@/utils/haptics';

const PAGE_ICONS: Record<string, React.ReactNode> = {
  '/home': <Home className="w-4 h-4" />,
  '/map-3d-tiler': <Map className="w-4 h-4" />,
  '/buzz': <Zap className="w-4 h-4" />,
  '/ai': <Bot className="w-4 h-4" />,
  '/notice': <Bell className="w-4 h-4" />,
  '/leaderboard': <Trophy className="w-4 h-4" />,
};

export default function OnboardingSandbox() {
  const {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    progressPercent,
    isCompleted,
    isSkipped,
    isSandboxMode,
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
  } = useOnboarding();

  const [showOptions, setShowOptions] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  const handleStartTest = () => {
    hapticLight();
    enableSandboxMode();
    startOnboarding();
  };

  const handleStopTest = () => {
    hapticLight();
    disableSandboxMode();
    pauseOnboarding();
  };

  const handleReset = () => {
    hapticLight();
    resetOnboarding();
  };

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  // Group steps by page
  const stepsByPage = PAGE_ORDER.map(page => ({
    page,
    steps: ONBOARDING_STEPS.filter(s => s.page === page),
    startIndex: ONBOARDING_STEPS.findIndex(s => s.page === page),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <TestTube className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-orbitron font-bold text-white">
              ONBOARDING SANDBOX
            </h1>
          </div>
          <p className="text-gray-400">
            Testa il tutorial interattivo prima di pubblicarlo
          </p>
        </motion.div>

        {/* Status Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Stato Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg">
                {isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-300">
                  {isActive ? 'Attivo' : 'Inattivo'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-sm text-gray-300">
                  {isCompleted ? 'Completato' : 'Non completato'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg">
                {isSkipped ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-300">
                  {isSkipped ? 'Skippato' : 'Non skippato'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg">
                {isSandboxMode ? (
                  <TestTube className="w-4 h-4 text-purple-400" />
                ) : (
                  <TestTube className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-300">
                  {isSandboxMode ? 'Sandbox ON' : 'Sandbox OFF'}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progresso</span>
                <span className="text-cyan-400 font-medium">
                  {currentStepIndex + 1} / {totalSteps}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Current step info */}
            {currentStep && (
              <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{currentStep.icon}</span>
                  <span className="font-medium text-white">{currentStep.title}</span>
                </div>
                <p className="text-sm text-gray-400">Pagina: {currentStep.page}</p>
                <p className="text-sm text-gray-400">Target: {currentStep.targetSelector.split(',')[0]}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-green-400" />
              Controlli Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main controls */}
            <div className="flex flex-wrap gap-2">
              {!isActive ? (
                <Button
                  onClick={handleStartTest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Avvia Test
                </Button>
              ) : (
                <Button
                  onClick={handleStopTest}
                  variant="outline"
                  className="border-yellow-500 text-yellow-500"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pausa
                </Button>
              )}
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-red-500 text-red-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <Button
                onClick={skipOnboarding}
                variant="outline"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Salta Tutto
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-gray-400 text-sm flex-1 text-center">
                Naviga tra gli step
              </span>
              
              <Button
                onClick={nextStep}
                disabled={currentStepIndex >= totalSteps - 1}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step selector by page */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Vai a Step
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stepsByPage.map(({ page, steps, startIndex }) => (
                <div key={page} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    {PAGE_ICONS[page]}
                    <span>{page}</span>
                    <span className="text-xs text-gray-500">({steps.length} step)</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 ml-6">
                    {steps.map((step, i) => {
                      const globalIndex = startIndex + i;
                      const status = getStepStatus(globalIndex);
                      
                      return (
                        <button
                          key={step.id}
                          onClick={() => {
                            hapticLight();
                            goToStep(globalIndex);
                          }}
                          className={`
                            w-8 h-8 rounded-lg text-xs font-medium transition-all
                            ${status === 'completed' 
                              ? 'bg-green-600/30 text-green-400 border border-green-500/30' 
                              : status === 'current'
                              ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/50 ring-2 ring-cyan-500/30'
                              : 'bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-700/50'}
                          `}
                          title={step.title}
                        >
                          {globalIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All steps list */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">📋 Tutti gli Step ({totalSteps})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {ONBOARDING_STEPS.map((step, index) => {
                const status = getStepStatus(index);
                
                return (
                  <motion.button
                    key={step.id}
                    onClick={() => {
                      hapticLight();
                      goToStep(index);
                    }}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all
                      ${status === 'current' 
                        ? 'bg-cyan-900/30 border border-cyan-500/50' 
                        : 'bg-gray-700/20 border border-gray-700/50 hover:bg-gray-700/30'}
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${status === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : status === 'current'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-600 text-gray-300'}
                      `}>
                        {status === 'completed' ? '✓' : index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{step.icon}</span>
                          <span className={`font-medium truncate ${status === 'current' ? 'text-cyan-400' : 'text-white'}`}>
                            {step.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {step.page} • {step.action}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pb-4">
          © 2025 Joseph MULÉ – M1SSION™ – Onboarding Sandbox v1.0
        </div>
      </div>
    </div>
  );
}

