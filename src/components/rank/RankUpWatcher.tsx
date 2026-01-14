/**
 * M1SSION™ — Rank Up Watcher
 * Componente globale che monitora l'avanzamento di grado
 * Mostra il popup video quando l'utente raggiunge un nuovo livello
 * Supporta utenti esistenti che hanno già accumulato PE
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { useHierarchyRank } from '@/hooks/useHierarchyRank';
import { RankUpVideoModal } from './RankUpVideoModal';

/**
 * RankUpWatcher - Montato in App.tsx
 * Monitora i PE dell'utente e mostra il popup di rank up quando necessario
 */
export const RankUpWatcher: React.FC = () => {
  const { pendingRankUp, dismissRankUp, isLoading } = useHierarchyRank();

  // Non mostrare nulla durante il caricamento
  if (isLoading) return null;

  // Se c'è un rank up pendente, mostra il modal
  if (pendingRankUp) {
    console.log(`[RankUpWatcher] 🎖️ Showing rank up modal for: ${pendingRankUp.name}`);
    
    return (
      <RankUpVideoModal
        isOpen={true}
        newRank={pendingRankUp}
        onComplete={dismissRankUp}
      />
    );
  }

  return null;
};

export default RankUpWatcher;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

