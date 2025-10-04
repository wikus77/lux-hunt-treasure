// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Bottone per iscriversi alla Missione del Mese

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';

export const StartMissionButton: React.FC = () => {
  const { user } = useAuthContext();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

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

      // Step 3: Successo! Mostra toast e naviga alla mappa
      toast.success('Sei dentro! Missione del mese attivata.', {
        description: 'Preparati per l\'avventura! 🎯',
      });

      setTimeout(() => {
        setLocation('/map');
      }, 800);
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
      className="w-full py-4 px-6 bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] rounded-xl text-white font-orbitron font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-[#00D1FF]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={!isLoading ? { scale: 1.02 } : {}}
      whileTap={!isLoading ? { scale: 0.98 } : {}}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          <span>Iscrizione in corso...</span>
        </>
      ) : (
        <>
          <Rocket size={24} />
          <span>INIZIA MISSIONE</span>
        </>
      )}
    </motion.button>
  );
};
