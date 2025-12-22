// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Bottone per iscriversi alla Missione del Mese
// V2: Usa store globale per Mission Start Sequence (risolve problema portal)

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

export const StartMissionButton: React.FC = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const { isEnrolled, isLoading: enrollmentLoading } = useActiveMissionEnrollment();
  
  // 🆕 Usa store globale per la sequenza (renderizzata in App.tsx, NON nel portal)
  const triggerMissionIntro = useEntityOverlayStore((s) => s.triggerMissionIntro);

  // Show "ON M1SSION" if enrolled, loading state if checking
  if (enrollmentLoading) {
    return (
      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#00D1FF]/5 border border-[#00D1FF]/20">
        <div className="animate-spin rounded-full h-3 w-3 border border-[#00D1FF] border-t-transparent mr-2" />
        <span className="text-xs font-orbitron font-semibold text-[#00D1FF]/60 uppercase tracking-wider">
          Verifica...
        </span>
      </div>
    );
  }
  
  // Show "ON M1SSION" badge when enrolled
  if (isEnrolled) {
    return (
      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/40">
        <span className="text-xs font-orbitron font-bold text-[#00FF88] uppercase tracking-wider">
          ON M1SSION
        </span>
      </div>
    );
  }

  const handleStartMission = async () => {
    setIsLoading(true);

    try {
      // Step 1: Se utente non autenticato, esegui signInAnonymously
      let currentUser = user;
      if (!currentUser) {
        console.log('🔐 [START-MISSION] User not authenticated, signing in anonymously...');
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.error('❌ [START-MISSION] Anonymous sign-in error:', error);
          toast.error('Ops, riprova tra poco.', {
            description: 'Impossibile autenticarti automaticamente.',
          });
          setIsLoading(false);
          return;
        }

        currentUser = data?.user ?? null;
        console.log('✅ [START-MISSION] Anonymous sign-in success:', currentUser?.id);
      }

      if (!currentUser) {
        toast.error('Ops, riprova tra poco.', {
          description: 'Sessione non valida.',
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Chiama l'Edge Function per iscriversi alla missione
      console.log('🚀 [START-MISSION] Calling enroll-mission-of-the-month...');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast.error('Ops, riprova tra poco.', {
          description: 'Token di autenticazione non disponibile.',
        });
        setIsLoading(false);
        return;
      }

      const response = await supabase.functions.invoke('enroll-mission-of-the-month', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.error) {
        console.error('❌ [START-MISSION] Edge function error:', response.error);
        toast.error('Ops, riprova tra poco.', {
          description: 'Impossibile iscriverti alla missione.',
        });
        setIsLoading(false);
        return;
      }

      const result = response.data;
      if (!result?.ok) {
        toast.error('Ops, riprova tra poco.', {
          description: result?.error || 'Errore sconosciuto.',
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ [START-MISSION] Enrollment success:', result.mission_id);

      // 🆕 CRITICAL FIX V2: Usa store globale per la sequenza (fuori dal portal!)
      // Questo risolve il problema del portal che bloccava il rendering fullscreen
      console.log('🎬 [START-MISSION] Triggering Mission Start Sequence via store...');
      triggerMissionIntro(result.mission_id);

      // Salva in localStorage per persistence (silenzioso)
      try { localStorage.setItem('m1_mission_enrolled', '1'); } catch (_) {}

      // Toast di conferma
      toast.success('Sei dentro! Missione del mese attivata.', {
        description: 'Preparati per l\'avventura! 🎯',
      });

      // Notifica enrollment DOPO aver triggerato la sequenza
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mission:enrolled', { detail: { missionId: result.mission_id } }));
      }, 100);
    } catch (err) {
      console.error('❌ [START-MISSION] Unexpected error:', err);
      toast.error('Ops, riprova tra poco.', {
        description: 'Errore imprevisto.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleStartMission}
      disabled={isLoading}
      data-onboarding="start-mission"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 hover:bg-[#00D1FF]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={!isLoading ? { scale: 1.05 } : {}}
      whileTap={!isLoading ? { scale: 0.95 } : {}}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border border-[#00D1FF] border-t-transparent mr-2" />
          <span className="text-xs font-orbitron font-semibold text-[#00D1FF] uppercase tracking-wider">
            Caricamento...
          </span>
        </>
      ) : (
        <span className="text-xs font-orbitron font-semibold text-[#00D1FF] uppercase tracking-wider">
          START M1SSION
        </span>
      )}
    </motion.button>
  );
};
