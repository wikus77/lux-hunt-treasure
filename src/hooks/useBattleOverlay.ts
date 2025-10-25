/**
 * Battle Overlay Hook - Manages deep-link battle overlay state
 * Handles /battle/:battleId deep-links and push notification intents
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface UseBattleOverlayReturn {
  battleId: string | null;
  isOpen: boolean;
  openBattle: (id: string) => void;
  closeBattle: () => void;
}

export function useBattleOverlay(): UseBattleOverlayReturn {
  const [location, setLocation] = useLocation();
  const [battleId, setBattleId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Watch for /battle/:battleId route when on Home
  useEffect(() => {
    const battleMatch = location.match(/^\/battle\/([a-f0-9-]+)$/);
    
    if (battleMatch && location.startsWith('/home')) {
      // User is on Home and a battle deep-link arrived
      const id = battleMatch[1];
      setBattleId(id);
      setIsOpen(true);
    }
  }, [location]);

  // Listen for battle_invite push notifications (read-only)
  useEffect(() => {
    const handleNotificationIntent = (event: CustomEvent) => {
      const { type, battle_id } = event.detail || {};
      
      if (type === 'battle_invite' && battle_id) {
        setBattleId(battle_id);
        setIsOpen(true);
      }
    };

    window.addEventListener('push-notification-intent' as any, handleNotificationIntent);

    return () => {
      window.removeEventListener('push-notification-intent' as any, handleNotificationIntent);
    };
  }, []);

  const openBattle = (id: string) => {
    setBattleId(id);
    setIsOpen(true);
  };

  const closeBattle = () => {
    setIsOpen(false);
    setBattleId(null);
    
    // If we opened from a deep-link, return to home
    if (location.startsWith('/battle/')) {
      setLocation('/home');
    }
  };

  return {
    battleId,
    isOpen,
    openBattle,
    closeBattle,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
