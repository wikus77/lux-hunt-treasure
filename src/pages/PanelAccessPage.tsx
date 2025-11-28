// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Pannello M1SSION PANEL™ con blindatura di sicurezza avanzata

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, Zap, AlertTriangle, RotateCcw, MapPin, QrCode, Send, Map, Users, Gift } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { useProfileImage } from '@/hooks/useProfileImage';
import { Helmet } from 'react-helmet-async';
import AIContentGenerator from '@/components/panel/AIContentGenerator';
import MissionControlPanel from '@/components/panel/MissionControlPanel';
import { MissionResetSection } from '@/components/panel/MissionResetSection';
import { MissionConfigSection } from '@/components/panel/MissionConfigSection';
import { usePanelAccessProtection } from '@/hooks/usePanelAccessProtection';
import { Spinner } from '@/components/ui/spinner';
import { QRControlPanel } from '@/components/admin/QRControlPanel';
// Removed obsolete debug panels - now using unified Push Center
// BulkMarkerDropComponent removed - replaced by MarkerRewardManager
import MarkerRewardManager from '@/components/admin/MarkerRewardManager';
import UsersRealtimePanel from '@/components/panel/UsersRealtimePanel';
import { useLocation } from 'wouter';
import { useAdminCheck } from '@/hooks/admin/useAdminCheck';
import PushCenterCard from '@/components/push-center/PushCenterCard';
import { PushCenter } from '@/components/panel/PushCenter';
import PushControlPanelPage from '@/pages/panel/PushControlPanelPage';
import PushAutoPreflightPage from '@/pages/panel/PushAutoPreflightPage';
import { PUSH_PREFLIGHT_ENABLED } from '@/config/featureFlags';

type ViewType = 'home' | 'ai-generator' | 'mission-control' | 'mission-reset' | 'mission-config' | 'qr-control' | 'marker-rewards' | 'push-center' | 'push-control' | 'push-sender' | 'push-preflight';

const PanelAccessPage = () => {
  const { user } = useUnifiedAuth();
  const { profileImage } = useProfileImage();
  const { isWhitelisted, isValidating, accessDeniedReason } = usePanelAccessProtection();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [, setLocation] = useLocation();
  const { isAdmin } = useAdminCheck(false);

  const hasAccess = isWhitelisted;

  // 🔐 BLINDATURA: Se non whitelisted, blocca completamente il rendering
  if (!isWhitelisted) {
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
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">⛔ Accesso Negato</h1>
          <p className="text-gray-400 mb-4">Solo gli amministratori possono accedere a questa pagina</p>
          
          <div className="bg-black/50 p-4 rounded-lg text-left text-xs font-mono">
            <h3 className="text-red-400 mb-2">Debug Info:</h3>
            <p className="text-gray-300">Email: {user?.email}</p>
            <p className="text-gray-300">Motivo: {accessDeniedReason}</p>
          </div>
        </div>
      </div>
    );
  }

  // ========== VIEWS ==========

  if (currentView === 'ai-generator' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - AI Generator</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <AIContentGenerator onBack={() => setCurrentView('home')} />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'mission-control' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - Mission Control</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <MissionControlPanel onBack={() => setCurrentView('home')} />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'mission-reset' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - Reset Missione</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <MissionResetSection />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'mission-config' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - Config Missione</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <MissionConfigSection />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'qr-control' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - QR Control</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <QRControlPanel />
          </div>
        </div>
      </div>
    );
  }

  // Removed old debug-test view - replaced by unified Push Center

  // Push Center View
  if (currentView === 'push-center' && hasAccess && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - Push Center</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
              <h1 className="text-2xl font-bold text-white">📡 Push Center</h1>
            </div>
            
            <PushCenterCard />
          </div>
        </div>
      </div>
    );
  }

  // 🎯 Marker Reward Manager View (replaces old Bulk Marker Drop)
  if (currentView === 'marker-rewards' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - Marker Reward Manager</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <MarkerRewardManager />
          </div>
        </div>
      </div>
    );
  }

  // Push Control Panel View
  if ((currentView === 'push-control' || currentView === 'push-sender') && hasAccess && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - Push Control</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <PushControlPanelPage />
          </div>
        </div>
      </div>
    );
  }

  // Push Preflight View
  if (currentView === 'push-preflight' && hasAccess && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <Helmet>
          <title>M1SSION PANEL™ - Push Preflight</title>
        </Helmet>
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
            </div>
            <PushAutoPreflightPage />
          </div>
        </div>
      </div>
    );
  }

  // ========== HOME VIEW ==========
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
      <Helmet>
        <title>M1SSION PANEL™ - Centro di Comando</title>
        <meta name="description" content="Centro di comando blindato per operazioni M1SSION™" />
      </Helmet>
      
      <UnifiedHeader profileImage={profileImage} />
      
      <div 
        className="px-4 py-12"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
                M1SSION PANEL
              </span>
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
                  <span className="text-green-400 font-mono">{user?.email}</span>
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

            {/* Push Center Card - Quick Access */}
            <div className="mb-6">
              <PushCenter />
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

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('mission-reset')}
                className="glass-card p-4 border border-red-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Reset Missione™</h3>
                    <p className="text-gray-400 text-sm">Riavvia completamente la missione corrente</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('mission-config')}
                className="glass-card p-4 border border-emerald-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Mission Config</h3>
                    <p className="text-gray-400 text-sm">Configurazione parametri missione</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation('/panel-users')}
                className="glass-card p-4 border border-purple-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Users (Realtime)</h3>
                    <p className="text-gray-400 text-sm">Lista utenti con aggiornamenti in tempo reale</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('qr-control')}
                className="glass-card p-4 border border-cyan-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">QR Control Panel</h3>
                    <p className="text-gray-400 text-sm">Gestione QR codes e marker</p>
                  </div>
                </div>
              </motion.div>

              {/* 🎯 Marker Reward Manager - Replaces Bulk Marker Drop */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('marker-rewards')}
                className="glass-card p-4 border border-emerald-500/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">🎯 Marker Reward Manager</h3>
                    <p className="text-gray-400 text-sm">Gestione completa marker con mappa interattiva, M1U, Indizi, Premi Fisici</p>
                  </div>
                </div>
              </motion.div>

              {isAdmin && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('push-center')}
                  className="glass-card p-4 border border-[#4361ee]/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">📡 Push Center</h3>
                      <p className="text-gray-400 text-sm">Invio + Debug + Subscriptions + Logs</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {isAdmin && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('push-control')}
                  className="glass-card p-4 border border-orange-500/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">🚀 Push Control Panel</h3>
                      <p className="text-gray-400 text-sm">Invio notifiche push avanzato</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Push Preflight: hidden via feature flag until fully implemented */}
              {isAdmin && PUSH_PREFLIGHT_ENABLED && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('push-preflight')}
                  className="glass-card p-4 border border-emerald-500/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">🔍 Push Preflight (RO)</h3>
                      <p className="text-gray-400 text-sm">Diagnostica catena push (solo lettura)</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {isAdmin && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/panel/push-sender')}
                  className="glass-card p-4 border border-blue-500/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">📤 Push Sender</h3>
                      <p className="text-gray-400 text-sm">Invio rapido Broadcast/Targeted/Self</p>
                    </div>
                  </div>
                </motion.div>
              )}
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