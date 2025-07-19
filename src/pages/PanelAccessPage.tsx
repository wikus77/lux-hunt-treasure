import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, Zap } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { useProfileImage } from '@/hooks/useProfileImage';
import { Helmet } from 'react-helmet';
import AIContentGenerator from '@/components/panel/AIContentGenerator';
import MissionControlPanel from '@/components/panel/MissionControlPanel';

const PanelAccessPage = () => {
  const { hasRole, getCurrentUser } = useAuthContext();
  const { profileImage } = useProfileImage();
  const currentUser = getCurrentUser();
  
  const [currentView, setCurrentView] = useState<'home' | 'ai-generator' | 'mission-control'>('home');
  
  const isAdmin = hasRole('admin');
  const isDeveloper = hasRole('developer');
  const hasAccess = isAdmin || isDeveloper;

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

          {hasAccess ? (
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
                    Accesso Autorizzato
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Utente:</span>
                    <span className="text-white font-mono">{currentUser?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Ruolo:</span>
                    <span className="text-[#4361ee] font-semibold">
                      {isAdmin ? 'Amministratore' : isDeveloper ? 'Sviluppatore' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Livello:</span>
                    <span className="text-green-400 font-semibold">CLEARANCE LEVEL α</span>
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
                  M1SSION PANEL™ - Versione Beta Interna v2.1.0
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card p-8 border border-red-500/30 text-center"
            >
              <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-red-400 mb-3">
                Accesso Negato
              </h2>
              <p className="text-gray-400 mb-6">
                L'accesso al M1SSION PANEL™ è riservato esclusivamente a utenti con privilegi di amministratore o sviluppatore.
              </p>
              <div className="text-sm text-gray-500">
                <p>Utente corrente: {currentUser?.email || 'Non autenticato'}</p>
                <p>Livello di clearance: INSUFFICIENTE</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelAccessPage;