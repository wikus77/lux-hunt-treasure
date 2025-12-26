// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Sandbox per testare i componenti di Onboarding
// Accesso: /sandbox/onboarding-test

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DNAModal } from '@/components/dna/DNAModal';
import WelcomeBonusModal from '@/components/welcome/WelcomeBonusModal';
import { Play, Dna, Gift, RotateCcw } from 'lucide-react';
import type { DNAScores } from '@/features/dna/dnaTypes';

const OnboardingSandbox: React.FC = () => {
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [dnaResult, setDnaResult] = useState<DNAScores | null>(null);
  const [welcomeCompleted, setWelcomeCompleted] = useState(false);

  const handleDNAComplete = (scores: DNAScores) => {
    setDnaResult(scores);
    setShowDNAModal(false);
    console.log('[Sandbox] DNA completed:', scores);
  };

  const handleDNASkip = () => {
    setShowDNAModal(false);
    console.log('[Sandbox] DNA skipped');
  };

  const handleWelcomeComplete = () => {
    setWelcomeCompleted(true);
    setShowWelcomeModal(false);
    console.log('[Sandbox] Welcome bonus completed');
  };

  const resetAll = () => {
    setDnaResult(null);
    setWelcomeCompleted(false);
    setShowDNAModal(false);
    setShowWelcomeModal(false);
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 50%, #0a0f1a 100%)'
      }}
    >
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold font-orbitron mb-2">
            <span className="text-cyan-400">ONBOARDING</span>{' '}
            <span className="text-white">SANDBOX</span>
          </h1>
          <p className="text-gray-400">
            Test dei componenti di onboarding M1SSION
          </p>
        </motion.div>
      </div>

      {/* Control Panel */}
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* DNA Modal Test */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,229,255,0.2)',
            boxShadow: '0 0 30px rgba(0,229,255,0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Dna className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-orbitron">
                DNA MODAL
              </h2>
              <p className="text-sm text-gray-400">
                Questionario identità agente
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-4">
            Il DNA Modal appare dopo la registrazione per determinare l'archetipo dell'agente 
            attraverso una serie di domande. Include preview live dell'archetipo e opzione skip.
          </p>

          {dnaResult && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm font-medium">✓ DNA Completato</p>
              <p className="text-gray-400 text-xs mt-1">
                Scores: {JSON.stringify(dnaResult)}
              </p>
            </div>
          )}

          <button
            onClick={() => setShowDNAModal(true)}
            className="w-full py-3 px-4 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
              boxShadow: '0 0 20px rgba(0,229,255,0.3)'
            }}
          >
            <Play className="w-5 h-5" />
            AVVIA DNA MODAL
          </button>
        </motion.div>

        {/* Welcome Bonus Modal Test */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(138,43,226,0.2)',
            boxShadow: '0 0 30px rgba(138,43,226,0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-orbitron">
                WELCOME BONUS
              </h2>
              <p className="text-sm text-gray-400">
                Modal bonus 500 M1U
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-4">
            Il Welcome Bonus Modal appare dopo l'onboarding DNA per accreditare 500 M1U 
            all'utente. Include animazione slot machine e effetti particellari.
          </p>

          {welcomeCompleted && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm font-medium">✓ Bonus Completato</p>
              <p className="text-gray-400 text-xs mt-1">
                500 M1U accreditati (simulazione sandbox)
              </p>
            </div>
          )}

          <button
            onClick={() => setShowWelcomeModal(true)}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              boxShadow: '0 0 20px rgba(138,43,226,0.3)'
            }}
          >
            <Play className="w-5 h-5" />
            AVVIA WELCOME MODAL
          </button>
        </motion.div>

        {/* Full Flow Test */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,215,0,0.2)',
            boxShadow: '0 0 30px rgba(255,215,0,0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-orbitron">
                FLUSSO COMPLETO
              </h2>
              <p className="text-sm text-gray-400">
                DNA → Welcome Bonus
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-4">
            Avvia il flusso completo di onboarding: prima il DNA Modal, poi automaticamente 
            il Welcome Bonus Modal dopo il completamento.
          </p>

          <button
            onClick={() => {
              resetAll();
              setShowDNAModal(true);
            }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 0 20px rgba(255,215,0,0.3)'
            }}
          >
            <Play className="w-5 h-5" />
            AVVIA FLUSSO COMPLETO
          </button>
        </motion.div>

        {/* Reset Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={resetAll}
            className="py-2 px-6 rounded-lg text-gray-400 hover:text-white flex items-center gap-2 mx-auto transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Sandbox
          </button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-xs mt-8"
        >
          <p>
            Questa sandbox è solo per test. I dati non vengono salvati.
          </p>
          <p className="mt-1">
            © 2025 M1SSION™ - NIYVORA KFT™
          </p>
        </motion.div>
      </div>

      {/* DNA Modal */}
      <DNAModal
        isOpen={showDNAModal}
        onComplete={(scores) => {
          handleDNAComplete(scores);
          // If in full flow, show welcome modal after DNA
          setTimeout(() => setShowWelcomeModal(true), 500);
        }}
        onSkip={handleDNASkip}
      />

      {/* Welcome Bonus Modal */}
      <WelcomeBonusModal
        isOpen={showWelcomeModal}
        onComplete={handleWelcomeComplete}
      />
    </div>
  );
};

export default OnboardingSandbox;



