// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hall of Winners: Leaderboard globale dei vincitori M1SSION

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Clock, User, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Winner {
  id: string;
  completion_time: string;
  winner_user_id: string;
  username: string | null;
  avatar_url: string | null;
  agent_code: string | null;
  mission_title: string | null;
  mission_code: string | null;
  prize_name: string | null;
  prize_value: number | null;
  prize_image: string | null;
}

export default function HallOfWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('winners_public')
        .select('*')
        .limit(50);

      if (fetchError) throw fetchError;

      // Map database results supporting both username and nickname for compatibility
      const mappedData = (data || []).map((row: any) => ({
        ...row,
        username: row.username || row.nickname || null
      }));

      setWinners(mappedData);
    } catch (err) {
      console.error('Error loading winners:', err);
      setError('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <Sparkles className="w-5 h-5 text-primary/60" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-4 py-8">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Winners</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadWinners}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-primary" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                Hall of Winners
              </h1>
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I migliori agenti M1SSION che hanno completato missioni impossibili
            </p>
          </motion.div>
        </div>
      </div>

      {/* Winners List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {winners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Trophy className="w-24 h-24 mx-auto mb-6 text-muted-foreground/30" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              Nessun vincitore ancora
            </h3>
            <p className="text-muted-foreground">
              Completa una missione per essere il primo nella Hall of Winners!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {winners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className={`
                      p-4 sm:p-6 hover:shadow-lg transition-all duration-300 
                      ${index < 3 ? 'border-2 border-primary/50 bg-primary/5' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                      {/* Rank */}
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16">
                        {getRankIcon(index)}
                      </div>

                      {/* User Avatar & Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/30">
                          <AvatarImage src={winner.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground truncate">
                            {winner.username || 'Anonymous Agent'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {winner.agent_code || 'No Code'}
                          </p>
                        </div>
                      </div>

                      {/* Mission Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {winner.mission_code || 'Unknown'}
                        </Badge>
                        <p className="text-sm font-medium text-foreground truncate">
                          {winner.mission_title || 'Mission Classified'}
                        </p>
                      </div>

                      {/* Prize Info */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {winner.prize_image && (
                          <img
                            src={winner.prize_image}
                            alt={winner.prize_name || 'Prize'}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="hidden sm:block">
                          <p className="text-sm font-medium text-foreground">
                            {winner.prize_name || 'Prize'}
                          </p>
                          {winner.prize_value && (
                            <p className="text-xs text-primary font-bold">
                              {winner.prize_value} M1U
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Completion Time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        <span className="hidden lg:inline">
                          {formatDate(winner.completion_time)}
                        </span>
                        <span className="lg:hidden">
                          {new Date(winner.completion_time).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer Stats */}
      {winners.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <Card className="p-6">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">{winners.length}</p>
              <p className="text-sm text-muted-foreground">Total Winners</p>
            </Card>
            <Card className="p-6">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">
                {new Set(winners.map((w) => w.mission_code)).size}
              </p>
              <p className="text-sm text-muted-foreground">Missions Completed</p>
            </Card>
            <Card className="p-6">
              <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">
                {winners.reduce((sum, w) => sum + (w.prize_value || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total M1U Awarded</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
