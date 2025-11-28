/**
 * Battle Shop - Purchase weapons and defenses with M1U
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Swords, Shield, ShoppingCart, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { supabase } from '@/integrations/supabase/client';

interface BattleItem {
  item_id: string;
  type: 'weapon' | 'defense';
  code: string;
  name: string;
  description: string;
  icon_key: string;
  base_price_m1u: number;
  power: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  min_rank: number;
  max_stack: number;
  is_owned: boolean;
  owned_quantity: number;
  is_equipped: boolean;
}

const RARITY_COLORS = {
  common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  legendary: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

const RARITY_GLOW = {
  common: 'shadow-gray-500/20',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/40',
  legendary: 'shadow-yellow-500/50',
};

export function BattleShop({ userId }: { userId: string }) {
  const [items, setItems] = useState<BattleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();
  const { unitsData, isLoading: m1uLoading, refetch: refetchM1U } = useM1UnitsRealtime(userId);

  const balance = unitsData?.balance || 0;

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.rpc as any)('list_available_battle_items');

      if (error) throw error;

      setItems((data || []) as BattleItem[]);
    } catch (error: any) {
      console.error('[BattleShop] Load error:', error);
      toast({
        title: 'Failed to load shop',
        description: error?.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();

    // Subscribe to inventory changes
    const channel = supabase
      .channel(`battle-shop-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_battle_items',
          filter: `user_id=eq.${userId}`,
        },
        () => loadItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handlePurchase = async (item: BattleItem) => {
    if (balance < item.base_price_m1u) {
      toast({
        title: 'Insufficient M1U',
        description: `You need ${item.base_price_m1u} M1U but only have ${balance} M1U`,
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(item.item_id);
    console.log('[BattleShop] 🛒 Starting purchase:', { item_id: item.item_id, price: item.base_price_m1u, currentBalance: balance });

    try {
      // Try RPC first
      const { data, error } = await (supabase.rpc as any)('purchase_battle_item', {
        p_item_id: item.item_id,
        p_quantity: 1,
      });

      console.log('[BattleShop] 📦 RPC Response:', { data, error });

      if (error) {
        console.error('[BattleShop] ❌ RPC Error:', error);
        
        // FALLBACK: Direct DB operations if RPC fails
        console.log('[BattleShop] 🔄 Trying direct DB fallback...');
        
        // 1. Deduct M1U directly
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            m1_units: balance - item.base_price_m1u,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error('[BattleShop] ❌ Direct update error:', updateError);
          throw updateError;
        }
        
        console.log('[BattleShop] ✅ M1U deducted directly');
        
        // 2. Add to inventory (upsert)
        const { error: inventoryError } = await supabase
          .from('user_battle_items')
          .upsert({
            user_id: userId,
            item_id: item.item_id,
            quantity: (item.owned_quantity || 0) + 1,
            purchased_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,item_id'
          });
        
        if (inventoryError) {
          console.error('[BattleShop] ❌ Inventory error:', inventoryError);
          // Rollback M1U
          await supabase.from('profiles').update({ m1_units: balance }).eq('id', userId);
          throw inventoryError;
        }
        
        console.log('[BattleShop] ✅ Item added to inventory');
        
        // 🔥 Emit event for M1UPill to update immediately
        const newBalance = balance - item.base_price_m1u;
        window.dispatchEvent(new CustomEvent('m1u-spent', {
          detail: {
            amount: item.base_price_m1u,
            newBalance: newBalance,
            reason: 'battle_item_purchase_fallback'
          }
        }));
        
        toast({
          title: '✅ Purchase Complete!',
          description: `${item.name} added to your inventory (-${item.base_price_m1u} M1U)`,
        });
        
        await Promise.all([loadItems(), refetchM1U()]);
        return;
      }

      const result = data as any;
      console.log('[BattleShop] 📊 Result:', result);

      if (!result?.success) {
        throw new Error(result?.error || 'Purchase failed');
      }

      toast({
        title: '✅ Purchase Complete!',
        description: `${item.name} added to your inventory (-${result.total_cost || item.base_price_m1u} M1U)`,
      });

      // 🔥 Emit event for M1UPill to update immediately
      window.dispatchEvent(new CustomEvent('m1u-spent', {
        detail: {
          amount: result.total_cost || item.base_price_m1u,
          newBalance: result.new_balance,
          reason: 'battle_item_purchase'
        }
      }));

      // Reload shop and M1U balance
      await Promise.all([loadItems(), refetchM1U()]);
    } catch (error: any) {
      console.error('[BattleShop] ❌ Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error?.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(null);
    }
  };

  const weapons = items.filter((i) => i.type === 'weapon');
  const defenses = items.filter((i) => i.type === 'defense');

  const renderItem = (item: BattleItem) => (
    <div
      key={item.item_id}
      className={`
        p-4 rounded-lg border bg-gradient-to-br from-background to-background/50
        ${RARITY_COLORS[item.rarity]}
        ${RARITY_GLOW[item.rarity]}
        shadow-lg
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{item.name}</h4>
            {item.is_owned && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 border-green-500/50 text-green-400">
                Owned {item.owned_quantity}x
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1">
          <Swords className="h-3 w-3 text-cyan-400" />
          <span className="text-muted-foreground">Power:</span>
          <span className="font-semibold">{item.power}</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
            {item.rarity}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-cyan-400 font-semibold">
          <Coins className="h-4 w-4" />
          <span>{item.base_price_m1u} M1U</span>
        </div>

        <Button
          size="sm"
          onClick={() => handlePurchase(item)}
          disabled={
            purchasing === item.item_id ||
            balance < item.base_price_m1u ||
            (item.is_owned && item.owned_quantity >= item.max_stack)
          }
          className="h-7 px-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          {purchasing === item.item_id ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Buying...
            </>
          ) : item.is_owned && item.owned_quantity >= item.max_stack ? (
            'Max Stack'
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 mr-1" />
              Buy
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* M1U Balance */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-cyan-500/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Your Balance</span>
          <div className="flex items-center gap-2">
            {m1uLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            ) : (
              <>
                <Coins className="h-5 w-5 text-cyan-400" />
                <span className="text-2xl font-bold text-cyan-400">{balance}</span>
                <span className="text-sm text-muted-foreground">M1U</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Shop Items */}
      <Tabs defaultValue="weapons" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="weapons">
            <Swords className="h-4 w-4 mr-2" />
            Weapons ({weapons.length})
          </TabsTrigger>
          <TabsTrigger value="defenses">
            <Shield className="h-4 w-4 mr-2" />
            Defenses ({defenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weapons">
          <ScrollArea className="h-[400px] pr-2">
            <div className="grid gap-3">
              {weapons.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No weapons available
                </div>
              ) : (
                weapons.map(renderItem)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="defenses">
          <ScrollArea className="h-[400px] pr-2">
            <div className="grid gap-3">
              {defenses.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No defenses available
                </div>
              ) : (
                defenses.map(renderItem)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
