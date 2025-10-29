// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useDNA } from '@/hooks/useDNA';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { DNAHub } from '@/features/dna/DNAHub';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/**
 * DNA Page - Full-screen DNA Hub
 * 
 * Main route for viewing and managing agent DNA.
 * Loads DNA profile and event history from Supabase.
 */
const DNAPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  const { dnaProfile, isLoading: dnaLoading } = useDNA();
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const user = getCurrentUser();

  // Redirect if not authenticated
  useEffect(() => {
    if (!dnaLoading && !isAuthenticated) {
      toast.error('Accesso negato', {
        description: 'Devi essere autenticato per visualizzare il DNA'
      });
      setLocation('/');
    }
  }, [isAuthenticated, dnaLoading, setLocation]);

  // Load DNA events
  useEffect(() => {
    const loadEvents = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('agent_dna_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        setEvents(data || []);
      } catch (error) {
        console.error('[DNA] Error loading events:', error);
        toast.error('Errore nel caricamento della storia DNA');
      } finally {
        setEventsLoading(false);
      }
    };

    if (user?.id) {
      loadEvents();
    }
  }, [user?.id]);

  // Subscribe to realtime DNA updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dna-updates:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_dna',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.info('[DNA] Realtime update received', payload);
          toast.success('DNA aggiornato!', {
            description: 'Il tuo profilo genetico è stato modificato'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_dna_events',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.info('[DNA] New event received', payload);
          setEvents(prev => [payload.new as any, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleEvolve = async () => {
    if (!user?.id) return;

    try {
      // Simulate a DNA mutation (in real app, this would be triggered by actions)
      const delta = {
        intuito: Math.floor(Math.random() * 10) - 5,
        audacia: Math.floor(Math.random() * 10) - 5,
        etica: Math.floor(Math.random() * 10) - 5,
        rischio: Math.floor(Math.random() * 10) - 5,
        vibrazione: Math.floor(Math.random() * 10) - 5
      };

      const { error } = await supabase.rpc('fn_dna_apply_delta', {
        p_user: user.id,
        p_delta: delta,
        p_source: 'manual_evolution',
        p_note: 'Evoluzione manuale attivata dall\'hub DNA'
      });

      if (error) throw error;

      toast.success('Evoluzione completata!', {
        description: 'Il tuo DNA è stato modificato'
      });
    } catch (error) {
      console.error('[DNA] Evolution error:', error);
      toast.error('Errore durante l\'evoluzione');
    }
  };

  // Loading state
  if (dnaLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <p className="text-white/60">Caricamento DNA...</p>
        </div>
      </div>
    );
  }

  // No DNA profile state
  if (!dnaProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="text-6xl mb-4">🧬</div>
          <h2 className="text-2xl font-bold text-white">DNA Non Calibrato</h2>
          <p className="text-white/60">
            Completa il primo sequenziamento genetico per visualizzare il tuo DNA
          </p>
          <button
            onClick={() => setLocation('/')}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Back Button - Sticky top-left with safe-area support */}
      <motion.button
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            setLocation('/home');
          }
        }}
        className="fixed top-4 left-4 z-50 w-11 h-11 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-lg flex items-center justify-center hover:bg-background/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          left: 'max(1rem, env(safe-area-inset-left))'
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Torna indietro"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </motion.button>

      <DNAHub 
        dnaProfile={dnaProfile} 
        events={events}
        onEvolve={handleEvolve}
      />
    </div>
  );
};

export default DNAPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
