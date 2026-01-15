/**
 * Battle Creation Form - Create new TRON battles
 * Flow: LAUNCH ATTACK → Send Push to Defender → Wait for response → Video result
 * 
 * LOGICA CORRETTA:
 * - Attaccante lancia attacco → countdown → "ATTIVA ATTACCO"
 * - Per NPC/Fake: risultato casuale immediato + video + PE aggiornato
 * - Per Agenti REALI: 
 *   - Salviamo battaglia nel DB con status "pending"
 *   - Inviamo push notification al difensore
 *   - Attaccante vede "In attesa risposta..." con subscription real-time
 *   - Quando difensore risponde, DB viene aggiornato con winner_id
 *   - Attaccante riceve aggiornamento real-time e mostra video VERO
 * 
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Swords, Search, Shield, Target, X, Loader2, User } from 'lucide-react';
import { STAKE_TYPES, STAKE_PERCENTS } from '@/lib/battle/constants';
import { WeaponDefenseSelector } from './WeaponDefenseSelector';
import { BattleOverlay } from './BattleOverlay';
import { sendBattleInvite, checkUserHasPushSubscription } from '@/lib/battle/pushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAwardPE } from '@/features/pulse/hooks/useAwardPE';

// Tipo per risultati ricerca
interface SearchResult {
  id: string;
  username: string | null;
  agent_code: string | null;
}

interface BattleCreationFormProps {
  userId: string;
  preSelectedOpponent?: { id: string; name: string; lat?: number; lng?: number };
  onShowVideo?: (won: boolean) => void; // 🆕 Callback to show video (managed by parent)
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Global event for map battle (kept for backwards compatibility)
export const BATTLE_START_EVENT = 'battle-map-start';
export const BATTLE_END_EVENT = 'battle-map-end';

export function BattleCreationForm({
  userId,
  preSelectedOpponent,
  onShowVideo, // 🆕 Callback to show video (managed by parent)
  onSuccess,
  onCancel,
}: BattleCreationFormProps) {
  const [stakeType, setStakeType] = useState<string>('energy');
  const [stakePercent, setStakePercent] = useState<number>(50);
  const [opponentSearch, setOpponentSearch] = useState('');
  const [arenaName, setArenaName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  const [selectedWeaponCode, setSelectedWeaponCode] = useState<string | null>(null);
  const [selectedWeaponPower, setSelectedWeaponPower] = useState<number>(0);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>(null);
  const [selectedDefenseCode, setSelectedDefenseCode] = useState<string | null>(null);
  
  // 🆕 Ricerca agenti
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<{ id: string; name: string } | null>(
    preSelectedOpponent ? { id: preSelectedOpponent.id, name: preSelectedOpponent.name } : null
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🆕 Push notification status
  const [opponentHasPush, setOpponentHasPush] = useState<boolean | null>(null);
  const [checkingPush, setCheckingPush] = useState(false);
  
  // Battle phases
  const [showCountdown, setShowCountdown] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [battleResult, setBattleResult] = useState<{ won: boolean } | null>(null);
  const [currentBattleId, setCurrentBattleId] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // 🔋 PE System Hook
  const { awardPE } = useAwardPE();
  
  // 🆕 Effettua ricerca quando l'utente digita (debounced)
  useEffect(() => {
    // Se c'è già un opponent preselezionato o selezionato, non cercare
    if (preSelectedOpponent || selectedOpponent) {
      setSearchResults([]);
      return;
    }
    
    // Cancella timeout precedente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Se la ricerca è vuota o troppo corta, non cercare
    if (!opponentSearch || opponentSearch.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    // Debounce: aspetta 300ms prima di cercare
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchTerm = opponentSearch.trim();
        console.log('🔍 [Battle] Searching for:', searchTerm, 'userId:', userId);
        
        // 🆕 Usa RPC function che bypassa RLS
        const { data, error } = await (supabase as any).rpc('search_agents_for_battle', {
          search_term: searchTerm,
          exclude_user_id: userId,
          max_results: 5
        });
        
        console.log('🔍 [Battle] RPC response:', { data, error });
        
        if (error) {
          console.error('❌ [Battle] Search RPC error:', error.message, error.details, error.hint);
          
          // Fallback: prova query diretta su public_profiles
          console.log('🔄 [Battle] Trying fallback query...');
          const { data: fallbackData, error: fallbackError } = await (supabase as any)
            .from('public_profiles')
            .select('id, nickname, agent_code')
            .or(`nickname.ilike.%${searchTerm}%,agent_code.ilike.%${searchTerm}%`)
            .limit(5);
          
          console.log('🔄 [Battle] Fallback response:', { fallbackData, fallbackError });
          
          if (fallbackError) {
            console.error('❌ [Battle] Fallback error:', fallbackError);
            setSearchResults([]);
          } else {
            // Map nickname → username per compatibilità
            const mapped = (fallbackData || []).map((r: any) => ({
              id: r.id,
              username: r.nickname || r.agent_code,
              agent_code: r.agent_code
            }));
            setSearchResults(mapped);
          }
        } else {
          console.log('✅ [Battle] Search results for "' + searchTerm + '":', (data || []).length, data);
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('❌ [Battle] Search exception:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [opponentSearch, userId, preSelectedOpponent, selectedOpponent]);
  
  // 🆕 Seleziona un agente dai risultati
  const handleSelectAgent = (agent: SearchResult) => {
    const displayName = agent.username || agent.agent_code || `Agent ${agent.id.slice(0, 6)}`;
    setSelectedOpponent({ id: agent.id, name: displayName });
    setOpponentSearch('');
    setSearchResults([]);
  };
  
  // 🆕 Rimuovi selezione
  const handleClearSelection = () => {
    setSelectedOpponent(null);
    setOpponentSearch('');
  };

  // 🆕 L'opponent effettivo è: preSelectedOpponent (da marker) OPPURE selectedOpponent (da ricerca)
  const effectiveOpponent = preSelectedOpponent || selectedOpponent;
  
  // Check if opponent is a FAKE agent (include ALL fake types: fake-agent-X, AG-NPC-XXXX, npc-X)
  const isFakeAgent = effectiveOpponent?.id?.startsWith('fake-agent-') || 
                      effectiveOpponent?.id?.startsWith('AG-NPC-') ||
                      effectiveOpponent?.id?.startsWith('npc-');
  
  // 🆕 Check push subscription quando cambia l'avversario
  useEffect(() => {
    const checkPush = async () => {
      if (!effectiveOpponent?.id || isFakeAgent) {
        setOpponentHasPush(null);
        return;
      }
      
      // Verifica se è un UUID valido (agente reale)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveOpponent.id);
      if (!isUUID) {
        setOpponentHasPush(null);
        return;
      }
      
      setCheckingPush(true);
      try {
        const hasPush = await checkUserHasPushSubscription(effectiveOpponent.id);
        setOpponentHasPush(hasPush);
        console.log(`📱 [Battle] ${effectiveOpponent.name} push status:`, hasPush ? '✅ ATTIVE' : '❌ NON ATTIVE');
      } catch (err) {
        console.error('[Battle] Push check error:', err);
        setOpponentHasPush(null);
      } finally {
        setCheckingPush(false);
      }
    };
    
    checkPush();
  }, [effectiveOpponent?.id, isFakeAgent]);

  const handleCreate = async () => {
    if (!effectiveOpponent) {
      toast({
        title: 'Opponent Required',
        description: 'Please search and select an opponent',
        variant: 'destructive',
      });
      return;
    }

    // Check if it's a real agent (not fake and not NPC) → send push notification
    const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const isRealAgent = effectiveOpponent.id && 
      !effectiveOpponent.id.startsWith('fake-agent-') && 
      !effectiveOpponent.id.startsWith('AG-NPC-') &&
      !effectiveOpponent.id.startsWith('npc-') &&
      isUUID(effectiveOpponent.id);
    
    console.log('🔍 [Battle] Opponent check:', {
      id: effectiveOpponent.id,
      name: effectiveOpponent.name,
      isRealAgent,
      source: preSelectedOpponent ? 'marker' : 'search',
    });

    // 🆕 SEMPRE crea un battleId e salva nel DB (per tracciare paese)
    const battleId = crypto.randomUUID();
    setCurrentBattleId(battleId);
    
    // 🔔 Send push notification ONLY to real agents
    if (isRealAgent && effectiveOpponent.id) {
      try {
        // Get attacker's agent code
        const { data: attackerProfile } = await (supabase as any)
          .from('profiles')
          .select('agent_code, nickname, full_name')
          .eq('id', userId)
          .single();
        
        const attackerName = attackerProfile?.nickname || attackerProfile?.full_name || 'Unknown';
        const attackerAgentCode = attackerProfile?.agent_code || attackerName;
        
        // 📤 MANDA LA PUSH PRIMA DI TUTTO - sempre!
        console.log('📤 [Battle] Sending push notification FIRST to:', effectiveOpponent.name);
        const pushResult = await sendBattleInvite(
          effectiveOpponent.id,
          battleId,
          attackerName,
          attackerAgentCode,
          stakeType,
          stakePercent,
          arenaName || undefined,
          selectedWeaponPower
        );
        
        if (pushResult.success && pushResult.sent && pushResult.sent > 0) {
          console.log('✅ [Battle] Push sent to:', effectiveOpponent.name);
          toast({
            title: '📤 Notifica Inviata!',
            description: `${effectiveOpponent.name} è stato avvisato dell'attacco`,
            duration: 2000,
          });
        } else {
          console.warn('⚠️ [Battle] Push not delivered:', pushResult.error);
          toast({
            title: '⚠️ Notifica non consegnata',
            description: pushResult.error || `${effectiveOpponent.name} non ha le notifiche push attive. L'attacco procede comunque.`,
            duration: 4000,
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        console.error('[Battle] Push error:', err);
      }
    } else {
      console.log('🤖 [Battle] NPC/Fake agent - no push notification needed');
    }
    
    // 💾 Salva in battle_sessions SOLO per agenti REALI (defender_id deve essere UUID valido!)
    // Per Fake Agents, la registrazione avviene SOLO tramite RPC log_battle_result
    if (isRealAgent) {
      console.log('💾 [Battle] Saving battle session for REAL agent...', {
        battleId,
        defenderId: effectiveOpponent.id,
      });
      
      try {
        const { error: insertError } = await (supabase as any)
          .from('battle_sessions')
          .insert({
            id: battleId,
            creator_id: userId,
            defender_id: effectiveOpponent.id,
            status: 'pending',
            stake_type: stakeType,
            stake_amount: stakePercent,
            arena_name: arenaName || null,
            attacker_weapon_power: selectedWeaponPower,
            attacker_weapon_id: selectedWeaponId,
            arena_lat: preSelectedOpponent?.lat || null,
            arena_lng: preSelectedOpponent?.lng || null,
          });
        
        if (insertError) {
          console.error('[Battle] DB insert error (non-blocking):', insertError);
        } else {
          console.log('✅ [Battle] Battle session saved:', battleId);
        }
      } catch (err: any) {
        console.error('[Battle] DB save error:', err);
      }
    } else {
      console.log('🤖 [Battle] Fake Agent - skipping battle_sessions (no valid UUID)');
    }

    // Start countdown
    console.log('🚀 [Battle] Starting countdown for opponent:', effectiveOpponent.name);
    setShowCountdown(true);
  };

  // 🔥 VELOCE: Attacco parte SUBITO - niente attesa!
  // Risultato basato sui POWER delle armi: chi ha power maggiore VINCE
  // Se attaccante non ha arma (power 0) e difensore non può difendersi → 65% win rate
  // 🤖 FAKE AGENTS: Vincono ~33% delle volte (attaccante vince ~67%)
  const handleCountdownComplete = useCallback(async () => {
    // 🔍 DEBUG LOG IMMEDIATO
    console.log('🚀🚀🚀 [Battle] handleCountdownComplete CALLED! 🚀🚀🚀');
    console.log('🔍 [Battle] preSelectedOpponent at start:', JSON.stringify(preSelectedOpponent));
    
    // Close countdown
    setShowCountdown(false);
    
    // 🎯 Determina risultato basato sui power E tipo avversario
    let winChance: number;
    
    if (isFakeAgent) {
      // 🤖 Fake Agent: Attaccante vince ~67%, Fake Agent vince ~33%
      // Con bonus arma: max +15% (quindi 67-82% per attaccante)
      const weaponBonus = Math.min(selectedWeaponPower, 15);
      winChance = 67 + weaponBonus;
    } else {
      // 👤 Real Agent: Formula originale
      // Se l'attaccante ha arma con power > 0, ha più probabilità di vincere
      // Formula: base 50% + bonus per power arma (max +40%)
      const weaponBonus = Math.min(selectedWeaponPower * 2, 40);
      winChance = 50 + weaponBonus;
    }
    
    const won = Math.random() * 100 < winChance;
    
    console.log(`⚔️ [Battle] Attack result: ${isFakeAgent ? '🤖 Fake Agent' : '👤 Real Agent'}, weapon power ${selectedWeaponPower}, win chance ${winChance}%, won: ${won}`);
    
    setBattleResult({ won });
    
    // Mostra video SUBITO
    if (onShowVideo) {
      onShowVideo(won);
    } else {
      setShowVideo(true);
    }
    
    // Aggiorna PE SUBITO
    try {
      const peAmount = stakePercent;
      
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('pulse_energy')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('[Battle] Error fetching profile:', fetchError);
      } else {
        const currentPE = profile?.pulse_energy || 0;
        const newPE = won 
          ? Math.max(0, currentPE + peAmount)
          : Math.max(0, currentPE - peAmount);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ pulse_energy: newPE })
          .eq('id', userId);
        
        if (updateError) {
          console.error('[Battle] Error updating PE:', updateError);
        } else {
          console.log(`⚡ [Battle] PE ${won ? 'gained' : 'lost'}: ${currentPE} → ${newPE} (${won ? '+' : '-'}${peAmount})`);
        }
      }
      
      // 🆕 Per agenti REALI: aggiorna anche il risultato nel DB
      // Skip per Fake Agents (non hanno record in battle_sessions)
      if (currentBattleId && !isFakeAgent) {
        await (supabase as any)
          .from('battle_sessions')
          .update({
            status: 'resolved',
            winner_id: won ? userId : effectiveOpponent?.id,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', currentBattleId);
      }
    } catch (err) {
      console.error('[Battle] PE update error:', err);
    }
    
    toast({
      title: won ? '⚔️ +' + stakePercent + ' PE' : '🛡️ -' + stakePercent + ' PE',
      description: won ? 'Vittoria!' : 'Sconfitta!',
      duration: 2000,
    });

    // 🏴 DOMINATION: Registra TUTTE le battaglie (vittorie E sconfitte) per territorio
    console.log('🏴 [Battle] FORENSE - preSelectedOpponent:', JSON.stringify(preSelectedOpponent));
    console.log('🏴 [Battle] FORENSE - has lat/lng:', !!preSelectedOpponent?.lat, !!preSelectedOpponent?.lng);
    
    if (preSelectedOpponent?.lat && preSelectedOpponent?.lng) {
      console.log('🏴 [Battle] ✅ Calling log_battle_result RPC...', {
        lat: preSelectedOpponent.lat,
        lng: preSelectedOpponent.lng,
        opponent: effectiveOpponent?.id,
        isFakeAgent,
        won
      });
      
      try {
        const rpcParams = {
          p_user_id: userId,
          p_opponent_id: effectiveOpponent?.id || 'unknown',
          p_lat: preSelectedOpponent.lat,
          p_lng: preSelectedOpponent.lng,
          p_is_pvp: !isFakeAgent,
          p_won: won
        };
        console.log('🏴 [Battle] RPC params:', JSON.stringify(rpcParams));
        
        const { data: logResult, error: logError } = await (supabase as any).rpc('log_battle_result', rpcParams);
        
        console.log('🏴 [Battle] RPC response - data:', JSON.stringify(logResult));
        console.log('🏴 [Battle] RPC response - error:', logError ? JSON.stringify(logError) : 'null');
        
        if (logError) {
          console.error('🚨🚨🚨 [Battle] log_battle_result SUPABASE ERROR:', logError);
          alert(`❌ ERRORE RPC: ${JSON.stringify(logError)}`);  // DEBUG VISIVO
          toast({
            title: '⚠️ Errore registrazione',
            description: logError.message || 'Battaglia non registrata',
            duration: 4000,
            variant: 'destructive',
          });
        } else {
          console.log('🏴 [Battle] ✅ Battle logged - FULL RESPONSE:', JSON.stringify(logResult, null, 2));
          const result = logResult as { success?: boolean; country_name?: string; country_code?: string; is_win?: boolean; error?: string } | null;
          
          // 🔔 DEBUG: ALERT per vedere il risultato
          if (result?.success === true) {
            console.log(`✅✅✅ BATTAGLIA SALVATA! Paese: ${result.country_name} (${result.country_code})`);
          } else if (result?.success === false) {
            alert(`❌ RPC success=false: ${result.error}`);  // DEBUG VISIVO
          }
          
          if (result?.success === false) {
            console.error('🚨🚨🚨 [Battle] RPC returned success=false:', result.error);
            toast({
              title: '⚠️ Errore DB',
              description: result.error || 'Errore sconosciuto',
              duration: 4000,
              variant: 'destructive',
            });
          } else if (result?.country_name) {
            toast({
              title: result.is_win ? `🏴 ${result.country_name}` : `⚔️ ${result.country_name}`,
              description: result.is_win ? '+1 conquista!' : 'Sconfitta registrata',
              duration: 3000,
            });
          }
        }
      } catch (err: any) {
        console.error('🏴 [Battle] ❌ Domination log exception:', err);
        toast({
          title: '⚠️ Errore',
          description: err?.message || 'Eccezione durante registrazione',
          duration: 4000,
          variant: 'destructive',
        });
      }
    } else {
      console.error('🏴 [Battle] ❌ Cannot log battle - NO COORDINATES!', {
        preSelectedOpponent,
        hasLat: !!preSelectedOpponent?.lat,
        hasLng: !!preSelectedOpponent?.lng
      });
      toast({
        title: '⚠️ Coordinate mancanti',
        description: 'Battaglia non registrata per dominio',
        duration: 4000,
        variant: 'destructive',
      });
    }

    // 🔋 Award PE for Tron Battle (Win: +50, Lose: -100)
    if (won) {
      awardPE('BATTLE_WIN', undefined, {
        battleId: currentBattleId,
        opponentId: effectiveOpponent?.id,
        weaponPower: selectedWeaponPower,
      }).catch(err => console.warn('[PE] Battle win award failed:', err));
    } else {
      awardPE('BATTLE_LOSE', undefined, {
        battleId: currentBattleId,
        opponentId: effectiveOpponent?.id,
        weaponPower: selectedWeaponPower,
      }).catch(err => console.warn('[PE] Battle lose award failed:', err));
    }
  }, [stakePercent, selectedWeaponPower, toast, onShowVideo, userId, effectiveOpponent, currentBattleId, awardPE, isFakeAgent, preSelectedOpponent]);

  // 🆕 When video ends - NO MORE result modal popup (animazione è nel video modal)
  const handleVideoClose = useCallback(() => {
    setShowVideo(false);
    // 🔥 RIMOSSO: setShowResult(true) - non mostriamo più il popup separato
    // L'animazione di vittoria/sconfitta è già nel BattleVideoModal
    setBattleResult(null);
    onSuccess?.();
  }, [onSuccess]);

  const handleCountdownCancel = () => {
    setShowCountdown(false);
    toast({
      title: 'Attack Cancelled',
      description: 'Battle aborted',
    });
  };

  return (
    <>
      {/* Countdown Modal - Shows 10 second countdown then "ATTIVA ATTACCO" button */}
      <BattleOverlay
        isActive={showCountdown}
        attackerName="You"
        defenderName={effectiveOpponent?.name || 'Unknown'}
        defenderIsFake={isFakeAgent}
        weaponUsed={selectedWeaponCode || undefined}
        stakePercent={stakePercent}
        stakeType={stakeType}
        onCountdownComplete={handleCountdownComplete}
        onCancel={handleCountdownCancel}
      />

      <div className="space-y-6 relative">
        <div className="space-y-4">
          {/* Arena Name */}
          <div className="space-y-2">
            <Label htmlFor="arena-name">Arena Name (optional)</Label>
            <Input
              id="arena-name"
              placeholder="e.g., Downtown Showdown"
              value={arenaName}
              onChange={(e) => { e.stopPropagation(); setArenaName(e.target.value); }}
              className="bg-background/50"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onKeyPress={(e) => e.stopPropagation()}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          {/* Opponent Selection */}
          <div className="space-y-2">
            <Label htmlFor="opponent">Target</Label>
            {effectiveOpponent ? (
              /* Mostra l'opponent selezionato (da marker O da ricerca) */
              <div className={`p-3 rounded-lg border ${
                isFakeAgent 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-cyan-500/10 border-cyan-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className={`h-4 w-4 ${isFakeAgent ? 'text-red-400' : 'text-cyan-400'}`} />
                    <p className={`text-sm font-semibold ${isFakeAgent ? 'text-red-400' : 'text-cyan-400'}`}>
                      {effectiveOpponent.name}
                    </p>
                  </div>
                  {/* Pulsante per rimuovere selezione (solo se NON è preSelectedOpponent) */}
                  {!preSelectedOpponent && (
                    <button
                      onClick={handleClearSelection}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                      title="Cambia target"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFakeAgent 
                    ? '🤖 Test Agent - 10s countdown → missile on map!' 
                    : preSelectedOpponent ? 'Pre-selected agent' : '✅ Target selezionato'}
                </p>
                {/* 🆕 Indicatore stato notifiche push */}
                {!isFakeAgent && (
                  <div className="mt-1.5">
                    {checkingPush ? (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifica notifiche...
                      </span>
                    ) : opponentHasPush === true ? (
                      <span className="text-[10px] text-green-400 flex items-center gap-1">
                        🔔 Notifiche attive - riceverà l'attacco
                      </span>
                    ) : opponentHasPush === false ? (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        ⚠️ Notifiche disattivate - potrebbe non ricevere l'avviso
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              /* Campo di ricerca */
              <div className="relative" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="opponent"
                  placeholder="Cerca per nome o codice agente..."
                  value={opponentSearch}
                  onChange={(e) => { e.stopPropagation(); setOpponentSearch(e.target.value); }}
                  className="pl-10 bg-background/50"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onKeyPress={(e) => e.stopPropagation()}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  enterKeyHint="search"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
                )}
                
                {/* Risultati ricerca */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchResults.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleSelectAgent(agent)}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-cyan-500/10 transition-colors text-left"
                      >
                        <User className="h-4 w-4 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {agent.username || agent.agent_code || `Agent ${agent.id.slice(0, 6)}`}
                          </p>
                          {agent.agent_code && agent.username && (
                            <p className="text-xs text-muted-foreground">{agent.agent_code}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Messaggio nessun risultato */}
                {opponentSearch.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Nessun agente trovato per "{opponentSearch}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stake Type */}
          <div className="space-y-2" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <Label htmlFor="stake-type">Stake Type</Label>
            <Select value={stakeType} onValueChange={setStakeType}>
              <SelectTrigger id="stake-type" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAKE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stake Percentage */}
          <div className="space-y-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <Label>Stake: {stakePercent}%</Label>
            <Slider
              value={[stakePercent]}
              onValueChange={(vals) => setStakePercent(vals[0])}
              min={25}
              max={75}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STAKE_PERCENTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setStakePercent(p)}
                  className={`px-2 py-1 rounded ${
                    stakePercent === p ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-muted'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Weapon/Defense Selection */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>
                <Swords className="inline h-3 w-3 mr-1" />
                Weapon (optional)
              </Label>
              <WeaponDefenseSelector
                userId={userId}
                type="weapon"
                selectedItemId={selectedWeaponId}
                onSelect={(id, code, power) => {
                  setSelectedWeaponId(id);
                  setSelectedWeaponCode(code);
                  setSelectedWeaponPower(power || 0); // 🆕 Track power
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Shield className="inline h-3 w-3 mr-1" />
                Defense (optional)
              </Label>
              <WeaponDefenseSelector
                userId={userId}
                type="defense"
                selectedItemId={selectedDefenseId}
                onSelect={(id, code) => {
                  setSelectedDefenseId(id);
                  setSelectedDefenseCode(code);
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isCreating || showCountdown}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleCreate}
            disabled={isCreating || showCountdown || !effectiveOpponent}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            {isCreating ? (
              'Creating...'
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                LAUNCH ATTACK!
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
