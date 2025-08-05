// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useProfileImage } from '@/hooks/useProfileImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Target, Trophy, Crown, RotateCcw, ArrowLeft, History, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface Mission {
  id: string;
  title: string;
  status: string;
  publication_date: string;
}

interface UserClue {
  clue_id: string;
  title_it: string;
  created_at: string;
  clue_type: string;
}

const MissionSettings: React.FC = () => {
  const { user } = useAuth();
  const userRole = 'developer'; // Temporary for demo
  const { toast } = useToast();
  const { navigate } = useWouterNavigation();
  const { profileImage } = useProfileImage();
  const [loading, setLoading] = useState(false);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [completedClues, setCompletedClues] = useState<UserClue[]>([]);

  useEffect(() => {
    loadMissionData();
  }, [user]);

  const loadMissionData = async () => {
    if (!user) return;

    try {
      // Load current mission
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'active')
        .order('publication_date', { ascending: false })
        .limit(1);

      if (missions && missions.length > 0) {
        setCurrentMission(missions[0]);
      }

      // Load completed clues
      const { data: clues } = await supabase
        .from('user_clues')
        .select('clue_id, title_it, created_at, clue_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setCompletedClues(clues || []);
    } catch (error) {
      console.error('Error loading mission data:', error);
    }
  };

  const handleResetProgress = async () => {
    if (!user || userRole !== 'developer') return;

    setLoading(true);
    try {
      // Reset user progress tables
      await Promise.all([
        supabase.from('user_clues').delete().eq('user_id', user.id),
        supabase.from('user_map_areas').delete().eq('user_id', user.id),
        supabase.from('user_buzz_counter').delete().eq('user_id', user.id),
        supabase.from('user_buzz_map').delete().eq('user_id', user.id),
        supabase.from('user_buzz_map_counter').delete().eq('user_id', user.id)
      ]);

      // Reload data
      await loadMissionData();

      toast({
        title: "✅ Progressi azzerati",
        description: "Tutti i progressi dell'utente sono stati azzerati con successo."
      });
    } catch (error) {
      console.error('Reset progress error:', error);
      toast({
        title: "❌ Errore reset",
        description: "Impossibile azzerare i progressi. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMissionStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'Attiva', color: 'bg-green-600' },
      'completed': { label: 'Completata', color: 'bg-blue-600' },
      'draft': { label: 'Bozza', color: 'bg-gray-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen">
      <UnifiedHeader profileImage={profileImage || user?.user_metadata?.avatar_url} />
      
      <div 
        className="px-4 space-y-6"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="text-white/70 hover:text-white hover:bg-white/5 p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Indietro
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Current Mission */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Missione Attuale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentMission ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{currentMission.title}</h3>
                    {getMissionStatusBadge(currentMission.status)}
                  </div>
                  <p className="text-white/70 text-sm">
                    Pubblicata il: {format(new Date(currentMission.publication_date), 'dd/MM/yyyy')}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#00D1FF]">{completedClues.length}</div>
                      <div className="text-white/70 text-sm">Indizi Completati</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#F059FF]">
                        {completedClues.filter(c => c.clue_type === 'premium').length}
                      </div>
                      <div className="text-white/70 text-sm">Indizi Premium</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/70">Nessuna missione attiva al momento</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Developer Reset */}
          {userRole === 'developer' && (
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset Progressi (Sviluppatore)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70 text-sm">
                  ⚠️ Questa funzione azzera tutti i progressi dell'utente inclusi indizi, mappe e contatori.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={loading}
                    >
                      Azzera Tutti i Progressi
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black/90 border-red-500/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Conferma Reset Progressi</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/70">
                        Questa azione è irreversibile. Tutti i progressi dell'utente verranno eliminati permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/10 text-white border-white/20">
                        Annulla
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetProgress}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Conferma Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          {/* Completed Clues History */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <History className="w-5 h-5 mr-2" />
                Cronologia Indizi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedClues.length > 0 ? (
                <div className="space-y-3">
                  {completedClues.map((clue, index) => (
                    <div
                      key={clue.clue_id}
                      className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-white font-medium">{clue.title_it}</p>
                          <p className="text-white/50 text-xs">{format(new Date(clue.created_at), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                      {clue.clue_type === 'premium' && (
                        <Badge className="bg-purple-600 text-white text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/70">Nessun indizio completato ancora</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div 
        id="settings-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </div>
  );
};

export default MissionSettings;