// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export function DailyCheckInButton() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStreakData();
    }
  }, [user]);

  const loadStreakData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak_days, last_check_in_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentStreak(data.current_streak_days || 0);
        setLastCheckIn(data.last_check_in_date);

        // Check if already checked in today
        const today = new Date().toISOString().split('T')[0];
        setCanCheckIn(data.last_check_in_date !== today);
      }
    } catch (err) {
      console.error('Error loading streak data:', err);
    }
  };

  const handleCheckIn = async () => {
    if (!user || !canCheckIn) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('handle-daily-checkin', {
        body: {}
      });

      if (error) throw error;

      if (data.success) {
        setCurrentStreak(data.newStreak);
        setCanCheckIn(false);
        setLastCheckIn(new Date().toISOString().split('T')[0]);

        toast.success(
          `🔥 Check-in giornaliero completato! Streak: ${data.newStreak} giorni (+${data.xpAwarded} XP)`,
          { duration: 5000 }
        );

        if (data.badgesAwarded && data.badgesAwarded.length > 0) {
          toast.success(`🎖️ Nuovo badge sbloccato: Streak ${data.newStreak} giorni!`, {
            duration: 7000
          });
        }

        if (data.streakBroken) {
          toast.warning('⚠️ La tua streak è stata resettata perché hai saltato un giorno', {
            duration: 5000
          });
        }
      } else {
        toast.error(data.message || 'Errore durante il check-in');
      }
    } catch (err: any) {
      console.error('Error during check-in:', err);
      toast.error(err.message || 'Errore durante il check-in giornaliero');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Flame className="h-5 w-5" />
          <span className="text-lg font-bold">{currentStreak} giorni</span>
        </div>
        <p className="text-xs text-muted-foreground">Streak corrente</p>
      </div>

      <Button
        onClick={handleCheckIn}
        disabled={!canCheckIn || loading}
        className="relative overflow-hidden"
        size="sm"
      >
        {loading ? (
          'Attendere...'
        ) : canCheckIn ? (
          '✓ Check-in Giornaliero'
        ) : (
          '✓ Completato oggi'
        )}
      </Button>

      {!canCheckIn && (
        <p className="text-xs text-muted-foreground">
          Torna domani per continuare la streak!
        </p>
      )}
    </motion.div>
  );
}
