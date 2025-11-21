/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Game Achievement & Global Scoring System
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Clock, 
  Award,
  ChevronRight,
  Lock,
  Unlock
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useNotifications } from '@/hooks/useNotifications';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'consistency' | 'exploration' | 'social' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: {
    type: 'score' | 'games_played' | 'streak' | 'time' | 'accuracy';
    value: number;
    gameId?: string;
  };
  reward: {
    credits: number;
    experience: number;
    badge?: string;
  };
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

interface GameStats {
  gameId: string;
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  totalTime: number;
  bestTime: number;
  accuracy: number;
  streakCurrent: number;
  streakBest: number;
  level: number;
  experience: number;
}

interface GlobalScoring {
  totalExperience: number;
  overallLevel: number;
  totalAchievements: number;
  globalRank: number;
  weeklyRank: number;
  gameStats: Record<string, GameStats>;
}

export function GameAchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalScoring | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuthContext();
  const { addNotification } = useNotifications();

  // Predefined achievements system
  const achievementTemplates: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
    {
      id: 'first_game',
      name: 'Primo Passo',
      description: 'Completa il tuo primo mini-gioco',
      icon: '🎮',
      category: 'exploration',
      difficulty: 'bronze',
      requirement: { type: 'games_played', value: 1 },
      reward: { credits: 10, experience: 100 }
    },
    {
      id: 'speed_demon',
      name: 'Velocista',
      description: 'Completa qualsiasi gioco in meno di 30 secondi',
      icon: '⚡',
      category: 'speed',
      difficulty: 'silver',
      requirement: { type: 'time', value: 30 },
      reward: { credits: 25, experience: 250 }
    },
    {
      id: 'perfect_score',
      name: 'Perfezione',
      description: 'Ottieni il punteggio massimo in qualsiasi gioco',
      icon: '🌟',
      category: 'accuracy',
      difficulty: 'gold',
      requirement: { type: 'score', value: 1000 },
      reward: { credits: 50, experience: 500, badge: 'perfectionist' }
    },
    {
      id: 'combo_master',
      name: 'Maestro Disinnesco',
      description: 'Disinnesca 10 bombe consecutive senza errori',
      icon: '💣',
      category: 'accuracy',
      difficulty: 'gold',
      requirement: { type: 'streak', value: 10, gameId: 'disarm-bomb' },
      reward: { credits: 75, experience: 750 }
    },
    {
      id: 'memory_genius',
      name: 'Genio della Memoria',
      description: 'Completa 5 livelli di Memory Hack consecutivi',
      icon: '🧠',
      category: 'consistency',
      difficulty: 'platinum',
      requirement: { type: 'streak', value: 5, gameId: 'memory-hack' },
      reward: { credits: 100, experience: 1000, badge: 'memory_master' }
    },
    {
      id: 'satellite_tracker',
      name: 'Tracker Satellitare',
      description: 'Traccia 50 satelliti con precisione',
      icon: '🛰️',
      category: 'accuracy',
      difficulty: 'silver',
      requirement: { type: 'games_played', value: 50, gameId: 'satellite-tracking' },
      reward: { credits: 40, experience: 400 }
    },
    {
      id: 'combination_cracker',
      name: 'Scassinatore',
      description: 'Crackare 20 combinazioni in totale',
      icon: '🔓',
      category: 'exploration',
      difficulty: 'silver',
      requirement: { type: 'games_played', value: 20, gameId: 'crack-combination' },
      reward: { credits: 35, experience: 350 }
    },
    {
      id: 'weekly_warrior',
      name: 'Guerriero Settimanale',
      description: 'Gioca almeno una volta al giorno per 7 giorni',
      icon: '📅',
      category: 'consistency',
      difficulty: 'gold',
      requirement: { type: 'streak', value: 7 },
      reward: { credits: 100, experience: 1000 }
    }
  ];

  // Calculate global scoring
  const calculateGlobalStats = useCallback((gameStats: Record<string, GameStats>): GlobalScoring => {
    const totalExperience = Object.values(gameStats).reduce((sum, stats) => sum + stats.experience, 0);
    const overallLevel = Math.floor(totalExperience / 1000) + 1;
    const totalAchievements = achievements.filter(a => a.unlocked).length;
    
    return {
      totalExperience,
      overallLevel,
      totalAchievements,
      globalRank: Math.floor(Math.random() * 1000) + 1, // Mock ranking
      weeklyRank: Math.floor(Math.random() * 100) + 1,
      gameStats
    };
  }, [achievements]);

  // Check achievement progress
  const checkAchievementProgress = useCallback(async (gameId: string, score: number, time: number) => {
    if (!user) return;

    try {
      // Fetch user's game progress from Supabase
      const { data: progress, error } = await supabase
        .from('user_minigames_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const gameProgress = progress || [];
      
      // Update achievements based on new progress
      const updatedAchievements = achievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let progress = 0;
        let shouldUnlock = false;

        switch (achievement.requirement.type) {
          case 'games_played':
            if (achievement.requirement.gameId) {
              const gameStats = gameProgress.filter(p => p.game_key === achievement.requirement.gameId);
              progress = Math.min(gameStats.length / achievement.requirement.value, 1);
              shouldUnlock = gameStats.length >= achievement.requirement.value;
            } else {
              progress = Math.min(gameProgress.length / achievement.requirement.value, 1);
              shouldUnlock = gameProgress.length >= achievement.requirement.value;
            }
            break;
          
          case 'score':
            const maxScore = Math.max(...gameProgress.map(p => p.score || 0));
            progress = Math.min(maxScore / achievement.requirement.value, 1);
            shouldUnlock = maxScore >= achievement.requirement.value;
            break;
          
          case 'time':
            // Time-based achievements (lower is better)
            const bestTime = Math.min(...gameProgress.map(p => p.score || Infinity));
            progress = bestTime <= achievement.requirement.value ? 1 : 0;
            shouldUnlock = bestTime <= achievement.requirement.value;
            break;
        }

        if (shouldUnlock && !achievement.unlocked) {
          // Unlock achievement
          addNotification({
            title: `🏆 Achievement Sbloccato!`,
            description: `${achievement.icon} ${achievement.name}`,
            type: "success"
          });

          return {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progress: 1
          };
        }

        return {
          ...achievement,
          progress
        };
      });

      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user, achievements, addNotification]);

  // Fetch user's game data and calculate stats
  const fetchGameStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: progress, error } = await supabase
        .from('user_minigames_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const gameProgress = progress || [];
      
      // Calculate game-specific stats
      const gameStats: Record<string, GameStats> = {};
      
      const gameIds = ['disarm-bomb', 'memory-hack', 'satellite-tracking', 'crack-combination', 'find-map-point'];
      
      gameIds.forEach(gameId => {
        const gameData = gameProgress.filter(p => p.game_key === gameId);
        
        if (gameData.length > 0) {
          const scores = gameData.map(g => g.score || 0);
          const totalScore = scores.reduce((sum, score) => sum + score, 0);
          
          gameStats[gameId] = {
            gameId,
            gamesPlayed: gameData.length,
            totalScore,
            bestScore: Math.max(...scores),
            averageScore: totalScore / gameData.length,
            totalTime: 0, // Would need time tracking
            bestTime: 0,
            accuracy: 85 + Math.random() * 10, // Mock accuracy
            streakCurrent: 0,
            streakBest: Math.floor(Math.random() * 10),
            level: Math.floor(gameData.length / 5) + 1,
            experience: totalScore
          };
        }
      });

      // Initialize achievements with progress
      const initializedAchievements = achievementTemplates.map(template => ({
        ...template,
        unlocked: false,
        progress: 0
      }));

      setAchievements(initializedAchievements);
      setGlobalStats(calculateGlobalStats(gameStats));

    } catch (error) {
      console.error('Error fetching game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameStats();
  }, [user]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'speed': return <Zap className="h-4 w-4" />;
      case 'accuracy': return <Target className="h-4 w-4" />;
      case 'consistency': return <Clock className="h-4 w-4" />;
      case 'exploration': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Global Stats Overview */}
      {globalStats && (
        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Statistiche Globali Gaming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-m1ssion-blue">
                  {globalStats.overallLevel}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Livello Globale</p>
                <Progress 
                  value={(globalStats.totalExperience % 1000) / 10} 
                  className="mt-2 h-2"
                />
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {globalStats.totalAchievements}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Achievement</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  #{globalStats.globalRank}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Rank Globale</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-m1ssion-blue">
                  {globalStats.totalExperience.toLocaleString()}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">XP Totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Tutti', icon: <Award className="h-4 w-4" /> },
              { key: 'speed', label: 'Velocità', icon: <Zap className="h-4 w-4" /> },
              { key: 'accuracy', label: 'Precisione', icon: <Target className="h-4 w-4" /> },
              { key: 'consistency', label: 'Costanza', icon: <Clock className="h-4 w-4" /> },
              { key: 'exploration', label: 'Esplorazione', icon: <Star className="h-4 w-4" /> }
            ].map(category => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-400" />
            Sistema Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-m1ssion-blue"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'border-yellow-400 bg-yellow-400/5' 
                      : 'border-[hsl(var(--border))] hover:border-m1ssion-blue/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h3 className={`font-semibold ${
                          achievement.unlocked ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'
                        }`}>
                          {achievement.name}
                        </h3>
                        <Badge className={`${getDifficultyColor(achievement.difficulty)} text-white text-xs`}>
                          {achievement.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    {achievement.unlocked ? (
                      <Unlock className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    )}
                  </div>

                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
                    {achievement.description}
                  </p>

                  {!achievement.unlocked && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))] mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(achievement.progress * 100)}%</span>
                      </div>
                      <Progress value={achievement.progress * 100} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(achievement.category)}
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {achievement.category}
                      </span>
                    </div>
                    
                    <div className="text-m1ssion-blue">
                      +{achievement.reward.credits} crediti
                    </div>
                  </div>

                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-2 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                      Sbloccato: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */