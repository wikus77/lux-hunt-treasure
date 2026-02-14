/**
 * Battle Shop Pill - Glassmorphism style like M1U Plus button
 * Includes Shop + Inventory tabs
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPillFlipOverlay } from '@/components/map/MapPillFlipOverlay';
import { ShoppingBag, X, Swords, Shield, Package, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BattleShop } from './BattleShop';
import { supabase } from '@/integrations/supabase/client';
import '@/features/m1u/m1u-ui.css'; // Reuse M1U styles

interface InventoryItem {
  inventory_id: string;
  item_id: string;
  type: 'weapon' | 'defense';
  code: string;
  name: string;
  description: string;
  power: number;
  rarity: string;
  quantity: number;
  is_equipped: boolean;
}

interface BattleShopPillProps {
  userId: string;
  className?: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-500/30 bg-gray-500/10',
  rare: 'border-blue-500/30 bg-blue-500/10',
  epic: 'border-purple-500/30 bg-purple-500/10',
  legendary: 'border-yellow-500/30 bg-yellow-500/10',
};

export function BattleShopPill({ userId, className = '' }: BattleShopPillProps) {
  const { t } = useTranslation();
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Load inventory when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadInventory();
    }
  }, [isOpen, userId]);

  const loadInventory = async () => {
    setLoadingInventory(true);
    try {
      const { data, error } = await (supabase.rpc as any)('get_user_battle_inventory');
      if (error) throw error;
      setInventory((data || []) as InventoryItem[]);
    } catch (err) {
      console.error('[BattleShopPill] Inventory load error:', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const weapons = inventory.filter(i => i.type === 'weapon');
  const defenses = inventory.filter(i => i.type === 'defense');
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      {/* Glassmorphism Shop Pill - Same style as M1U Plus */}
      <motion.button
        className={`pill-orb ${className}`}
        onClick={(e) => { setOriginRect(e.currentTarget.getBoundingClientRect()); setIsOpen(true); }}
        aria-label={t('mapPills.arsenal.ariaLabel')}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <ShoppingBag className="w-5 h-5 text-cyan-100" />
        <span className="dot" style={{ background: '#f0f', boxShadow: '0 0 8px #f0f' }} />
        
        {/* Inventory count badge */}
        {totalItems > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-background"
          >
            {totalItems}
          </Badge>
        )}
      </motion.button>

      {/* Shop Modal - MapPillFlipOverlay (NOTE-style) */}
      <MapPillFlipOverlay open={isOpen} originRect={originRect} onClose={() => setIsOpen(false)}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          {/* HEADER - NOTE style */}
          <div style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.8) 0%, rgba(0, 100, 150, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button onClick={() => setIsOpen(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('mapPills.arsenal.title')}</h1>
              </div>
              <div style={{ width: '40px' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('mapPills.arsenal.subtitle')}</p>
          </div>

          {/* Tabs: Shop & Inventory */}
              <Tabs defaultValue="shop" className="w-full flex-1 flex flex-col min-h-0">
                <TabsList className="w-full grid grid-cols-2 mx-4 mt-4 flex-shrink-0" style={{ width: 'calc(100% - 32px)' }}>
                  <TabsTrigger value="shop" className="gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    {t('mapPills.arsenal.tabShop')}
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="gap-2">
                    <Package className="h-4 w-4" />
                    {t('mapPills.arsenal.tabInventory', { count: totalItems })}
                  </TabsTrigger>
                </TabsList>

                {/* Shop Tab */}
                <TabsContent value="shop" className="mt-0 flex-1 min-h-0 overflow-hidden">
                  <div className="p-4 h-full overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
                    <BattleShop userId={userId} />
                  </div>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="mt-0 flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full p-4" style={{ flex: 1, minHeight: 0 }}>
                    {loadingInventory ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                      </div>
                    ) : inventory.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">{t('mapPills.arsenal.emptyTitle')}</p>
                        <p className="text-gray-500 text-xs mt-1">{t('mapPills.arsenal.emptyHint')}</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Weapons Section */}
                        {weapons.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Swords className="h-4 w-4 text-red-400" />
                              <h3 className="text-sm font-semibold text-white">{t('mapPills.arsenal.weapons')}</h3>
                              <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">
                                {weapons.length}
                              </Badge>
                            </div>
                            <div className="grid gap-2">
                              {weapons.map(item => (
                                <div
                                  key={item.inventory_id}
                                  className={`p-3 rounded-lg border ${RARITY_COLORS[item.rarity] || RARITY_COLORS.common}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-white">{item.name}</span>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                          x{item.quantity}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                        <span>Power: <span className="text-cyan-400">{item.power}</span></span>
                                        <span className="capitalize">{item.rarity}</span>
                                      </div>
                                    </div>
                                    {item.is_equipped && (
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                                        {t('mapPills.arsenal.equipped')}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Defenses Section */}
                        {defenses.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Shield className="h-4 w-4 text-cyan-400" />
                              <h3 className="text-sm font-semibold text-white">{t('mapPills.arsenal.defenses')}</h3>
                              <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                                {defenses.length}
                              </Badge>
                            </div>
                            <div className="grid gap-2">
                              {defenses.map(item => (
                                <div
                                  key={item.inventory_id}
                                  className={`p-3 rounded-lg border ${RARITY_COLORS[item.rarity] || RARITY_COLORS.common}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-white">{item.name}</span>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                          x{item.quantity}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                        <span>Power: <span className="text-cyan-400">{item.power}</span></span>
                                        <span className="capitalize">{item.rarity}</span>
                                      </div>
                                    </div>
                                    {item.is_equipped && (
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                                        {t('mapPills.arsenal.equipped')}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
        </div>
      </MapPillFlipOverlay>
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
