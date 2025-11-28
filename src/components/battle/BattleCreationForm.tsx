/**
 * Battle Creation Form - Create new TRON battles
 * Flow: Countdown Modal → Close → Map Battle (120s) → Result Modal
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Swords, Zap, Search, Shield, Target } from 'lucide-react';
import { STAKE_TYPES, STAKE_PERCENTS } from '@/lib/battle/constants';
import { WeaponDefenseSelector } from './WeaponDefenseSelector';
import { BattleOverlay } from './BattleOverlay';
import { BattleResultModal } from './BattleResultModal';

interface BattleCreationFormProps {
  userId: string;
  preSelectedOpponent?: { id: string; name: string; lat?: number; lng?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Global event for map battle
export const BATTLE_START_EVENT = 'battle-map-start';
export const BATTLE_END_EVENT = 'battle-map-end';

export interface BattleMapEvent {
  attackerId: string;
  defenderId: string;
  defenderName: string;
  defenderLat: number;
  defenderLng: number;
  weaponCode?: string;
  battleDuration: number; // seconds
}

export function BattleCreationForm({
  userId,
  preSelectedOpponent,
  onSuccess,
  onCancel,
}: BattleCreationFormProps) {
  const [stakeType, setStakeType] = useState<string>('energy');
  const [stakePercent, setStakePercent] = useState<number>(50);
  const [opponentSearch, setOpponentSearch] = useState(preSelectedOpponent?.name || '');
  const [arenaName, setArenaName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  const [selectedWeaponCode, setSelectedWeaponCode] = useState<string | null>(null);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>(null);
  const [selectedDefenseCode, setSelectedDefenseCode] = useState<string | null>(null);
  
  // Battle phases
  const [showCountdown, setShowCountdown] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<{ won: boolean } | null>(null);
  
  const { toast } = useToast();

  // Check if opponent is a FAKE agent
  const isFakeAgent = preSelectedOpponent?.id?.startsWith('fake-agent-');

  const handleCreate = async () => {
    if (!opponentSearch && !preSelectedOpponent) {
      toast({
        title: 'Opponent Required',
        description: 'Please select an opponent',
        variant: 'destructive',
      });
      return;
    }

    // FAKE AGENT: Start countdown
    if (isFakeAgent) {
      setShowCountdown(true);
      return;
    }

    // Real player battle - existing flow
    setIsCreating(true);
    try {
      toast({
        title: '✅ Battle Created!',
        description: 'Waiting for opponent to accept...',
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Battle creation error:', error);
      toast({
        title: 'Creation Failed',
        description: error?.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // When countdown ends → close modal & start battle on map
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    
    // Get defender position from the fake agent data
    // For fake agents, we use their predefined positions
    const defenderLat = preSelectedOpponent?.lat || 0;
    const defenderLng = preSelectedOpponent?.lng || 0;
    
    // Dispatch global event to start battle on map
    const battleEvent: BattleMapEvent = {
      attackerId: userId,
      defenderId: preSelectedOpponent?.id || '',
      defenderName: preSelectedOpponent?.name || 'Unknown',
      defenderLat,
      defenderLng,
      weaponCode: selectedWeaponCode || undefined,
      battleDuration: 15, // 15 seconds for demo (can be 120 for production)
    };
    
    console.log('🚀 [Battle] Dispatching battle start event:', battleEvent);
    window.dispatchEvent(new CustomEvent(BATTLE_START_EVENT, { detail: battleEvent }));
    
    toast({
      title: '🚀 ATTACK LAUNCHED!',
      description: 'Watch the map for your missile!',
    });
  }, [preSelectedOpponent, userId, selectedWeaponCode, toast]);

  // Listen for battle end event from map
  useEffect(() => {
    const handleBattleEnd = (event: CustomEvent<{ won: boolean }>) => {
      console.log('🏁 [Battle] Battle ended:', event.detail);
      setBattleResult(event.detail);
      setShowResult(true);
    };

    window.addEventListener(BATTLE_END_EVENT, handleBattleEnd as EventListener);
    return () => {
      window.removeEventListener(BATTLE_END_EVENT, handleBattleEnd as EventListener);
    };
  }, []);

  const handleResultClose = () => {
    setShowResult(false);
    setBattleResult(null);
    
    if (battleResult?.won) {
      toast({
        title: '🏆 Victory claimed!',
        description: `+${stakePercent}% ${stakeType} earned!`,
      });
    }
    
    onSuccess?.();
  };

  const handleCountdownCancel = () => {
    setShowCountdown(false);
    toast({
      title: 'Attack Cancelled',
      description: 'Battle aborted',
    });
  };

  return (
    <>
      {/* Countdown Modal - Shows 10 second countdown then closes */}
      <BattleOverlay
        isActive={showCountdown}
        attackerName="You"
        defenderName={preSelectedOpponent?.name || 'Unknown'}
        defenderIsFake={isFakeAgent}
        weaponUsed={selectedWeaponCode || undefined}
        stakePercent={stakePercent}
        stakeType={stakeType}
        onCountdownComplete={handleCountdownComplete}
        onCancel={handleCountdownCancel}
      />

      {/* Result Modal - Shows after battle ends */}
      <BattleResultModal
        isOpen={showResult}
        won={battleResult?.won || false}
        attackerName="You"
        defenderName={preSelectedOpponent?.name || 'Unknown'}
        stakePercent={stakePercent}
        stakeType={stakeType}
        onClose={handleResultClose}
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
              onChange={(e) => setArenaName(e.target.value)}
              className="bg-background/50"
            />
          </div>

          {/* Opponent Selection */}
          <div className="space-y-2">
            <Label htmlFor="opponent">Target</Label>
            {preSelectedOpponent ? (
              <div className={`p-3 rounded-lg border ${
                isFakeAgent 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-cyan-500/10 border-cyan-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <Target className={`h-4 w-4 ${isFakeAgent ? 'text-red-400' : 'text-cyan-400'}`} />
                  <p className={`text-sm font-semibold ${isFakeAgent ? 'text-red-400' : 'text-cyan-400'}`}>
                    {preSelectedOpponent.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFakeAgent 
                    ? '🤖 Test Agent - 10s countdown → missile on map!' 
                    : 'Pre-selected agent'}
                </p>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="opponent"
                  placeholder="Search agent code or handle..."
                  value={opponentSearch}
                  onChange={(e) => setOpponentSearch(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            )}
          </div>

          {/* Stake Type */}
          <div className="space-y-2">
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
          <div className="space-y-3">
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
                onSelect={(id, code) => {
                  setSelectedWeaponId(id);
                  setSelectedWeaponCode(code);
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
            disabled={isCreating || showCountdown || (!opponentSearch && !preSelectedOpponent)}
            className={`flex-1 ${
              isFakeAgent 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
            }`}
          >
            {isCreating ? (
              'Creating...'
            ) : isFakeAgent ? (
              <>
                <Target className="mr-2 h-4 w-4" />
                LAUNCH ATTACK!
              </>
            ) : (
              <>
                Create Battle
                <Zap className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
