
// M1SSION™ – Buzz.tsx corretto da Lovable AI su richiesta Joseph Mulé
// 🔐 Certificato JLENIA – Capacitor iOS READY – SHA aggiornato – UI verificata su iPhone
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  Clock, 
  TrendingUp, 
  History,
  Target,
  Circle,
  CheckCircle,
  AlertCircle,
  Euro,
  Calendar,
  Loader2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useEnhancedNavigation } from '@/hooks/useEnhancedNavigation';
import { supabase } from '@/integrations/supabase/client';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';

interface BuzzStats {
  today_count: number;
  total_count: number;
  areas_unlocked: number;
  credits_spent: number;
}

interface BuzzHistory {
  id: string;
  created_at: string;
  cost_eur: number;
  radius_generated: number;
  clue_count: number;
}

export const Buzz: React.FC = () => {
  const [stats, setStats] = useState<BuzzStats | null>(null);
  const [history, setHistory] = useState<BuzzHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [buzzing, setBuzzing] = useState(false);
  const { user } = useAuth();
  const { toMap } = useEnhancedNavigation();
  const { vibrate } = useCapacitorHardware();

  // Load BUZZ statistics
  const loadBuzzStats = preserveFunctionName(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get today's buzz count
      const { data: todayData } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      // Get total buzz count
      const { data: totalData } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', user.id);

      // Get buzz map actions for history and credits
      const { data: mapActions } = await supabase
        .from('buzz_map_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get areas unlocked
      const { data: areasData } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', user.id);

      const today_count = todayData?.buzz_count || 0;
      const total_count = totalData?.reduce((sum, day) => sum + day.buzz_count, 0) || 0;
      const areas_unlocked = areasData?.length || 0;
      const credits_spent = mapActions?.reduce((sum, action) => sum + Number(action.cost_eur), 0) || 0;

      setStats({
        today_count,
        total_count,
        areas_unlocked,
        credits_spent
      });

      setHistory(mapActions || []);

    } catch (err) {
      console.error('Error loading buzz stats:', err);
      toast.error('Errore nel caricamento statistiche BUZZ');
    } finally {
      setLoading(false);
    }
  }, 'loadBuzzStats');

  useEffect(() => {
    loadBuzzStats();
  }, [user]);

  // Handle BUZZ action with complete logic + debug
  const handleBuzz = preserveFunctionName(async () => {
    console.log('🚀 BUZZ PRESSED - Start handleBuzz', { user: !!user, stats: !!stats });
    
    if (!user || !stats) {
      console.log('❌ BUZZ FAILED - Missing user or stats', { user: !!user, stats: !!stats });
      toast.error('Dati utente non caricati. Riprova.');
      return;
    }
    
    try {
      setBuzzing(true);
      await vibrate(100);
      
      const currentPrice = getCurrentBuzzPrice(stats.today_count);
      console.log('💰 BUZZ PRICE CHECK', { today_count: stats.today_count, currentPrice });
      
      // Check if blocked
      if (currentPrice === 0) {
        toast.error('BUZZ bloccato per oggi! Limite giornaliero raggiunto.');
        return;
      }
      
      // Check for abuse logs
      const { data: abuseData } = await supabase
        .from('abuse_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'buzz_press')
        .gte('timestamp', new Date(Date.now() - 30000).toISOString());
      
      if (abuseData && abuseData.length >= 5) {
        toast.error('Troppi tentativi. Riprova tra qualche secondo.');
        return;
      }
      
      // Log abuse attempt
      await supabase.from('abuse_logs').insert({
        user_id: user.id,
        event_type: 'buzz_press'
      });
      
      // Call the buzz API with full implementation
      const { data: buzzResult, error: buzzError } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: user.id,
          generateMap: true,
          coordinates: null,
          prizeId: null,
          sessionId: `buzz_${Date.now()}`
        }
      });
      
      if (buzzError) {
        console.error('BUZZ API Error:', buzzError);
        toast.error('Errore di rete. Riprova.');
        return;
      }
      
      if (!buzzResult.success) {
        toast.error(buzzResult.error || 'Errore durante BUZZ');
        return;
      }
      
      // Update buzz counter
      await supabase.rpc('increment_buzz_counter', { p_user_id: user.id });
      
      // Log the buzz action
      await supabase.from('buzz_map_actions').insert({
        user_id: user.id,
        cost_eur: currentPrice,
        clue_count: buzzResult.clueCount || 1,
        radius_generated: buzzResult.mapArea?.radius || 1000
      });
      
      // Refresh stats
      await loadBuzzStats();
      
      // ✅ NOTIFICA FORZATA - IMPLEMENTAZIONE DIRETTA
      toast.success('✅ Nuovo indizio disponibile', {
        duration: 3000,
        position: 'top-center',
        style: { zIndex: 9999 }
      });
      
      // Forza aggiornamento statistiche
      setTimeout(() => {
        loadBuzzStats();
      }, 500);
      
    } catch (err) {
      console.error('Error in handleBuzz:', err);
      toast.error('Errore imprevisto durante BUZZ');
    } finally {
      setBuzzing(false);
    }
  }, 'handleBuzz');

  // Get current buzz price
  const getCurrentBuzzPrice = (dailyCount: number): number => {
    if (dailyCount <= 10) return 1.99;
    if (dailyCount <= 20) return 3.99;
    if (dailyCount <= 30) return 5.99;
    if (dailyCount <= 40) return 7.99;
    if (dailyCount <= 50) return 9.99;
    return 0; // Blocked
  };

  const currentPrice = getCurrentBuzzPrice(stats?.today_count || 0);
  const isBlocked = currentPrice === 0;

  if (loading) {
    return (
      <div className="min-h-screen w-full fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#F059FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative flex flex-col items-center space-y-6"
      >
          
          {/* BUZZ Button - Perfect Center */}
          <Button
            size="lg"
            disabled={isBlocked || buzzing}
            onClick={handleBuzz}
            className={`
              relative w-48 h-48 rounded-full text-2xl font-bold border-4 border-red-500
              shadow-2xl ring-4 transition-all duration-300 z-20
              ${isBlocked 
                ? 'bg-destructive text-destructive-foreground cursor-not-allowed ring-destructive/20' 
                : buzzing
                ? 'bg-primary/80 text-primary-foreground cursor-wait ring-primary/40 scale-95'
                : 'bg-gradient-to-br from-primary via-secondary to-primary text-primary-foreground hover:scale-105 ring-primary/30 hover:ring-primary/50'
              }
            `}
            style={{
              background: isBlocked ? undefined : buzzing ? undefined : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))'
            }}
          >
            {buzzing ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="text-lg font-semibold">BUZZING...</span>
              </div>
            ) : isBlocked ? (
              <div className="flex flex-col items-center space-y-3">
                <X className="w-12 h-12" />
                <span className="text-lg font-semibold">BLOCCATO</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Zap className="w-16 h-16" />
                <span className="text-3xl font-bold">BUZZ</span>
                <div className="text-sm font-medium bg-background/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  €{currentPrice.toFixed(2)}
                </div>
              </div>
            )}
          </Button>
          
          {/* Animated pulse effect */}
          {!isBlocked && !buzzing && (
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1], 
                opacity: [0.6, 0, 0.6] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary z-10"
            />
          )}

          {/* Instruction text below button */}
          <div className="text-center space-y-2 z-30 max-w-md px-4">
            <div className="text-lg text-muted-foreground">
              Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti.
            </div>
            {stats && !isBlocked && (
              <>
                <div className="text-lg text-muted-foreground">
                  BUZZ oggi: <span className="font-bold text-primary">{stats.today_count}/50</span>
                </div>
                {stats.today_count < 50 && (
                  <div className="text-sm text-muted-foreground">
                    Prossimo: <span className="font-semibold">€{getCurrentBuzzPrice(stats.today_count + 1).toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
      </motion.div>
    </div>
  );
};

export default Buzz;
