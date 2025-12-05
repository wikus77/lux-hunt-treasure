// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeeklyClue {
  id: string;
  week: number;
  title: string;
  content: string;
  clue_type: string;
  is_released: boolean;
  released_at?: string;
}

const WeeklyCluesIntegration: React.FC = () => {
  const [clues, setClues] = useState<WeeklyClue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadWeeklyClues();
    determineCurrentWeek();
  }, []);

  const determineCurrentWeek = async () => {
    try {
      // Get user's mission start date from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCurrentWeek(1);
        return;
      }

      const { data: missionStatus, error } = await supabase
        .from('user_mission_status')
        .select('mission_started_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !missionStatus?.mission_started_at) {
        // No mission data - default to week 1
        console.log('[WeeklyClues] No mission start date found, defaulting to week 1');
        setCurrentWeek(1);
        return;
      }

      // Calculate current week based on mission start date
      const missionStart = new Date(missionStatus.mission_started_at);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - missionStart.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysPassed / 7) + 1;
      
      // Clamp to weeks 1-4 (mission is 4 weeks)
      const clampedWeek = Math.max(1, Math.min(4, weekNumber));
      
      console.log('[WeeklyClues] Calculated week:', { missionStart, daysPassed, weekNumber: clampedWeek });
      setCurrentWeek(clampedWeek);
    } catch (err) {
      console.error('[WeeklyClues] Error determining week:', err);
      setCurrentWeek(1); // Safe fallback
    }
  };

  const loadWeeklyClues = async () => {
    try {
      // For now, generate mock data - will connect to backend later
      const mockClues: WeeklyClue[] = [
        {
          id: '1',
          week: 1,
          title: 'Il Primo Indizio',
          content: 'Nel cuore della città antica, dove i viaggiatori si fermano per riposare...',
          clue_type: 'location',
          is_released: true,
          released_at: new Date().toISOString()
        },
        {
          id: '2', 
          week: 1,
          title: 'Il Dettaglio Nascosto',
          content: 'Cerca il simbolo che unisce terra e cielo, in un luogo dove l\'arte incontra la storia.',
          clue_type: 'detail',
          is_released: true,
          released_at: new Date().toISOString()
        },
        {
          id: '3',
          week: 2,
          title: 'La Connessione',
          content: 'Non tutto è come appare. Il numero che conta non è quello che vedi.',
          clue_type: 'cipher',
          is_released: currentWeek >= 2,
          released_at: currentWeek >= 2 ? new Date().toISOString() : undefined
        },
        {
          id: '4',
          week: 2,
          title: 'Il Percorso',
          content: 'Da qui, guarda verso nord. Conta i passi fino al punto di riferimento.',
          clue_type: 'navigation',
          is_released: currentWeek >= 2,
          released_at: currentWeek >= 2 ? new Date().toISOString() : undefined
        },
        {
          id: '5',
          week: 3,
          title: 'La Chiave Finale',
          content: 'Tutto converge qui. Il passato e il presente si incontrano.',
          clue_type: 'final',
          is_released: currentWeek >= 3,
          released_at: currentWeek >= 3 ? new Date().toISOString() : undefined
        }
      ];

      setClues(mockClues);
      setLoading(false);
    } catch (error) {
      console.error('Error loading weekly clues:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli indizi settimanali",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const getCluesByWeek = (week: number) => {
    return clues.filter(clue => clue.week === week);
  };

  const getClueTypeIcon = (type: string) => {
    switch (type) {
      case 'location': return '📍';
      case 'detail': return '🔍';
      case 'cipher': return '🔐';
      case 'navigation': return '🧭';
      case 'final': return '🎯';
      default: return '📝';
    }
  };

  const getClueTypeName = (type: string) => {
    switch (type) {
      case 'location': return 'Posizione';
      case 'detail': return 'Dettaglio';
      case 'cipher': return 'Codice';
      case 'navigation': return 'Navigazione';
      case 'final': return 'Finale';
      default: return 'Generale';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Indizi Settimanali</h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Settimana Corrente: {currentWeek}</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Progresso Indizi</h4>
            <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">
              {clues.filter(c => c.is_released).length} / {clues.length} sbloccati
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(week => {
              const weekClues = getCluesByWeek(week);
              const releasedCount = weekClues.filter(c => c.is_released).length;
              const totalCount = weekClues.length;
              const isCurrentWeek = week === currentWeek;
              const isUnlocked = week <= currentWeek;
              
              return (
                <div 
                  key={week}
                  className={`p-3 rounded-xl text-center transition-all duration-300 ${
                    isCurrentWeek 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-primary/20 border-2 border-cyan-400/50'
                      : isUnlocked
                        ? 'bg-green-500/10 border-2 border-green-400/30'
                        : 'bg-muted/40 border-2 border-border/30'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">Settimana {week}</div>
                  <div className="text-xs text-muted-foreground">
                    {releasedCount}/{totalCount} indizi
                  </div>
                  {isCurrentWeek && (
                    <div className="mt-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto animate-pulse"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Clues */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map(week => {
          const weekClues = getCluesByWeek(week);
          const isWeekUnlocked = week <= currentWeek;
          
          return (
            <Card 
              key={week} 
              className={`border-2 rounded-2xl backdrop-blur-md shadow-xl transition-all duration-300 ${
                isWeekUnlocked 
                  ? 'border-cyan-500/20 bg-card/60'
                  : 'border-muted/30 bg-muted/20'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>Settimana {week}</span>
                    {week === currentWeek && (
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
                        Attuale
                      </Badge>
                    )}
                  </div>
                  {!isWeekUnlocked && (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isWeekUnlocked ? (
                  <div className="space-y-4">
                    {weekClues.map(clue => (
                      <div 
                        key={clue.id}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          clue.is_released
                            ? 'bg-card/40 border-green-400/30 hover:border-green-400/50'
                            : 'bg-muted/30 border-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {getClueTypeIcon(clue.clue_type)}
                            </span>
                            <div>
                              <h5 className="font-medium">{clue.title}</h5>
                              <Badge variant="outline" className="text-xs mt-1">
                                {getClueTypeName(clue.clue_type)}
                              </Badge>
                            </div>
                          </div>
                          {clue.is_released ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        
                        {clue.is_released ? (
                          <p className="text-muted-foreground leading-relaxed">
                            {clue.content}
                          </p>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Indizio bloccato - sarà sbloccato durante la settimana
                          </p>
                        )}
                        
                        {clue.released_at && (
                          <div className="text-xs text-muted-foreground mt-3">
                            Sbloccato: {new Date(clue.released_at).toLocaleString('it-IT')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Gli indizi di questa settimana saranno sbloccati quando raggiungerai la Settimana {week}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCluesIntegration;