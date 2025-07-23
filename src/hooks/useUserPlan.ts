// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useMemo } from 'react';
import { useI18n } from '@/intl/useI18n';
import { useUserSync } from '@/hooks/useUserSync';
import plansConfig from '@/config/plans.config.json';

interface PlanInfo {
  id: string;
  label: string;
  price: number;
  cluesPerWeek: number;
  accessoAnticipatoOre: number;
  supporto: string;
  note: string;
}

interface UseUserPlanReturn {
  planInfo: PlanInfo | null;
  planLabel: string;
  cluesMax: number;
  accessoAnticipato: number;
  supportType: string;
  planNote: string;
  isPremium: boolean;
  isBase: boolean;
  isSilver: boolean;
  isGold: boolean;
  isBlack: boolean;
  isTitanium: boolean;
  planPrice: number;
  loading: boolean;
  canAccessApp: boolean;
  accessStartsAt: string | null;
}

/**
 * Hook unificato per gestire il piano dell'utente con sincronizzazione totale
 * Legge direttamente dallo stato sincronizzato e restituisce i dati completi
 */
export const useUserPlan = (): UseUserPlanReturn => {
  const { currentLang } = useI18n();
  const { syncState } = useUserSync();
  
  const planInfo = useMemo((): PlanInfo | null => {
    if (!syncState.plan) return null;
    
    // Normalizza il nome del piano per il matching con plans.config.json
    const normalizedPlan = syncState.plan.toLowerCase();
    const planConfig = plansConfig.find(plan => plan.id === normalizedPlan);
    if (!planConfig) return null;
    
    return {
      id: planConfig.id,
      label: planConfig.label[currentLang] || planConfig.label.en,
      price: planConfig.price,
      cluesPerWeek: planConfig.cluesPerWeek,
      accessoAnticipatoOre: planConfig.accessoAnticipatoOre,
      supporto: planConfig.supporto,
      note: planConfig.note[currentLang] || planConfig.note.en
    };
  }, [syncState.plan, currentLang]);
  
  const planLabel = planInfo?.label || '';
  const cluesMax = planInfo?.cluesPerWeek || 0;
  const accessoAnticipato = planInfo?.accessoAnticipatoOre || 0;
  const supportType = planInfo?.supporto || 'email';
  const planNote = planInfo?.note || '';
  const planPrice = planInfo?.price || 0;
  
  // Determina tipo di piano (normalizzato)
  const currentPlan = syncState.plan?.toLowerCase() || 'base';
  const isPremium = currentPlan !== 'base';
  const isBase = currentPlan === 'base';
  const isSilver = currentPlan === 'silver';
  const isGold = currentPlan === 'gold';
  const isBlack = currentPlan === 'black';
  const isTitanium = currentPlan === 'titanium';
  
  return {
    planInfo,
    planLabel,
    cluesMax,
    accessoAnticipato,
    supportType,
    planNote,
    isPremium,
    isBase,
    isSilver,
    isGold,
    isBlack,
    isTitanium,
    planPrice,
    loading: syncState.isLoading,
    canAccessApp: syncState.canAccessApp,
    accessStartsAt: syncState.lastPlanChange
  };
};