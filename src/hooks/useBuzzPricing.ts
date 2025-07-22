// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Pricing Logic Hook - ORDINE DIREZIONE 22/07/2025

import { useMemo } from 'react';

/**
 * Hook centralizzato per la logica dei prezzi BUZZ
 * ORDINE DIREZIONE: Nessun limite giornaliero, prezzi progressivi
 */
export const useBuzzPricing = () => {
  
  /**
   * Calcola il prezzo BUZZ basato sul numero di click giornalieri
   * LOGICA ORDINE DIREZIONE:
   * - Click 1-10: €1.99 ciascuno
   * - Click 11-20: €3.99 ciascuno  
   * - Click 21-30: €5.99 ciascuno
   * - Click 31-40: €7.99 ciascuno
   * - Click 41-50: €9.99 ciascuno
   * - DAL Click 51+: €10.99 ciascuno
   */
  const getCurrentBuzzPrice = useMemo(() => {
    return (dailyCount: number): number => {
      console.log('💰 BUZZ PRICING CALCULATION', { dailyCount });
      
      if (dailyCount <= 10) return 1.99;
      if (dailyCount <= 20) return 3.99;
      if (dailyCount <= 30) return 5.99;
      if (dailyCount <= 40) return 7.99;
      if (dailyCount <= 50) return 9.99;
      return 10.99; // DAL Click 51+: €10.99 ciascuno - ORDINE DIREZIONE
    };
  }, []);

  /**
   * Calcola i dettagli del pricing per UI
   */
  const getPricingDetails = useMemo(() => {
    return (dailyCount: number) => {
      const currentPrice = getCurrentBuzzPrice(dailyCount);
      const nextPrice = getCurrentBuzzPrice(dailyCount + 1);
      
      let priceRange = '';
      if (dailyCount <= 10) priceRange = '1-10';
      else if (dailyCount <= 20) priceRange = '11-20';
      else if (dailyCount <= 30) priceRange = '21-30';
      else if (dailyCount <= 40) priceRange = '31-40';
      else if (dailyCount <= 50) priceRange = '41-50';
      else priceRange = '51+';
      
      return {
        currentPrice,
        nextPrice,
        priceRange,
        isBlocked: false, // MAI BLOCCATO - ORDINE DIREZIONE
        dailyCount,
        isUnlimited: dailyCount >= 51
      };
    };
  }, [getCurrentBuzzPrice]);

  /**
   * Valida se un prezzo è corretto per il numero di click
   */
  const validateBuzzPrice = useMemo(() => {
    return (dailyCount: number, expectedPrice: number): boolean => {
      const correctPrice = getCurrentBuzzPrice(dailyCount);
      return Math.abs(correctPrice - expectedPrice) < 0.01; // Tolleranza centesimi
    };
  }, [getCurrentBuzzPrice]);

  return {
    getCurrentBuzzPrice,
    getPricingDetails,
    validateBuzzPrice
  };
};

/**
 * Hook per compatibilità con i componenti esistenti
 */
export const useBuzzPrice = (dailyCount: number) => {
  const { getCurrentBuzzPrice, getPricingDetails } = useBuzzPricing();
  
  const price = getCurrentBuzzPrice(dailyCount);
  const details = getPricingDetails(dailyCount);
  
  return {
    currentPrice: price,
    isBlocked: false, // MAI BLOCCATO - ORDINE DIREZIONE
    details
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - ORDINE DIREZIONE 22/07/2025
 */