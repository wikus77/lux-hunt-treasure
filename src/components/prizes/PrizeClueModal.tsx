// M1SSION™ - Prize Clue Modal Component for iOS Capacitor
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Eye, 
  EyeOff, 
  Star, 
  Lock, 
  Unlock, 
  Gift,
  X,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';
import { ClueDetail } from './ClueDetail';

interface Prize {
  id: string;
  name: string;
  description: string;
  location_address: string;
  start_date: string;
  end_date: string;
  lat: number;
  lng: number;
  area_radius_m: number;
  image_url?: string;
  clue_count?: number;
  unlocked_clues?: number;
}

interface Clue {
  id: string;
  title_it: string;
  description_it: string;
  week: number;
  clue_type: string;
  is_unlocked: boolean;
  unlock_cost?: number;
}

interface PrizeClueModalProps {
  prize: Prize;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClueUnlocked: () => void;
}

export const PrizeClueModal: React.FC<PrizeClueModalProps> = ({
  prize,
  open,
  onOpenChange,
  onClueUnlocked
}) => {
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const [unlockingClue, setUnlockingClue] = useState<string | null>(null);
  const { user } = useAuth();
  const { vibrate } = useCapacitorHardware();

  // Load clues for this prize
  const loadClues = preserveFunctionName(async () => {
    if (!user || !prize?.id) return;

    try {
      setLoading(true);

      // Get all clues for this prize
      const { data: prizeClues, error: cluesError } = await supabase
        .from('prize_clues')
        .select('*')
        .eq('prize_id', prize.id)
        .order('week', { ascending: true });

      if (cluesError) {
        console.error('Error loading clues:', cluesError);
        return;
      }

      // Get user's unlocked clues
      const clueIds = prizeClues?.map(c => c.id) || [];
      const { data: userClues } = await supabase
        .from('user_clues')
        .select('clue_id')
        .eq('user_id', user.id)
        .in('clue_id', clueIds);

      const unlockedClueIds = new Set(userClues?.map(uc => uc.clue_id) || []);

      // Combine data
      const enrichedClues = prizeClues?.map(clue => ({
        ...clue,
        is_unlocked: unlockedClueIds.has(clue.id),
        unlock_cost: getUnlockCost(clue.clue_type)
      })) || [];

      setClues(enrichedClues);
    } catch (err) {
      console.error('Error loading clues:', err);
      toast.error('Errore nel caricamento degli indizi');
    } finally {
      setLoading(false);
    }
  }, 'loadClues');

  // Get unlock cost based on clue type
  const getUnlockCost = (clueType: string): number => {
    switch (clueType) {
      case 'precise': return 50;
      case 'medium': return 30;
      case 'vague': return 10;
      default: return 20;
    }
  };

  // Unlock a clue
  const unlockClue = preserveFunctionName(async (clue: Clue) => {
    if (!user || unlockingClue) return;

    try {
      setUnlockingClue(clue.id);
      await vibrate(50);

      // Check user's credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      const userCredits = profile?.credits || 0;
      const cost = clue.unlock_cost || 20;

      if (userCredits < cost) {
        toast.error(`Crediti insufficienti. Servono ${cost} crediti.`);
        return;
      }

      // Call the buzz press handler (reusing existing logic)
      const response = await fetch('/api/handle-buzz-press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          action: 'unlock_clue',
          clue_id: clue.id,
          cost: cost
        })
      });

      if (!response.ok) {
        throw new Error('Errore nel sblocco dell\'indizio');
      }

      // Add to user clues
      const { error: insertError } = await supabase
        .from('user_clues')
        .insert({
          user_id: user.id,
          clue_id: clue.id,
          title_it: clue.title_it,
          description_it: clue.description_it,
          clue_type: clue.clue_type,
          buzz_cost: cost
        });

      if (insertError) {
        console.error('Error inserting user clue:', insertError);
        toast.error('Errore nel salvataggio dell\'indizio');
        return;
      }

      // Update UI
      setClues(prev => prev.map(c => 
        c.id === clue.id ? { ...c, is_unlocked: true } : c
      ));

      toast.success(`Indizio sbloccato! Costato ${cost} crediti.`);
      onClueUnlocked();

      // Show clue detail
      setSelectedClue({ ...clue, is_unlocked: true });

    } catch (err) {
      console.error('Error unlocking clue:', err);
      toast.error('Errore nel sblocco dell\'indizio');
    } finally {
      setUnlockingClue(null);
    }
  }, 'unlockClue');

  // Handle clue selection
  const handleClueSelect = preserveFunctionName(async (clue: Clue) => {
    await vibrate(30);
    
    if (clue.is_unlocked) {
      setSelectedClue(clue);
    } else {
      // Show unlock confirmation
      await unlockClue(clue);
    }
  }, 'handleClueSelect');

  useEffect(() => {
    if (open && prize) {
      loadClues();
    }
  }, [open, prize]);

  const progress = prize.clue_count ? Math.round((prize.unlocked_clues || 0) / prize.clue_count * 100) : 0;
  const isCompleted = progress === 100;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Trophy className={`w-6 h-6 ${isCompleted ? 'text-yellow-400' : 'text-[#00D1FF]'}`} />
              {prize.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Prize Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={isCompleted ? 'bg-green-500' : 'bg-yellow-500'}>
                  {isCompleted ? 'Completato' : 'In Corso'}
                </Badge>
                <span className="text-[#00D1FF] font-semibold">
                  {progress}% completato
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>

              <p className="text-gray-300 text-sm">
                {prize.description}
              </p>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{prize.location_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(prize.start_date).toLocaleDateString('it-IT')} - {' '}
                    {new Date(prize.end_date).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>
            </div>

            {/* Clues List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F059FF]" />
                Indizi Disponibili
              </h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-[#00D1FF] border-t-transparent rounded-full"
                  />
                </div>
              ) : clues.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Nessun indizio disponibile
                </div>
              ) : (
                <div className="space-y-3">
                  {clues.map((clue, index) => (
                    <motion.div
                      key={clue.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          clue.is_unlocked 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-gray-800/50 border-gray-600/30'
                        }`}
                        onClick={() => handleClueSelect(clue)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {clue.is_unlocked ? (
                                  <Unlock className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="font-medium text-white">
                                  {clue.is_unlocked ? clue.title_it : 'Indizio Bloccato'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Settimana {clue.week}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    clue.clue_type === 'precise' ? 'text-red-400' :
                                    clue.clue_type === 'medium' ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`}
                                >
                                  {clue.clue_type === 'precise' ? 'Preciso' :
                                   clue.clue_type === 'medium' ? 'Medio' : 'Vago'}
                                </Badge>
                                {!clue.is_unlocked && (
                                  <Badge className="bg-[#F059FF] text-white text-xs">
                                    {clue.unlock_cost} crediti
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="ml-4">
                              {clue.is_unlocked ? (
                                <Eye className="w-5 h-5 text-green-400" />
                              ) : unlockingClue === clue.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-5 h-5 border-2 border-[#F059FF] border-t-transparent rounded-full"
                                />
                              ) : (
                                <EyeOff className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            {isCompleted && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pt-4 border-t border-gray-700"
              >
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                  <Gift className="w-5 h-5 mr-2" />
                  Richiedi Premio
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Clue Detail Modal */}
      {selectedClue && (
        <ClueDetail
          clue={selectedClue}
          open={!!selectedClue}
          onOpenChange={(open) => !open && setSelectedClue(null)}
        />
      )}
    </>
  );
};

export default PrizeClueModal;