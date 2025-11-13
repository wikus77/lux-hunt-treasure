/**
 * Battle Creation Form - Create new TRON battles with weapon/defense selection
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Swords, Zap, Search, Shield } from 'lucide-react';
import { STAKE_TYPES, STAKE_PERCENTS } from '@/lib/battle/constants';
import { WeaponDefenseSelector } from './WeaponDefenseSelector';

interface BattleCreationFormProps {
  userId: string;
  preSelectedOpponent?: { id: string; name: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BattleCreationForm({
  userId,
  preSelectedOpponent,
  onSuccess,
  onCancel,
}: BattleCreationFormProps) {
  const [stakeType, setStakeType] = useState<string>('energy');
  const [stakePercent, setStakePercent] = useState<number>(25);
  const [opponentSearch, setOpponentSearch] = useState(preSelectedOpponent?.name || '');
  const [arenaName, setArenaName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  const [selectedWeaponCode, setSelectedWeaponCode] = useState<string | null>(null);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>(null);
  const [selectedDefenseCode, setSelectedDefenseCode] = useState<string | null>(null);
  const [showShopTab, setShowShopTab] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!opponentSearch && !preSelectedOpponent) {
      toast({
        title: 'Opponent Required',
        description: 'Please select an opponent',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // TODO: Call battle creation RPC
      // const { data, error } = await supabase.rpc('battle_create', {
      //   opponent_id: preSelectedOpponent?.id || opponentSearch,
      //   stake_type: stakeType,
      //   stake_percentage: stakePercent,
      //   arena_name: arenaName || undefined,
      // });

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

  return (
    <div className="space-y-6">
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
          <Label htmlFor="opponent">Opponent</Label>
          {preSelectedOpponent ? (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-sm font-semibold text-cyan-400">{preSelectedOpponent.name}</p>
              <p className="text-xs text-muted-foreground">Pre-selected agent</p>
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
          <Label>Stake Percentage: {stakePercent}%</Label>
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
              onOpenShop={() => setShowShopTab(true)}
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
              onOpenShop={() => setShowShopTab(true)}
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
            disabled={isCreating}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleCreate}
          disabled={isCreating || (!opponentSearch && !preSelectedOpponent)}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          {isCreating ? 'Creating...' : 'Create Battle'}
          <Zap className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
