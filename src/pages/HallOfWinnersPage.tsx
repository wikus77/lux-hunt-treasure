// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, MapPin, Clock, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface Winner {
  id: string;
  user_id: string;
  mission_id: string;
  agent_code: string;
  full_name: string;
  avatar_url?: string;
  city: string;
  prize_image: string;
  prize_name: string;
  won_at: string;
  mission_start: string;
  completion_time: string;
}

const HallOfWinnersPage: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
    
    // Set up real-time subscription for new winners
    const channel = supabase
      .channel('winners-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'final_shots',
        filter: 'is_winner=eq.true'
      }, () => {
        loadWinners();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);

      // Query real winners data from winners_public view
      const { data, error } = await supabase
        .from('winners_public' as any)
        .select('*')
        .order('completion_time', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading winners:', error);
        setWinners([]);
        return;
      }

      // Map database results to Winner interface
      const winnersData: Winner[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.winner_user_id || '',
        mission_id: row.mission_id || '',
        agent_code: row.agent_code || 'N/A',
        full_name: row.username || 'Anonymous Agent',
        avatar_url: row.avatar_url,
        city: 'Unknown', // Not available in current schema
        prize_image: '/api/placeholder/400/300',
        prize_name: row.prize_title || 'Mystery Prize',
        won_at: row.completion_time,
        mission_start: row.completion_time, // Fallback
        completion_time: calculateCompletionTime(row.completion_time)
      }));

      setWinners(winnersData);
    } catch (error) {
      console.error('Error loading winners:', error);
      setWinners([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionTime = (timestamp: string): string => {
    try {
      const completionDate = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - completionDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffDays > 0) return `${diffDays} giorni, ${diffHours} ore, ${diffMins} min`;
      if (diffHours > 0) return `${diffHours} ore, ${diffMins} min`;
      return `${diffMins} min`;
    } catch {
      return 'Unknown';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 2:
        return <Trophy className="w-8 h-8 text-amber-600" />;
      default:
        return <Trophy className="w-8 h-8 text-cyan-400" />;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black';
      case 1:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-black';
      case 2:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-gradient-to-r from-cyan-500 to-primary text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaWrapper className="h-full bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div>
        </div>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper className="h-full bg-background">
      <div 
        className="min-h-screen bg-[#070818]" 
        style={{ 
          paddingTop: '140px', 
          paddingBottom: '120px',
          width: '100vw',
          maxWidth: '100vw',
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        <div className="container mx-auto px-3" style={{
          paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
          paddingRight: 'max(16px, env(safe-area-inset-right, 16px))'
        }}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl shadow-yellow-500/20 mb-4">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold">
              <span className="text-yellow-400 glow-text">HALL</span>
              <span className="text-white"> OF WINNERS</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Archivio pubblico dei vincitori M1SSION™
            </p>
          </div>
        </div>

        {/* Winners List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {winners.length === 0 ? (
              <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md">
                <CardContent className="p-8 text-center">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Nessun vincitore ancora</h3>
                  <p className="text-muted-foreground">
                    Sii il primo a vincere una missione M1SSION™!
                  </p>
                </CardContent>
              </Card>
            ) : (
              winners.map((winner, index) => (
                <Card 
                  key={winner.id} 
                  className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Rank Icon */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        {getRankIcon(index)}
                        <Badge className={`mt-2 text-xs font-bold ${getRankBadge(index)}`}>
                          #{index + 1}
                        </Badge>
                      </div>

                      {/* Winner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-cyan-400/50">
                              <AvatarImage src={winner.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-primary text-white font-bold">
                                {winner.agent_code.split('-')[1]}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-cyan-400" />
                                <span className="font-bold text-white text-lg">
                                  {winner.full_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-mono bg-cyan-500/20 px-2 py-1 rounded text-cyan-400">
                                  {winner.agent_code}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(winner.won_at)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{winner.city}</span>
                            </div>
                          </div>
                        </div>

                        {/* Prize Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-400" />
                              Premio Vinto
                            </h4>
                            <div className="bg-muted/40 p-3 rounded-xl">
                              <div className="font-medium text-yellow-400">{winner.prize_name}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Missione #{winner.mission_id.slice(-4)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-green-400" />
                              Tempo di Completamento
                            </h4>
                            <div className="bg-muted/40 p-3 rounded-xl">
                              <div className="font-medium text-green-400">{winner.completion_time}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Dalla pubblicazione alla vincita
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Statistics Footer */}
        <div className="p-6 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{winners.length}</div>
              <div className="text-xs text-muted-foreground">Vincitori</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {winners.length > 0 ? winners.length : 0}
              </div>
              <div className="text-xs text-muted-foreground">Missioni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {winners.length > 0 ? new Set(winners.map(w => w.city)).size : 0}
              </div>
              <div className="text-xs text-muted-foreground">Città</div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Bottom Navigation - Uniform positioning like Home */}
      <div 
        id="mission-bottom-nav-container"
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
    </SafeAreaWrapper>
  );
};

export default HallOfWinnersPage;