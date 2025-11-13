/**
 * Weapon/Defense Selector - Select items for battle from owned inventory
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Swords, Shield, Loader2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InventoryItem {
  inventory_id: string;
  item_id: string;
  type: 'weapon' | 'defense';
  code: string;
  name: string;
  description: string;
  icon_key: string;
  power: number;
  rarity: string;
  quantity: number;
  is_equipped: boolean;
}

interface WeaponDefenseSelectorProps {
  userId: string;
  type: 'weapon' | 'defense';
  selectedItemId: string | null;
  onSelect: (itemId: string | null, itemCode: string | null) => void;
  onOpenShop?: () => void;
}

const RARITY_COLORS = {
  common: 'border-gray-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-yellow-500/30',
};

export function WeaponDefenseSelector({
  userId,
  type,
  selectedItemId,
  onSelect,
  onOpenShop,
}: WeaponDefenseSelectorProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.rpc as any)('get_user_battle_inventory');

      if (error) throw error;

      const filtered = ((data || []) as any[]).filter((item: any) => item.type === type) as InventoryItem[];
      setItems(filtered);
    } catch (error) {
      console.error(`[${type}Selector] Load error:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();

    // Subscribe to inventory changes
    const channel = supabase
      .channel(`${type}-selector-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_battle_items',
          filter: `user_id=eq.${userId}`,
        },
        () => loadInventory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          No {type}s in your inventory
        </p>
        {onOpenShop && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenShop}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            Open Shop
          </Button>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[180px] rounded-lg border border-border/50 p-2">
      <div className="space-y-2">
        {/* None option */}
        <button
          onClick={() => onSelect(null, null)}
          className={`
            w-full p-2 rounded-lg border text-left transition-all
            ${
              selectedItemId === null
                ? 'border-cyan-500/50 bg-cyan-500/10'
                : 'border-border/50 hover:border-border'
            }
          `}
        >
          <div className="text-xs text-muted-foreground">
            No {type} (default)
          </div>
        </button>

        {items.map((item) => (
          <button
            key={item.inventory_id}
            onClick={() => onSelect(item.item_id, item.code)}
            className={`
              w-full p-2 rounded-lg border text-left transition-all
              ${RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || 'border-border/50'}
              ${
                selectedItemId === item.item_id
                  ? 'bg-cyan-500/10 border-cyan-500/50'
                  : 'hover:bg-muted/50'
              }
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {type === 'weapon' ? (
                    <Swords className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <Shield className="h-3 w-3 text-purple-400 flex-shrink-0" />
                  )}
                  <span className="text-xs font-semibold truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    Power: {item.power}
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize">
                    {item.rarity}
                  </Badge>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                x{item.quantity}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
