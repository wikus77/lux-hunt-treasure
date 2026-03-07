/**
 * Battle Defense Modal - Shown to defender when receiving attack notification
 * Two options: CONTROMISURE (defend with weapons) or RESA (surrender)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Flag, Swords, Timer, X, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DefenseInventoryItem {
  inventory_id: string;
  item_id: string;
  code: string;
  name: string;
  power: number;
  rarity: string;
  quantity: number;
}

interface BattleDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  battleId: string;
  attackerName: string;
  attackerAgentCode: string;
  attackerWeaponPower: number;
  stakeAmount: number;
  stakeType: string;
  userId: string;
  timeoutSeconds?: number; // Time to respond
}

const RARITY_COLORS = {
  common: 'border-gray-500/30 bg-gray-500/10',
  rare: 'border-blue-500/30 bg-blue-500/10',
  epic: 'border-purple-500/30 bg-purple-500/10',
  legendary: 'border-yellow-500/30 bg-yellow-500/10',
};

export function BattleDefenseModal({
  isOpen,
  onClose,
  battleId,
  attackerName,
  attackerAgentCode,
  attackerWeaponPower,
  stakeAmount,
  stakeType,
  userId,
  timeoutSeconds = 30,
}: BattleDefenseModalProps) {
  const [defenses, setDefenses] = useState<DefenseInventoryItem[]>([]);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>(null);
  const [selectedDefensePower, setSelectedDefensePower] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const { toast } = useToast();

  // Load user's defense inventory
  useEffect(() => {
    if (!isOpen) return;
    
    const loadDefenses = async () => {
      try {
        setLoading(true);
        const { data, error } = await (supabase.rpc as any)('get_user_battle_inventory');

        if (error) throw error;

        const defenseItems = ((data || []) as any[])
          .filter((item: any) => item.type === 'defense')
          .map((item: any) => ({
            inventory_id: item.inventory_id,
            item_id: item.item_id,
            code: item.code,
            name: item.name,
            power: item.power,
            rarity: item.rarity,
            quantity: item.quantity,
          })) as DefenseInventoryItem[];

        setDefenses(defenseItems);
      } catch (error) {
        console.error('[DefenseModal] Load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDefenses();
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired - auto surrender
          handleSurrender();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Handle CONTROMISURE (defend)
  const handleDefend = useCallback(async () => {
    if (responding) return;
    setResponding(true);

    try {
      // Determine winner based on weapon power
      // Difensore vince SOLO se ha power MAGGIORE dell'attaccante
      // A parità o inferiorità, vince l'attaccante
      const defenderWins = selectedDefensePower > attackerWeaponPower;
      
      console.log(`⚔️ [Battle] Defense: ${selectedDefensePower} vs Attack: ${attackerWeaponPower} → ${defenderWins ? 'DEFENDER WINS' : 'ATTACKER WINS'}`);
      
      // First, get the battle to find the attacker's ID
      const { data: battle, error: battleError } = await supabase
        .from('battle_sessions')
        .select('creator_id')
        .eq('id', battleId)
        .single();
      
      if (battleError) {
        console.error('[DefenseModal] Get battle error:', battleError);
      }
      
      const attackerId = battle?.creator_id;
      
      // Save battle result to database
      const { error: updateError } = await supabase
        .from('battle_sessions')
        .update({
          status: 'resolved',
          winner_id: defenderWins ? userId : attackerId, // Winner's actual ID
          defender_weapon_id: selectedDefenseId,
          defender_weapon_power: selectedDefensePower,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', battleId);

      if (updateError) {
        console.error('[DefenseModal] Update error:', updateError);
      }

      // Update PE for BOTH users
      const peAmount = stakeAmount;
      
      // 1. Update DEFENDER's PE
      const { data: defenderProfile } = await supabase
        .from('profiles')
        .select('pulse_energy')
        .eq('id', userId)
        .single();
      
      const defenderCurrentPE = defenderProfile?.pulse_energy || 0;
      const defenderNewPE = defenderWins 
        ? Math.max(0, defenderCurrentPE + peAmount)  // Won defense: gain PE
        : Math.max(0, defenderCurrentPE - peAmount); // Lost defense: lose PE
      
      await supabase
        .from('profiles')
        .update({ pulse_energy: defenderNewPE })
        .eq('id', userId);
      
      console.log(`⚡ [Defense] Defender PE: ${defenderCurrentPE} → ${defenderNewPE}`);

      // PE fullscreen + Home sync: emit pe:awarded and pe-credit-event when defender gains PE (win)
      if (defenderWins && peAmount > 0) {
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('pe:awarded', {
              detail: {
                success: true,
                oldPE: defenderCurrentPE,
                newPE: defenderNewPE,
                deltaPE: peAmount,
                rankChanged: false,
                action: 'BATTLE_DEFENSE_WIN',
              },
            }));
          }
          const { emitPECreditEvent } = await import('@/features/pulse/peCreditEvent');
          emitPECreditEvent(peAmount, 'battle_defense_win', {
            preValue: defenderCurrentPE,
            postValue: defenderNewPE,
          });
        } catch (_e) {
          // non-blocking
        }
      }
      
      // 2. Update ATTACKER's PE (opposite of defender)
      if (attackerId) {
        const { data: attackerProfile } = await supabase
          .from('profiles')
          .select('pulse_energy')
          .eq('id', attackerId)
          .single();
        
        const attackerCurrentPE = attackerProfile?.pulse_energy || 0;
        const attackerNewPE = defenderWins 
          ? Math.max(0, attackerCurrentPE - peAmount)  // Defender won: attacker loses PE
          : Math.max(0, attackerCurrentPE + peAmount); // Defender lost: attacker gains PE
        
        await supabase
          .from('profiles')
          .update({ pulse_energy: attackerNewPE })
          .eq('id', attackerId);
        
        console.log(`⚡ [Defense] Attacker PE: ${attackerCurrentPE} → ${attackerNewPE}`);
      }

      toast({
        title: defenderWins ? '🛡️ DIFESA RIUSCITA!' : '💥 DIFESA FALLITA!',
        description: defenderWins 
          ? `Hai respinto l'attacco! +${peAmount} PE` 
          : `L'attaccante era troppo forte! -${peAmount} PE`,
        duration: 4000,
      });

      onClose();
    } catch (error) {
      console.error('[DefenseModal] Defense error:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante la difesa',
        variant: 'destructive',
      });
    } finally {
      setResponding(false);
    }
  }, [battleId, userId, selectedDefenseId, selectedDefensePower, attackerWeaponPower, stakeAmount, toast, onClose, responding]);

  // Handle RESA (surrender)
  const handleSurrender = useCallback(async () => {
    if (responding) return;
    setResponding(true);

    try {
      // First, get the battle to find the attacker's ID
      const { data: battle, error: battleError } = await supabase
        .from('battle_sessions')
        .select('creator_id')
        .eq('id', battleId)
        .single();
      
      if (battleError) {
        console.error('[DefenseModal] Get battle error:', battleError);
      }
      
      const attackerId = battle?.creator_id;
      
      // Attacker wins automatically
      const { error: updateError } = await supabase
        .from('battle_sessions')
        .update({
          status: 'resolved',
          winner_id: attackerId, // Attacker wins on surrender
          defender_weapon_id: null,
          defender_weapon_power: 0,
          resolved_at: new Date().toISOString(),
          surrender: true,
        })
        .eq('id', battleId);

      if (updateError) {
        console.error('[DefenseModal] Surrender error:', updateError);
      }

      const peAmount = stakeAmount;
      
      // 1. DEFENDER loses PE (surrender)
      const { data: defenderProfile } = await supabase
        .from('profiles')
        .select('pulse_energy')
        .eq('id', userId)
        .single();
      
      const defenderCurrentPE = defenderProfile?.pulse_energy || 0;
      const defenderNewPE = Math.max(0, defenderCurrentPE - peAmount);
      
      await supabase
        .from('profiles')
        .update({ pulse_energy: defenderNewPE })
        .eq('id', userId);
      
      console.log(`⚡ [Surrender] Defender PE: ${defenderCurrentPE} → ${defenderNewPE}`);
      
      // 2. ATTACKER gains PE (opponent surrendered)
      if (attackerId) {
        const { data: attackerProfile } = await supabase
          .from('profiles')
          .select('pulse_energy')
          .eq('id', attackerId)
          .single();
        
        const attackerCurrentPE = attackerProfile?.pulse_energy || 0;
        const attackerNewPE = Math.max(0, attackerCurrentPE + peAmount);
        
        await supabase
          .from('profiles')
          .update({ pulse_energy: attackerNewPE })
          .eq('id', attackerId);
        
        console.log(`⚡ [Surrender] Attacker PE: ${attackerCurrentPE} → ${attackerNewPE}`);
      }

      toast({
        title: '🏳️ RESA ACCETTATA',
        description: `Ti sei arreso. -${peAmount} PE`,
        duration: 4000,
      });

      onClose();
    } catch (error) {
      console.error('[DefenseModal] Surrender error:', error);
    } finally {
      setResponding(false);
    }
  }, [battleId, userId, stakeAmount, toast, onClose, responding]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[999999]"
            style={{
              top: 'calc(47px + env(safe-area-inset-top, 0px))',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div className="h-full rounded-t-3xl bg-gradient-to-br from-red-950/95 to-[#0a0a0f]/95 backdrop-blur-xl border-t border-x border-red-500/30 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-500/20 animate-pulse">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-bold text-lg text-red-400">⚠️ ATTACCO IN CORSO!</h2>
                    <p className="text-xs text-red-300/70">Rispondi entro il tempo limite</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className={`h-5 w-5 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-orange-400'}`} />
                  <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Attacker Info */}
              <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Swords className="h-8 w-8 text-red-400" />
                    <div>
                      <p className="text-xs text-red-300/70">Attaccante</p>
                      <p className="font-semibold text-red-400">{attackerAgentCode || attackerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-300/70">Potenza Arma</p>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="font-bold text-yellow-400">{attackerWeaponPower}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <Badge variant="destructive" className="text-xs">
                    Posta: {stakeAmount} {stakeType.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Defense Selection */}
              <div className="flex-1 px-4 py-3 overflow-hidden">
                <p className="text-sm text-white/70 mb-3">
                  Seleziona una difesa (potenza &gt; {attackerWeaponPower} per vincere):
                </p>
                
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
                  </div>
                ) : defenses.length === 0 ? (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                    <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-300">Nessuna difesa disponibile!</p>
                    <p className="text-xs text-red-300/70 mt-1">Visita lo Shop per acquistare difese</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {/* No defense option */}
                      <button
                        onClick={() => {
                          setSelectedDefenseId(null);
                          setSelectedDefensePower(0);
                        }}
                        className={`
                          w-full p-3 rounded-lg border text-left transition-all
                          ${selectedDefenseId === null 
                            ? 'border-cyan-500/50 bg-cyan-500/10' 
                            : 'border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Nessuna difesa (Power: 0)</span>
                          <Badge variant="outline" className="text-xs">Base</Badge>
                        </div>
                      </button>

                      {defenses.map((defense) => (
                        <button
                          key={defense.inventory_id}
                          onClick={() => {
                            setSelectedDefenseId(defense.item_id);
                            setSelectedDefensePower(defense.power);
                          }}
                          className={`
                            w-full p-3 rounded-lg border text-left transition-all
                            ${RARITY_COLORS[defense.rarity as keyof typeof RARITY_COLORS] || 'border-white/10'}
                            ${selectedDefenseId === defense.item_id 
                              ? 'ring-2 ring-cyan-500' 
                              : 'hover:border-white/30'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-400" />
                              <span className="text-sm font-semibold">{defense.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1 ${
                                defense.power > attackerWeaponPower ? 'text-green-400' : 'text-orange-400'
                              }`}>
                                <Zap className="h-3 w-3" />
                                <span className="font-bold text-sm">{defense.power}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {defense.rarity}
                              </Badge>
                            </div>
                          </div>
                          {defense.power > attackerWeaponPower && (
                            <p className="text-[10px] text-green-400 mt-1">
                              ✓ Sufficiente per vincere
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 pt-2 space-y-3">
                {/* CONTROMISURE Button */}
                <motion.button
                  className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                  }}
                  onClick={handleDefend}
                  disabled={responding}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className="h-5 w-5" />
                  {responding ? 'ATTIVAZIONE...' : 'CONTROMISURE'}
                  {selectedDefensePower > 0 && (
                    <Badge className="ml-2 bg-green-400/20 text-green-300">
                      Power: {selectedDefensePower}
                    </Badge>
                  )}
                </motion.button>

                {/* RESA Button */}
                <motion.button
                  className="w-full py-3 px-6 rounded-xl font-orbitron font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 text-red-400"
                  onClick={handleSurrender}
                  disabled={responding}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Flag className="h-5 w-5" />
                  {responding ? 'ATTENDERE...' : 'RESA'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

