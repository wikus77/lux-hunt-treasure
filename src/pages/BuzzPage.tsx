// M1SSION™ - Buzz Page for iOS Capacitor
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
  Calendar
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

export const BuzzPage: React.FC = () => {
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

  // Handle BUZZ action
  const handleBuzz = preserveFunctionName(async () => {
    try {
      setBuzzing(true);
      await vibrate(100);
      
      // Navigate to map for BUZZ action
      await toMap();
      toast.success('Vai alla mappa per usare BUZZ!');
      
    } catch (err) {
      console.error('Error in handleBuzz:', err);
      toast.error('Errore nell\'azione BUZZ');
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
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#F059FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#F059FF] to-[#00D1FF] rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BUZZ</h1>
        </div>
        <p className="text-gray-400 max-w-md mx-auto">
          Usa BUZZ per sbloccare aree sulla mappa e trovare indizi nascosti
        </p>
      </motion.div>

      {/* BUZZ Button */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="relative">
          <Button
            size="lg"
            disabled={isBlocked || buzzing}
            onClick={handleBuzz}
            className={`
              relative w-32 h-32 rounded-full text-xl font-bold
              ${isBlocked 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#F059FF] to-[#00D1FF] text-white hover:scale-105'
              }
              transition-all duration-300 shadow-lg
            `}
          >
            {buzzing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
              />
            ) : isBlocked ? (
              <>
                <AlertCircle className="w-8 h-8 mb-1" />
                <div className="text-sm">Bloccato</div>
              </>
            ) : (
              <>
                <Zap className="w-8 h-8 mb-1" />
                <div className="text-sm">€{currentPrice}</div>
              </>
            )}
          </Button>
          
          {/* Pulse effect */}
          {!isBlocked && !buzzing && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F059FF] to-[#00D1FF]"
            />
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Circle className="w-8 h-8 mx-auto mb-2 text-[#F059FF]" />
              <div className="text-2xl font-bold text-white">{stats.today_count}</div>
              <div className="text-sm text-gray-400">BUZZ Oggi</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#00D1FF]" />
              <div className="text-2xl font-bold text-white">{stats.total_count}</div>
              <div className="text-sm text-gray-400">BUZZ Totali</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{stats.areas_unlocked}</div>
              <div className="text-sm text-gray-400">Aree Sbloccate</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Euro className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">€{stats.credits_spent.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Speso</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Price Tiers */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#F059FF]" />
              Tariffe BUZZ Giornaliere
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { range: '1-10', price: '€1.99', current: stats?.today_count || 0 <= 10 },
              { range: '11-20', price: '€3.99', current: (stats?.today_count || 0) > 10 && (stats?.today_count || 0) <= 20 },
              { range: '21-30', price: '€5.99', current: (stats?.today_count || 0) > 20 && (stats?.today_count || 0) <= 30 },
              { range: '31-40', price: '€7.99', current: (stats?.today_count || 0) > 30 && (stats?.today_count || 0) <= 40 },
              { range: '41-50', price: '€9.99', current: (stats?.today_count || 0) > 40 && (stats?.today_count || 0) <= 50 },
              { range: '50+', price: 'Bloccato', current: (stats?.today_count || 0) > 50 }
            ].map((tier, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  tier.current 
                    ? 'bg-[#F059FF]/20 border border-[#F059FF]/30' 
                    : 'bg-gray-800/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tier.current ? (
                    <CheckCircle className="w-4 h-4 text-[#F059FF]" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`font-medium ${
                    tier.current ? 'text-white' : 'text-gray-400'
                  }`}>
                    BUZZ {tier.range}
                  </span>
                </div>
                <Badge className={
                  tier.current 
                    ? 'bg-[#F059FF] text-white' 
                    : 'bg-gray-600 text-gray-300'
                }>
                  {tier.price}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent History */}
      {history.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[#00D1FF]" />
                Cronologia Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.slice(0, 5).map((action, index) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F059FF]/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#F059FF]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        Area {action.radius_generated}km
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(action.created_at).toLocaleDateString('it-IT')}
                        <span>•</span>
                        <span>{action.clue_count} indizi</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#F059FF]">
                      €{action.cost_eur.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Navigation Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Button
          variant="outline"
          className="w-full max-w-sm"
          onClick={() => toMap()}
        >
          <MapPin className="w-5 h-5 mr-2" />
          Vai alla Mappa per usare BUZZ
        </Button>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-4"
      >
        <p className="text-sm text-gray-500">
          Il contatore si resetta ogni giorno alle 00:00
        </p>
      </motion.div>
    </div>
  );
};

export default BuzzPage;