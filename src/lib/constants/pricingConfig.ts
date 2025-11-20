// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// CENTRALE PREZZI UFFICIALI - FONTE UNICA DI VERITÀ

import { formatM1U, eurToM1U } from '@/utils/formatM1U';

/**
 * Configurazione prezzi M1SSION™ - SINCRONIZZAZIONE TOTALE
 * FRONTEND: Display in M1U
 * BACKEND: Stripe usa EUR (conversione automatica)
 */
export const PRICING_CONFIG = {
  Base: {
    priceEur: 0,
    priceCents: 0,
    priceM1U: 0,
    displayPrice: "0 M1U",
    label: "Base - Gratis",
    features: [
      "Funzioni base (accesso alla missione con restrizioni)",
      "Supporto email standard", 
      "1 indizio settimanale base"
    ],
    limitations: [
      "Nessun accesso anticipato agli eventi",
      "Nessun badge esclusivo"
    ],
    earlyAccess: 0
  },
  Silver: {
    priceEur: 3.99,
    priceCents: 399,
    priceM1U: eurToM1U(3.99),
    displayPrice: formatM1U(3.99),
    label: "Silver",
    features: [
      "Tutti i vantaggi Base",
      "3 indizi premium aggiuntivi a settimana",
      "Accesso anticipato di 2 ore agli eventi", 
      "Badge Silver nel profilo"
    ],
    earlyAccess: 2
  },
  Gold: {
    priceEur: 6.99,
    priceCents: 699,
    priceM1U: eurToM1U(6.99),
    displayPrice: formatM1U(6.99),
    label: "Gold", 
    features: [
      "Tutti i vantaggi Silver",
      "4 indizi premium aggiuntivi a settimana",
      "Accesso anticipato di 12 ore agli eventi",
      "Partecipazione alle estrazioni Gold",
      "Badge Gold esclusivo nel profilo"
    ],
    earlyAccess: 12
  },
  Black: {
    priceEur: 9.99,
    priceCents: 999,
    priceM1U: eurToM1U(9.99),
    displayPrice: formatM1U(9.99),
    label: "Black",
    features: [
      "Tutti i vantaggi Gold",
      "Accesso VIP anticipato di 24 ore agli eventi",
      "5 indizi premium aggiuntivi a settimana", 
      "Badge Black esclusivo"
    ],
    earlyAccess: 24
  },
  Titanium: {
    priceEur: 29.99,
    priceCents: 2999,
    priceM1U: eurToM1U(29.99),
    displayPrice: formatM1U(29.99),
    label: "Titanium",
    features: [
      "Tutti i vantaggi Black",
      "5 indizi premium aggiuntivi a settimana",
      "Accesso VIP anticipato di 48 ore agli eventi",
      "Supporto prioritario dedicato (24/7)",
      "Eventi esclusivi M1SSION™",
      "Badge Titanium esclusivo"
    ],
    earlyAccess: 48
  }
} as const;

/**
 * Ottieni prezzo in centesimi per Stripe
 */
export const getPriceCents = (plan: string): number => {
  const planData = PRICING_CONFIG[plan as keyof typeof PRICING_CONFIG];
  return planData?.priceCents || 0;
};

/**
 * Ottieni prezzo formattato per display
 */
export const getDisplayPrice = (plan: string): string => {
  const planData = PRICING_CONFIG[plan as keyof typeof PRICING_CONFIG];
  return planData?.displayPrice || "€0.00";
};

/**
 * Ottieni prezzo in euro (numero)
 */
export const getPriceEur = (plan: string): number => {
  const planData = PRICING_CONFIG[plan as keyof typeof PRICING_CONFIG];
  return planData?.priceEur || 0;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™