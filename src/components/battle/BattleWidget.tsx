/**
 * Battle Widget - Floating battle panel for map integration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { useSafeNavigate } from '@/lib/navigation/safeNavigate';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, ChevronUp, ChevronDown, Trophy, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useMyActiveBattles } from '@/hooks/useMyActiveBattles';
import { BattleMount } from './BattleMount';
import { acceptBattle } from '@/lib/battle/invokeBattle';
import { useToast } from '@/hooks/use-toast';
import type { Battle } from '@/types/battle';

interface BattleWidgetProps {
  userId: string | null;
}

export function BattleWidget({ userId }: BattleWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const navigate = useSafeNavigate();
  const { toast } = useToast();
  const { activeBattles, pendingChallenges, loading } = useMyActiveBattles(userId);

  const totalBadgeCount = activeBattles.length + pendingChallenges.length;
  const activeBattle = activeBattles[0]; // Show HUD for first active battle

  const handleAcceptChallenge = async (battleId: string) => {
    setAcceptingId(battleId);

    try {
      await acceptBattle(battleId);

      toast({
        title: '✅ Battle Accepted!',
        description: 'Prepare for combat...',
      });

      // Navigate to arena
      navigate(`/battle/${battleId}`);
    } catch (error: any) {
      console.error('⚠️ Accept error:', error);
      toast({
        title: 'Accept Failed',
        description: error?.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const formatBattleStatus = (battle: Battle): string => {
    switch (battle.status) {
      case 'pending':
        return 'Awaiting opponent';
      case 'accepted':
        return 'Ready to start';
      case 'ready':
        return 'Get ready!';
      case 'countdown':
        return 'Countdown active';
      case 'active':
        return 'Battle in progress';
      default:
        return battle.status;
    }
  };

  const getTimeRemaining = (battle: Battle): string => {
    if (battle.expires_at) {
      const remaining = new Date(battle.expires_at).getTime() - Date.now();
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        return `${minutes}m left`;
      }
    }
    return 'Expiring soon';
  };

  if (!userId) return null;

  return (
    <>
      {/* Floating Battle Button */}
      <motion.div
        className="fixed z-[1001]"
        style={{
          left: '16px',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 240px)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg border-2 border-white/20 relative"
        >
          <Swords className="h-5 w-5 text-white" />
          {totalBadgeCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 border-2 border-background"
              variant="destructive"
            >
              {totalBadgeCount}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Battle Panel (Sliding from Bottom-Left) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed z-[1002]"
            style={{
              left: '16px',
              bottom: 'calc(env(safe-area-inset-bottom, 34px) + 308px)',
              maxHeight: 'calc(100vh - env(safe-area-inset-bottom, 34px) - 400px)',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="m1-relief w-80 relative overflow-hidden rounded-[24px]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-cyan-400" />
                    <CardTitle className="text-base text-cyan-400">TRON Battle</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-xs">Active battles & challenges</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Loading State */}
                {loading && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Loading battles...
                  </div>
                )}

                {/* Empty State */}
                {!loading && totalBadgeCount === 0 && (
                  <div className="text-center py-6 space-y-3">
                    <Trophy className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
                    <p className="text-sm text-muted-foreground">No active battles</p>
                    <Button
                      onClick={() => navigate('/battle')}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      <Swords className="mr-2 h-4 w-4" />
                      New Battle
                    </Button>
                  </div>
                )}

                {/* Pending Challenges */}
                {pendingChallenges.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-yellow-400">
                      <Zap className="h-3 w-3" />
                      Challenges ({pendingChallenges.length})
                    </div>
                    <ScrollArea className="max-h-32">
                      <div className="space-y-2">
                        {pendingChallenges.map((battle) => (
                          <motion.div
                            key={battle.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {battle.arena_name || 'Battle Arena'}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {battle.stake_amount} {battle.stake_type} • {getTimeRemaining(battle)}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleAcceptChallenge(battle.id)}
                                disabled={acceptingId === battle.id}
                                size="sm"
                                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                              >
                                {acceptingId === battle.id ? 'Accepting...' : 'Accept'}
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Active Battles */}
                {activeBattles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-cyan-400">
                      <Clock className="h-3 w-3 animate-pulse" />
                      Active ({activeBattles.length})
                    </div>
                    <ScrollArea className="max-h-40">
                      <div className="space-y-2">
                        {activeBattles.map((battle) => (
                          <motion.div
                            key={battle.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 cursor-pointer hover:bg-cyan-500/20 transition-colors"
                            onClick={() => navigate(`/battle/${battle.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {battle.arena_name || 'Battle Arena'}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatBattleStatus(battle)} • {battle.stake_amount} {battle.stake_type}
                                </p>
                              </div>
                              <ChevronUp className="h-4 w-4 text-cyan-400 -rotate-90" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* New Battle Button (if has battles) */}
                {totalBadgeCount > 0 && (
                  <Button
                    onClick={() => navigate('/battle')}
                    size="sm"
                    variant="outline"
                    className="w-full border-cyan-500/30 hover:bg-cyan-500/10"
                  >
                    <Swords className="mr-2 h-3 w-3" />
                    New Battle
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle HUD (for active battle) */}
      {activeBattle && (
        <BattleMount
          sessionId={activeBattle.id}
          onClose={() => {
            // HUD closed, nothing to do (will unmount when battle resolves)
          }}
        />
      )}
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
