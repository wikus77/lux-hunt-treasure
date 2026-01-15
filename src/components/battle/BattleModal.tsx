/**
 * Battle Modal - Full-screen modal for battle management
 * FIXED: createPortal + responsive positioning between header and bottom nav
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BattleMount } from './BattleMount';
import { BattleCreationForm } from './BattleCreationForm';
import { BattleShop } from './BattleShop';
import { BattleVideoModal } from './BattleVideoModal'; // 🆕 Import video modal

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  activeBattles: Battle[];
  pendingChallenges: Battle[];
  loading: boolean;
  preSelectedOpponent?: { id: string; name: string; lat?: number; lng?: number }; // For agent marker attack
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
  // Tab default è sempre "new" (New Battle)
  const [activeTab, setActiveTab] = useState('new');
  const { toast } = useToast();

  // 🆕 State for battle video (managed here to prevent unmounting)
  const [showBattleVideo, setShowBattleVideo] = useState(false);
  const [battleVideoResult, setBattleVideoResult] = useState<boolean | null>(null);

  const activeBattle = activeBattles[0]; // Show HUD for first active battle

  // 🆕 Callback to show battle video (called by BattleCreationForm)
  const handleShowBattleVideo = useCallback((won: boolean) => {
    setBattleVideoResult(won);
    setShowBattleVideo(true);
  }, []);

  // 🆕 Callback when video ends
  const handleBattleVideoClose = useCallback(() => {
    setShowBattleVideo(false);
    // Result modal will be handled by BattleCreationForm
  }, []);

  if (!userId) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - z-index altissimo */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            style={{ zIndex: 999998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content - Posizionato tra header (60px) e bottom nav (90px) */}
          <motion.div
            className="fixed left-4 right-4 bg-background/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              zIndex: 999999,
              top: 'calc(60px + env(safe-area-inset-top, 0px))',
              bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
              maxWidth: '600px',
              margin: '0 auto',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
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

              {/* Tabs - Solo New Battle e Shop */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-[calc(100%-73px)]">
                <TabsList className="w-full grid grid-cols-2 bg-muted/30 rounded-none border-b border-border/50">
                  <TabsTrigger value="new">⚔️ New Battle</TabsTrigger>
                  <TabsTrigger value="shop">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Shop
                  </TabsTrigger>
                </TabsList>

                {/* New Battle Tab */}
                <TabsContent value="new" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                      <BattleCreationForm
                        userId={userId}
                        preSelectedOpponent={preSelectedOpponent}
                        onShowVideo={handleShowBattleVideo} // 🆕 Pass callback to show video
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
                    <div className="p-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
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
  );

  return (
    <>
      {/* Modal renderizzato nel body con createPortal */}
      {createPortal(modalContent, document.body)}
      
      {/* 🆕 Battle Video Modal - Managed at this level to prevent unmounting */}
      <BattleVideoModal
        isOpen={showBattleVideo}
        won={battleVideoResult ?? false}
        onClose={handleBattleVideoClose}
      />
      
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
