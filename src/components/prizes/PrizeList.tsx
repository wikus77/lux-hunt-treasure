// M1SSION™ - Prize List Component for iOS Capacitor
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Calendar, Star, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { PrizeClueModal } from './PrizeClueModal';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';

interface Prize {
  id: string;
  name: string;
  description: string;
  location_address: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  lat: number;
  lng: number;
  area_radius_m: number;
  image_url?: string;
  clue_count?: number;
  unlocked_clues?: number;
}

export const PrizeList: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { vibrate } = useCapacitorHardware();

  // Load prizes with clue information
  const loadPrizes = preserveFunctionName(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch active prizes with clue counts
      const { data: prizesData, error: prizesError } = await supabase
        .from('prizes')
        .select(`
          *,
          prize_clues!inner(count)
        `)
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (prizesError) {
        console.error('Error loading prizes:', prizesError);
        setError('Errore nel caricamento dei premi');
        return;
      }

      // Get user clues for these prizes
      const prizeIds = prizesData?.map(p => p.id) || [];
      
      // Get all clues for these prizes first
      const { data: allClues } = await supabase
        .from('prize_clues')
        .select('id, prize_id')
        .in('prize_id', prizeIds);

      const clueIds = allClues?.map(c => c.id) || [];

      // Get user's unlocked clues
      const { data: userClues } = await supabase
        .from('user_clues')
        .select('clue_id')
        .eq('user_id', user.id)
        .in('clue_id', clueIds);

      const unlockedClueIds = new Set(userClues?.map(uc => uc.clue_id) || []);

      // Create a map of prize_id to unlocked clue count
      const clueCountMap = new Map();
      allClues?.forEach(clue => {
        if (unlockedClueIds.has(clue.id)) {
          clueCountMap.set(clue.prize_id, (clueCountMap.get(clue.prize_id) || 0) + 1);
        }
      });

      // Combine data
      const enrichedPrizes = prizesData?.map(prize => ({
        ...prize,
        clue_count: prize.prize_clues?.length || 0,
        unlocked_clues: clueCountMap.get(prize.id) || 0
      })) || [];

      setPrizes(enrichedPrizes);
    } catch (err) {
      console.error('Error in loadPrizes:', err);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  }, 'loadPrizes');

  useEffect(() => {
    loadPrizes();
  }, [user]);

  // Handle prize selection with haptic feedback
  const handlePrizeSelect = preserveFunctionName(async (prize: Prize) => {
    await vibrate(30);
    setSelectedPrize(prize);
  }, 'handlePrizeSelect');

  // Calculate progress percentage
  const getProgress = (prize: Prize) => {
    if (!prize.clue_count) return 0;
    return Math.round((prize.unlocked_clues || 0) / prize.clue_count * 100);
  };

  // Get status badge
  const getStatusBadge = (prize: Prize) => {
    const progress = getProgress(prize);
    if (progress === 100) {
      return <Badge className="bg-green-500 text-white">Completato</Badge>;
    } else if (progress > 0) {
      return <Badge className="bg-yellow-500 text-black">In Corso</Badge>;
    } else {
      return <Badge variant="outline">Bloccato</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-400 mb-4">⚠️ {error}</div>
        <Button onClick={loadPrizes} variant="outline">
          Riprova
        </Button>
      </div>
    );
  }

  if (prizes.length === 0) {
    return (
      <div className="text-center p-8">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold mb-2">Nessun Premio Disponibile</h3>
        <p className="text-gray-400">
          Al momento non ci sono premi attivi. Torna più tardi!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Premi Disponibili
          </h2>
          <p className="text-gray-400">
            Sblocca gli indizi per vincere premi incredibili
          </p>
        </motion.div>

        {prizes.map((prize, index) => {
          const progress = getProgress(prize);
          const isLocked = progress === 0;
          
          return (
            <motion.div
              key={prize.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isLocked ? 'opacity-75' : ''
                }`}
                onClick={() => handlePrizeSelect(prize)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        {isLocked ? (
                          <Lock className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Unlock className="w-5 h-5 text-[#00D1FF]" />
                        )}
                        {prize.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(prize)}
                        <Badge variant="outline" className="text-xs">
                          {prize.unlocked_clues || 0}/{prize.clue_count || 0} indizi
                        </Badge>
                      </div>
                    </div>
                    <Trophy className={`w-8 h-8 ${
                      progress === 100 ? 'text-yellow-400' : 'text-gray-600'
                    }`} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progresso</span>
                      <span className="text-[#00D1FF]">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {prize.description}
                  </p>

                  {/* Location and Date */}
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{prize.location_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(prize.start_date).toLocaleDateString('it-IT')} - {' '}
                        {new Date(prize.end_date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-4"
                    variant={isLocked ? "outline" : "default"}
                    disabled={isLocked}
                  >
                    {isLocked ? 'Bloccato' : progress === 100 ? 'Richiedi Premio' : 'Visualizza Indizi'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Prize Detail Modal */}
      {selectedPrize && (
        <PrizeClueModal
          prize={selectedPrize}
          open={!!selectedPrize}
          onOpenChange={(open) => !open && setSelectedPrize(null)}
          onClueUnlocked={loadPrizes}
        />
      )}
    </>
  );
};

export default PrizeList;