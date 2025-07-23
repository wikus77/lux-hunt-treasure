// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDailySpin } from '@/hooks/useDailySpin';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { DailySpinHeader } from './DailySpinHeader';
import { DailySpin3DWheel } from './DailySpin3DWheel';
import { DailySpinButton } from './DailySpinButton';
import { DailySpinResultModal } from './DailySpinResultModal';
import { getCosmeticSegment, SEGMENTS, getMessageFromRotation } from '@/utils/dailySpinUtils';

export const DailySpinWheel: React.FC = () => {
  const [, setLocation] = useLocation();
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wheelSize, setWheelSize] = useState(400);
  const { spinWheel, isSpinning, error } = useDailySpin();
  const { user, session } = useUnifiedAuth();
  const [cosmeticResult, setCosmeticResult] = useState<any>(null);

  const handleSpin = async () => {
    if (isSpinning || isAnimating) return;

    setIsAnimating(true);
    setShowResult(false);
    
    // COSMETIC ONLY: Fixed segment for visual experience
    const cosmeticSegment = getCosmeticSegment();
    const segmentAngle = 360 / 12; // 30 gradi per segmento
    const targetAngle = (cosmeticSegment * segmentAngle) + (segmentAngle / 2);
    
    // Fixed animation for consistent experience (4 complete spins)
    const extraSpins = 4 * 360; // Fixed 4 spins instead of random
    const finalRotation = extraSpins + (360 - targetAngle);
    
    setRotation(prev => prev + finalRotation);
    
    // COSMETIC: Show message without prize award
    const message = getMessageFromRotation(finalRotation);
    
    // Simulate result for visual feedback only - NO PRIZES
    const newCosmeticResult = {
      success: true,
      prize: message,
      rotation_deg: finalRotation,
      message: "Grazie per aver partecipato! Continua la missione per vincere premi reali basati sulla tua abilità.",
      reroute_path: "/home"
    };

    // 🔥 REGISTRA IMMEDIATAMENTE che l'utente ha giocato oggi nel database
    try {
      if (user && session) {
        console.log('🎰 SALVATAGGIO IMMEDIATO Daily Spin nel database...');
        const today = new Date().toISOString().split('T')[0];
        
        const { error: logError } = await supabase
          .from('daily_spin_logs')
          .insert({
            user_id: user.id,
            date: today,
            prize: message,
            rotation_deg: finalRotation
          });
          
        if (logError) {
          console.error('❌ Errore salvataggio daily spin:', logError);
        } else {
          console.log('✅ Daily Spin registrato con successo nel database');
          
          // 🔥 SALVA ANCHE IN LOCALSTORAGE come backup per IMMEDIATA prevenzione loop
          localStorage.setItem(`daily_spin_${user.id}_${today}`, 'true');
          console.log('✅ Daily Spin salvato anche in localStorage per prevenzione loop');
        }
      }
    } catch (error) {
      console.error('❌ Errore durante il salvataggio Daily Spin:', error);
    }
    
    // Fine animazione dopo 4 secondi con REDIRECT FORZATO MULTIPLO BLINDATO
    setTimeout(() => {
      setIsAnimating(false);
      setShowResult(true);
      setCosmeticResult(newCosmeticResult);
      
      console.log('[SPIN-REDIRECT] Iniziando redirect forzato multiplo PWA-safe');
      
      // 🔥 REDIRECT FORZATO IMMEDIATO - Strategia multipla per massima compatibilità
      const executeRedirects = () => {
        let redirectCompleted = false;
        
        // Strategia 1: Wouter setLocation (primaria)
        setTimeout(() => {
          if (!redirectCompleted && window.location.pathname.includes('/daily-spin')) {
            console.log('[SPIN-REDIRECT] Tentativo 1: wouter setLocation');
            setLocation('/home');
            
            // Verifica se ha funzionato
            setTimeout(() => {
              if (window.location.pathname.includes('/daily-spin')) {
                console.log('[SPIN-REDIRECT] Wouter fallito, continuando...');
              } else {
                redirectCompleted = true;
                console.log('[SPIN-REDIRECT] ✅ Wouter riuscito');
              }
            }, 100);
          }
        }, 100);
        
        // Strategia 2: window.location.href (PWA iOS Safari)
        setTimeout(() => {
          if (!redirectCompleted && window.location.pathname.includes('/daily-spin')) {
            console.log('[SPIN-REDIRECT] Tentativo 2: window.location.href');
            window.location.href = '/home';
            redirectCompleted = true;
          }
        }, 500);
        
        // Strategia 3: window.location.replace (emergenza)
        setTimeout(() => {
          if (!redirectCompleted && window.location.pathname.includes('/daily-spin')) {
            console.log('[SPIN-REDIRECT] Tentativo 3: window.location.replace');
            window.location.replace('/home');
            redirectCompleted = true;
          }
        }, 1000);
        
        // Strategia 4: Alert + reload (ultimo resort)
        setTimeout(() => {
          if (!redirectCompleted && window.location.pathname.includes('/daily-spin')) {
            console.log('[SPIN-REDIRECT] Tentativo 4: alert + reload');
            alert('Accesso completato. Stiamo caricando la tua esperienza...');
            window.location.replace('/home');
          }
        }, 1500);
      };
      
      executeRedirects();
    }, 4000);
  };

  const handleRedirect = () => {
    console.log('🚀 DailySpinWheel: handleRedirect chiamato - FORZANDO redirect multiplo');
    
    // Metodo primario
    setLocation('/home');
    
    // Fallback per PWA
    setTimeout(() => {
      if (window.location.pathname.includes('/daily-spin')) {
        window.location.href = '/home';
      }
    }, 300);
  };

  const handleCloseModal = () => {
    console.log('🚀 DailySpinWheel: handleCloseModal chiamato - FORZANDO redirect multiplo');
    setShowResult(false);
    
    // Metodo primario
    setLocation('/home');
    
    // Fallback per PWA
    setTimeout(() => {
      if (window.location.pathname.includes('/daily-spin')) {
        window.location.href = '/home';
      }
    }, 300);
  };

  // Handle responsive wheel size
  useEffect(() => {
    const updateSize = () => {
      setWheelSize(window.innerWidth < 768 ? 350 : 400);
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 🔥 AUTO-REDIRECT EFFECT POTENZIATO - Forzato e immediato per prevenire blocchi
  useEffect(() => {
    if (cosmeticResult && showResult) {
      console.log('🚀 DailySpinWheel: AUTO-REDIRECT TIMER ATTIVATO (1s)');
      
      // 🚀 REDIRECT IMMEDIATO MULTIPLO
      const timer = setTimeout(() => {
        console.log('🚀 DailySpinWheel: AUTO-REDIRECT TIMER TRIGGERED - FORZANDO redirect a /home');
        
        // Primary redirect
        setLocation('/home');
        
        // PWA iOS Safari fallback
        setTimeout(() => {
          if (window.location.pathname.includes('/daily-spin')) {
            console.log('🔄 PWA Fallback: window.location.href = /home');
            window.location.href = '/home';
          }
        }, 100);
        
        // Emergency fallback
        setTimeout(() => {
          if (window.location.pathname.includes('/daily-spin')) {
            console.log('🔄 Emergency Fallback: window.location.replace = /home');
            window.location.replace('/home');
          }
        }, 300);
        
        // Ultimate fallback with alert
        setTimeout(() => {
          if (window.location.pathname.includes('/daily-spin')) {
            alert('Accesso completato. Stiamo caricando la tua esperienza...');
            window.location.replace('/home');
          }
        }, 1000);
      }, 1000); // 🔥 Ridotto a 1 secondo per redirect più veloce
      
      return () => {
        console.log('🚀 DailySpinWheel: clearing auto-redirect timer');
        clearTimeout(timer);
      };
    }
  }, [cosmeticResult, showResult, setLocation]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Floating Particles - FIXED POSITIONS for compliance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-float-particle"
            style={{
              left: `${(i * 15) % 100}%`, // Fixed positions based on index
              top: `${(i * 20) % 100}%`,  // Fixed positions based on index
              animationDelay: `${i * 2}s`,
              animationDuration: `${10 + i * 2}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        
        {/* Header */}
        <DailySpinHeader />
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm text-center max-w-md">
            <div className="text-red-400 text-lg font-semibold mb-2">Errore</div>
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {/* 3D Wheel */}
        <div className="mb-8">
          <DailySpin3DWheel 
            rotation={rotation}
            isAnimating={isAnimating}
            size={wheelSize}
          />
        </div>
        
        {/* Spin Button */}
        <DailySpinButton
          isSpinning={isSpinning}
          isAnimating={isAnimating}
          hasError={!!error}
          onSpin={handleSpin}
        />
        
        {/* Result Modal */}
        {cosmeticResult && (
          <DailySpinResultModal
            isOpen={showResult}
            prize={cosmeticResult.prize}
            message={cosmeticResult.message}
            reroute_path={cosmeticResult.reroute_path}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};