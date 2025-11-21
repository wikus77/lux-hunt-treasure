/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Hall of Winners - Styled Settings Page
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Crown, 
  Medal, 
  MapPin, 
  Clock, 
  User, 
  Calendar,
  Star,
  Award,
  Target
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useLocation } from 'wouter';

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

const HallOfWinnersStyledPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
    
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
      const mockWinners: Winner[] = [
        {
          id: '1',
          user_id: 'user1',
          mission_id: 'mission1',
          agent_code: 'AG-3743',
          full_name: 'Marco Rossi',
          avatar_url: undefined,
          city: 'Milano',
          prize_image: '/api/placeholder/400/300',
          prize_name: 'Tesla Model S',
          won_at: '2024-01-20T16:42:03Z',
          mission_start: '2024-01-18T00:00:00Z',
          completion_time: '2 giorni, 16 ore, 42 min'
        },
        {
          id: '2',
          user_id: 'user2',
          mission_id: 'mission2',
          agent_code: 'AG-7291',
          full_name: 'Anna Bianchi',
          avatar_url: undefined,
          city: 'Roma',
          prize_image: '/api/placeholder/400/300',
          prize_name: 'iPhone 15 Pro Max',
          won_at: '2024-01-15T14:22:15Z',
          mission_start: '2024-01-13T00:00:00Z',
          completion_time: '2 giorni, 14 ore, 22 min'
        },
        {
          id: '3',
          user_id: 'user3',
          mission_id: 'mission3',
          agent_code: 'AG-1847',
          full_name: 'Luigi Verde',
          avatar_url: undefined,
          city: 'Napoli',
          prize_image: '/api/placeholder/400/300',
          prize_name: 'MacBook Pro M3',
          won_at: '2024-01-10T09:33:27Z',
          mission_start: '2024-01-08T00:00:00Z',
          completion_time: '2 giorni, 9 ore, 33 min'
        }
      ];
      setWinners(mockWinners);
    } catch (error) {
      console.error('Error loading winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-primary" />;
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

  return (
    <div 
      className="w-full m1-app-bg relative"
      style={{ 
        minHeight: '100dvh'
      }}
    >
      {/* Micro-grain overlay for depth */}
      <div className="m1-grain" />
      
      <UnifiedHeader />
      
      <main 
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          minHeight: '100dvh',
          position: 'relative',
          zIndex: 0
        }}
        className="px-4"
      >
        <div className="max-w-lg mx-auto space-y-6">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-orbitron font-bold neon-text-cyan">
              <span 
                className="text-auroraCyan"
              >
                Hall of 
              </span>
              <span 
                className="text-white"
              >
                Winners
              </span>
            </h1>
            <p className="text-muted-foreground">Vincitori M1SSION™</p>
          </div>

          <Card 
            className="border-0 m1-panel"
          >
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 mb-4 mx-auto">
                <Trophy className="h-10 w-10 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Hall of Winners
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className="text-center p-3 border-0 m1-card"
                >
                  <p className="text-sm text-muted-foreground">Vincitori</p>
                  <p className="font-semibold text-lg text-yellow-400">{winners.length}</p>
                </div>
                <div 
                  className="text-center p-3 border-0 m1-card"
                >
                  <p className="text-sm text-muted-foreground">Premi</p>
                  <p className="font-semibold text-lg text-green-400">{winners.length}</p>
                </div>
                <div 
                  className="text-center p-3 border-0 m1-card"
                >
                  <p className="text-sm text-muted-foreground">Città</p>
                  <p className="font-semibold text-lg text-cyan-400">
                    {winners.length > 0 ? new Set(winners.map(w => w.city)).size : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 m1-panel"
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Vincitori Recenti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Caricamento vincitori...</p>
                </div>
              ) : winners.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Nessun vincitore</h3>
                  <p className="text-sm text-muted-foreground/70">
                    Sii il primo a vincere una missione!
                  </p>
                </div>
              ) : (
                winners.slice(0, 3).map((winner, index) => (
                  <div 
                    key={winner.id} 
                    className="p-4 border-0 m1-card"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-8 h-8 border border-primary/30">
                            <AvatarImage src={winner.avatar_url} />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {winner.agent_code.split('-')[1]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">{winner.full_name}</h3>
                            <p className="text-xs text-muted-foreground/80 font-mono">{winner.agent_code}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Premio:</span>
                            <span className="text-yellow-400 font-medium">{winner.prize_name}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Città:</span>
                            <span className="text-foreground">{winner.city}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Tempo:</span>
                            <span className="text-green-400">{winner.completion_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card 
            className="border-0 m1-panel"
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-400" />
                Statistiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                className="p-4 border-0"
                style={{
                  background: 'rgba(0, 0, 0, 0.05)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium">Missioni Completate</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {winners.length}
                  </Badge>
                </div>
              </div>
              
              <div 
                className="p-4 border-0 m1-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">Tempo Medio</span>
                  </div>
                  <span className="text-sm text-blue-400 font-medium">2.5 giorni</span>
                </div>
              </div>
              
              <div 
                className="p-4 border-0 m1-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium">Copertura Geografica</span>
                  </div>
                  <span className="text-sm text-cyan-400 font-medium">
                    {winners.length > 0 ? new Set(winners.map(w => w.city)).size : 0} città
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Decorative gradient effect at bottom */}
      <motion.div
        className="fixed bottom-24 left-0 right-0 h-32 pointer-events-none z-[9]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          background: `
            radial-gradient(ellipse at 50% 100%, rgba(0, 209, 255, 0.18), transparent 70%),
            radial-gradient(ellipse at 20% 100%, rgba(123, 92, 255, 0.15), transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(240, 89, 255, 0.12), transparent 65%)
          `,
          filter: 'blur(20px)'
        }}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default HallOfWinnersStyledPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
