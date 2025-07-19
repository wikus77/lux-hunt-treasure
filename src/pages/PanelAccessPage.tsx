// © 2025 Joseph MULÉ – M1SSION™
// Pannello M1SSION PANEL™ con blindatura di sicurezza avanzata

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, Zap, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { useProfileImage } from '@/hooks/useProfileImage';
import { Helmet } from 'react-helmet';
import AIContentGenerator from '@/components/panel/AIContentGenerator';
import MissionControlPanel from '@/components/panel/MissionControlPanel';
import { usePanelAccessProtection } from '@/hooks/usePanelAccessProtection';
import { Spinner } from '@/components/ui/spinner';

const PanelAccessPage = () => {
  const { getCurrentUser } = useAuthContext();
  const { profileImage } = useProfileImage();
  const { isWhitelisted, isValidating, accessDeniedReason } = usePanelAccessProtection();
  const currentUser = getCurrentUser();
  
  const [currentView, setCurrentView] = useState<'home' | 'ai-generator' | 'mission-control'>('home');

  // 🔐 BLINDATURA: Se non whitelisted, blocca completamente il rendering
  if (!isWhitelisted) {
    // Durante la validazione, mostra loader
    if (isValidating) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center">
          <div className="text-center">
            <Spinner className="h-12 w-12 text-[#4361ee] mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">Validazione Accesso M1SSION PANEL™</p>
            <p className="text-gray-400 text-sm mt-2">Verifica clearance in corso...</p>
          </div>
        </div>
      );
    }
    
    // Se validazione completata e accesso negato, mostra messaggio minimal
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">⛔ Accesso Negato</h1>
          <p className="text-gray-400">Clearance insufficiente per M1SSION PANEL™</p>
          {accessDeniedReason && (
            <p className="text-xs text-gray-600 mt-4">Codice: {accessDeniedReason}</p>
          )}
        </div>
      </div>
    );
  }

  // ✅ ACCESSO AUTORIZZATO - Procedi con il rendering normale
  const hasAccess = true; // L'utente è già whitelisted a questo punto

  // Render different views based on current state
  if (currentView === 'ai-generator' && hasAccess) {
    return <AIContentGenerator onBack={() => setCurrentView('home')} />;
  }
  
  if (currentView === 'mission-control' && hasAccess) {
    return <MissionControlPanel onBack={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
      <Helmet>
        <title>M1SSION PANEL™ - AI Access</title>
      </Helmet>
      
      <UnifiedHeader profileImage={profileImage} />
      
      <div 
        className="px-4 py-8"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center">
                  <Cpu className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-orbitron font-bold mb-3">
              <span className="text-[#4361ee]">M1SSION</span>
              <span className="text-white"> PANEL</span>
              <span className="text-xs align-top text-[#7209b7]">™</span>
            </h1>
            
            <p className="text-gray-400 text-lg">
              Centro AI Generativo per Test Interni
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold text-green-400">
                  🔐 Accesso Autorizzato - Blindatura Attiva
                </h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Utente Autorizzato:</span>
                  <span className="text-green-400 font-mono">{currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Clearance:</span>
                  <span className="text-[#4361ee] font-semibold">MAXIMUM SECURITY</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Protezione:</span>
                  <span className="text-green-400 font-semibold">SHA-256 VERIFIED ✓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Sessione:</span>
                  <span className="text-green-400 font-semibold">TRACKING ATTIVO</span>
                </div>
              </div>
            </div>

              <div className="grid gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('ai-generator')}
                  className="glass-card p-4 border border-[#4361ee]/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Content Generator</h3>
                      <p className="text-gray-400 text-sm">Generazione automatica di indizi e contenuti</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('mission-control')}
                  className="glass-card p-4 border border-[#7209b7]/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#7209b7] to-[#4361ee] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Mission Control</h3>
                      <p className="text-gray-400 text-sm">Controllo avanzato delle missioni attive</p>
                    </div>
                  </div>
                </motion.div>
              </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                M1SSION PANEL™ - Versione Blindata v3.0.0 - © 2025 Joseph MULÉ
              </p>
              <p className="text-xs text-green-600 mt-1">
                🔐 Sistema Anti-Infiltrazione Attivo
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PanelAccessPage;