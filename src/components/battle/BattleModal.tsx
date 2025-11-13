/**
 * Battle Modal - Full-screen modal for battle management
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Clock, Zap, Plus, ShoppingBag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { acceptBattle } from '@/lib/battle/invokeBattle';
import { useToast } from '@/hooks/use-toast';
import { useSafeNavigate } from '@/lib/navigation/safeNavigate';
import type { Battle } from '@/types/battle';
import { BattleMount } from './BattleMount';
import { BattleCreationForm } from './BattleCreationForm';
import { BattleShop } from './BattleShop';

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  activeBattles: Battle[];
  pendingChallenges: Battle[];
  loading: boolean;
  preSelectedOpponent?: { id: string; name: string }; // For agent marker attack
}

export function BattleModal({
  isOpen,
  onClose,
  userId,
  activeBattles,
  pendingChallenges,
  loading,
  preSelectedOpponent,
}: BattleModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useSafeNavigate();

  const activeBattle = activeBattles[0]; // Show HUD for first active battle

  const handleAcceptChallenge = async (battleId: string) => {
    setAcceptingId(battleId);

    try {
      await acceptBattle(battleId);

      toast({
        title: '✅ Battle Accepted!',
        description: 'Prepare for combat...',
      });

      // Close modal and let HUD handle the battle
      onClose();
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
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-x-4 top-[10%] bottom-[10%] z-[1101] bg-background/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                maxWidth: '600px',
                margin: '0 auto',
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-purple-950/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Swords className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-cyan-400">TRON Battle</h2>
                    <p className="text-xs text-muted-foreground">Manage your battles</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-cyan-500/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-[calc(100%-73px)]">
                <TabsList className="w-full grid grid-cols-3 bg-muted/30 rounded-none border-b border-border/50">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="new">New Battle</TabsTrigger>
                  <TabsTrigger value="shop">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Shop
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {/* Loading State */}
                      {loading && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          Loading battles...
                        </div>
                      )}

                      {/* Empty State */}
                      {!loading && pendingChallenges.length === 0 && activeBattles.length === 0 && (
                        <div className="text-center py-12 space-y-4">
                          <Swords className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                          <p className="text-sm text-muted-foreground">No active battles</p>
                          <Button
                            onClick={() => setActiveTab('new')}
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                          >
                            <Swords className="mr-2 h-4 w-4" />
                            Create Battle
                          </Button>
                        </div>
                      )}

                      {/* Pending Challenges */}
                      {pendingChallenges.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                            <Zap className="h-4 w-4" />
                            Challenges ({pendingChallenges.length})
                          </div>
                          {pendingChallenges.map((battle) => (
                            <motion.div
                              key={battle.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {battle.arena_name || 'Battle Arena'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {battle.stake_amount} {battle.stake_type} • {getTimeRemaining(battle)}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleAcceptChallenge(battle.id)}
                                  disabled={acceptingId === battle.id}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {acceptingId === battle.id ? 'Accepting...' : 'Accept'}
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Active Battles */}
                      {activeBattles.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
                            <Clock className="h-4 w-4 animate-pulse" />
                            Active Battles ({activeBattles.length})
                          </div>
                          {activeBattles.map((battle) => (
                            <motion.div
                              key={battle.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 cursor-pointer hover:bg-cyan-500/20 transition-colors"
                              onClick={() => navigate(`/battle/${battle.id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {battle.arena_name || 'Battle Arena'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatBattleStatus(battle)} • {battle.stake_amount} {battle.stake_type}
                                  </p>
                                </div>
                                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                                  {battle.status}
                                </Badge>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Link to full arena */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate('/battle');
                          onClose();
                        }}
                        className="w-full text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Open full Battle Arena
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* New Battle Tab */}
                <TabsContent value="new" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <BattleCreationForm
                        userId={userId}
                        preSelectedOpponent={preSelectedOpponent}
                        onSuccess={() => {
                          toast({
                            title: '✅ Battle Created!',
                            description: 'Waiting for opponent...',
                          });
                          setActiveTab('overview');
                        }}
                        onCancel={() => setActiveTab('overview')}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Shop Tab */}
                <TabsContent value="shop" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      {userId ? (
                        <BattleShop userId={userId} />
                      ) : (
                        <div className="text-center py-12 text-sm text-muted-foreground">
                          Please log in to access the shop
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </motion.div>
          </>
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
