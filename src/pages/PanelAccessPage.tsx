// © 2025 Joseph MULÉ – M1SSION™
// Pannello M1SSION PANEL™ con blindatura di sicurezza avanzata

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, Zap, AlertTriangle, RotateCcw, MapPin, QrCode, Send } from 'lucide-react';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { M1ssionDebugTest } from './M1ssionDebugTest';
import { EdgeFunctionTester } from '@/components/debug/EdgeFunctionTester';
import { OneSignalRegistration } from '@/components/debug/OneSignalRegistration';
import { M1ssionPushTestForm } from './M1ssionPushTestForm';
import { M1ssionFirebasePushTestPanel } from '@/components/admin/M1ssionFirebasePushTestPanel';
import { FCMTokenGenerator } from '@/components/debug/FCMTokenGenerator';
import { FCMCompleteTestSuite } from '@/components/debug/FCMCompleteTestSuite';


const PanelAccessPage = () => {
  const { user } = useUnifiedAuth();
  const { profileImage } = useProfileImage();
  const { isWhitelisted, isValidating, accessDeniedReason } = usePanelAccessProtection();
  
  
  const [currentView, setCurrentView] = useState<'home' | 'ai-generator' | 'mission-control' | 'mission-reset' | 'mission-config' | 'qr-control' | 'debug-test' | 'firebase-debug-test' | 'push-test-form'>('home');

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
    
    // Se validazione completata e accesso negato, mostra messaggio con debug
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">⛔ Accesso Negato</h1>
          <p className="text-gray-400 mb-4">Solo gli amministratori possono accedere a questa pagina</p>
          
          {/* DEBUG INFO per troubleshooting */}
          <div className="text-xs text-white/50 p-3 bg-black/30 rounded border border-white/10 mb-4">
            <strong>DEBUG INFO:</strong><br />
            User: {user?.email || 'NON_AUTENTICATO'}<br />
            Required: wikus77@hotmail.it<br />
            Reason: {accessDeniedReason}<br />
            Authenticated: {String(!!user)}
          </div>
          
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

  if (currentView === 'mission-reset' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
              <h1 className="text-2xl font-bold text-white">Reset Missione</h1>
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
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
              <h1 className="text-2xl font-bold text-white">Configura Missione</h1>
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
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
              <h1 className="text-2xl font-bold text-white">🧿 Marker Buzz Control</h1>
              <p className="text-gray-400">Gestione, generazione e statistiche Marker Buzz™</p>
            </div>
            <QRControlPanel />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'debug-test' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
              <h1 className="text-2xl font-bold text-white">🧪 OneSignal Debug Test</h1>
              <p className="text-gray-400">Test diretto API OneSignal - Emergenza</p>
            </div>
            <OneSignalRegistration />
            <EdgeFunctionTester />
            <M1ssionDebugTest />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'push-test-form' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
              <h1 className="text-2xl font-bold text-white">🔥 Firebase Push Test Custom</h1>
              <p className="text-gray-400">Test personalizzato Firebase FCM notifiche push</p>
            </div>
            <div className="space-y-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2">🔥 FIREBASE FCM TOKEN GENERATOR</h2>
                <p className="text-gray-400 text-sm">Genera un token FCM e salvalo nel database per testare le notifiche</p>
              </div>
        <FCMTokenGenerator />
        
        {/* Complete FCM Test Suite */}
        <FCMCompleteTestSuite />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'firebase-debug-test' && hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
        <UnifiedHeader profileImage={profileImage} />
        <div 
          className="px-4 py-8"
          style={{ 
            paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Torna al Panel
              </button>
              <h1 className="text-2xl font-bold text-white">🔥 Firebase Debug Test</h1>
              <p className="text-gray-400">Test completo Firebase FCM con debug avanzato</p>
            </div>
            <M1ssionFirebasePushTestPanel />
          </div>
        </div>
      </div>
    );
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
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Imposta Missione™</h3>
                      <p className="text-gray-400 text-sm">Configura manualmente i parametri missione</p>
                    </div>
                  </div>
                </motion.div>

                {/* 🧿 QR BUZZ CONTROL PANEL - Admin Only */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('qr-control')}
                  className="glass-card p-4 border border-cyan-500/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">🧿 Marker Buzz Control</h3>
                      <p className="text-gray-400 text-sm">Gestione, generazione e statistiche Marker Buzz™</p>
                    </div>
                  </div>
                </motion.div>

                {/* 🚀 PUSH TEST FORM - Push Test Personalizzato */}
                {user?.email === 'wikus77@hotmail.it' && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView('push-test-form')}
                    className="glass-card p-4 border border-blue-500/30 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">🔥 Firebase Push Test Custom</h3>
                        <p className="text-gray-400 text-sm">Test personalizzato Firebase FCM con messaggio custom</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                 {/* 🔥 FIREBASE PUSH TEST QUICK - Solo per Admin AG-X0197 */}
                {user?.email === 'wikus77@hotmail.it' && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      console.log('[FIREBASE-PUSH-TEST] Inizio test → utente:', user?.id);
                      
                      if (!user?.id) {
                        toast.error('❌ FIREBASE-PUSH-TEST: Utente non autenticato');
                        return;
                      }
                      
                      if (user?.email !== 'wikus77@hotmail.it') {
                        toast.error('❌ FIREBASE-PUSH-TEST: Accesso negato - non admin');
                        return;
                      }
                      
                      try {
                        // Use Firebase Edge Function with quick test payload
                        const testPayload = {
                          user_id: user.id,
                          title: `🔥 M1SSION™ Test Completo ${Date.now()}`,
                          body: `Test notifica avanzato Firebase FCM - ${new Date().toLocaleTimeString()}`,
                          broadcast: false
                        };

                        console.log('[FIREBASE-PUSH-TEST] Payload:', testPayload);

                        const { data, error } = await supabase.functions.invoke('send-firebase-push', {
                          body: testPayload
                        });
                        
                        console.log('[FIREBASE-PUSH-TEST] Risposta funzione:', { data, error });
                        
                        if (error) {
                          console.error('[FIREBASE-PUSH-TEST] Errore:', error);
                          toast.error(`❌ Firebase Push Test fallito: ${error.message}`);
                        } else {
                          console.log('[FIREBASE-PUSH-TEST] Successo:', data);
                          toast.success(`✅ Firebase Push Test inviato!`, {
                            description: `Status: ${data?.success ? 'SUCCESS' : 'FAILED'} | Sent: ${data?.sent_count || 0}`
                          });
                        }
                      } catch (err) {
                        console.error('[FIREBASE-PUSH-TEST] Eccezione:', err);
                        toast.error('❌ Firebase Push Test: Errore di connessione');
                      }
                    }}
                    className="glass-card p-4 border border-orange-500/30 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">🔥 Firebase Push Test Quick</h3>
                        <p className="text-gray-400 text-sm">Test veloce Firebase FCM predefinito</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🔥 FIREBASE DEBUG TEST - Admin Only per Debug Avanzato */}
                {user?.email === 'wikus77@hotmail.it' && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView('firebase-debug-test')}
                    className="glass-card p-4 border border-cyan-500/30 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        🔥
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">🔥 Firebase Debug Test</h3>
                        <p className="text-gray-400 text-sm">Test completo Firebase FCM con debug</p>
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