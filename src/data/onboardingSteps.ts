/**
 * ONBOARDING STEPS CONFIGURATION
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * 🎯 LITE MODE: 3 Step Tutorial (Default per nuovi utenti)
 * FULL MODE: 12 Step Tutorial (Attivabile da settings)
 */

// 🎚️ FEATURE FLAG: Set to false per tutorial completo 12 step
export const ONBOARDING_LITE_MODE = true;

export interface OnboardingStep {
  id: string;
  page: string;
  targetSelector: string;
  title: string;
  description: string;
  icon: string;
  action: 'click' | 'info' | 'type' | 'scroll';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
  autoAdvanceOnClick?: boolean;
  highlightPulse?: boolean;
  skipIfNotFound?: boolean;
  isFinalStep?: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🏠 HOME PAGE (Step 1-7)
  // ═══════════════════════════════════════════════════════════════
  
  // 1. START M1SSION
  {
    id: 'start-mission',
    page: '/home',
    targetSelector: '[data-onboarding="start-mission"]',
    title: '🚀 START M1SSION',
    description: 'Clicca qui per iniziare la tua avventura!',
    icon: '🚀',
    action: 'click',
    position: 'bottom',
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  
  // 2. M1U PILL
  {
    id: 'm1u-pill',
    page: '/home',
    targetSelector: '[data-onboarding="m1u-pill"]',
    title: '💰 M1U - VALUTA',
    description: 'I tuoi M1U! Guadagnali e usali per BUZZ.',
    icon: '💰',
    action: 'click',
    position: 'bottom',
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  
  // 3. STREAK PILL
  {
    id: 'streak-pill',
    page: '/home',
    targetSelector: '[data-onboarding="streak-pill"]',
    title: '🔥 STREAK',
    description: 'Accedi ogni giorno per bonus PE e M1U!',
    icon: '🔥',
    action: 'click',
    position: 'bottom',
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  
  // 4. M1SSION PRIZE
  {
    id: 'prize-vision',
    page: '/home',
    targetSelector: '[data-onboarding="prize-vision"]',
    title: '🏆 PRIZE',
    description: 'Il Premio Principale è ancora TOP SECRET. Si svelerà durante la Missione...',
    icon: '🏆',
    action: 'click',
    position: 'bottom',
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  
  // 5. STATO MISSIONE
  {
    id: 'mission-card',
    page: '/home',
    targetSelector: '[data-onboarding="mission-card"]',
    title: '📋 MISSIONE',
    description: 'Stato missione: indizi e tempo rimasto.',
    icon: '📋',
    action: 'click',
    position: 'top',
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  
  // 6. M1SSION BATTLE
  {
    id: 'battle',
    page: '/home',
    targetSelector: '[data-onboarding="battle"]',
    title: '⚔️ BATTLE',
    description: 'Sfida altri agenti e vinci M1U!',
    icon: '⚔️',
    action: 'click',
    position: 'top',
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  
  // 7. INVITE
  {
    id: 'invite',
    page: '/home',
    targetSelector: '[data-onboarding="invite"]',
    title: '👥 INVITA',
    description: 'Invita amici e guadagna +25 PE!',
    icon: '👥',
    action: 'click',
    position: 'left',
    spotlightPadding: 8,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // 🗺️ MAP PAGE (Step 8)
  // ═══════════════════════════════════════════════════════════════
  
  // 8. BUZZ MAP BUTTON
  {
    id: 'buzz-map-button',
    page: '/map-3d-tiler',
    targetSelector: '[data-onboarding="buzz-map-button"]',
    title: '✨ BUZZ MAP',
    description: 'Marker 🔴 = Agenti sfidabili. 99 Reward nascosti con premi instant!',
    icon: '✨',
    action: 'click',
    position: 'top',
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // 🎰 BUZZ PAGE (Step 9-10)
  // ═══════════════════════════════════════════════════════════════
  
  // 9. NAVIGAZIONE
  {
    id: 'bottom-nav',
    page: '/buzz',
    targetSelector: '[data-onboarding="bottom-nav"]',
    title: '🧭 NAV',
    description: 'Naviga tra le sezioni dell\'app!',
    icon: '🧭',
    action: 'click',
    position: 'top',
    spotlightPadding: 8,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  
  // 10. BUZZ BUTTON
  {
    id: 'buzz-button',
    page: '/buzz',
    targetSelector: '[data-onboarding="buzz-button"]',
    title: '🎰 BUZZ',
    description: 'Ottieni hint sugli indizi!',
    icon: '🎰',
    action: 'click',
    position: 'top',
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // 🤖 INTELLIGENCE PAGE (Step 11)
  // ═══════════════════════════════════════════════════════════════
  
  // 11. AI AION
  {
    id: 'ai-chat',
    page: '/intelligence',
    targetSelector: '[data-onboarding="ai-chat"]',
    title: '🔮 AION',
    description: 'L\'Oracolo di M1SSION. Solo lui conosce tutti i segreti. Chiedi a lui.',
    icon: '🔮',
    action: 'click',
    position: 'top',
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // 🎉 FINE TUTORIAL (Step 12)
  // ═══════════════════════════════════════════════════════════════
  
  // 12. FINE TUTORIAL
  {
    id: 'tutorial-complete',
    page: '/home',
    targetSelector: '[data-onboarding="m1ssion-title"]',
    title: '🎉 COMPLETATO!',
    description: 'Ora sei pronto per M1SSION!',
    icon: '🎉',
    action: 'click',
    position: 'bottom',
    spotlightPadding: 20,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: false,
    isFinalStep: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// 🚀 LITE ONBOARDING (3 Step) - Per nuovi utenti
// ═══════════════════════════════════════════════════════════════
export const ONBOARDING_STEPS_LITE: OnboardingStep[] = [
  // 1. MAPPA - Il cuore del gioco
  {
    id: 'map-intro',
    page: '/map-3d-tiler',
    targetSelector: '[data-onboarding="buzz-map-button"]',
    title: '🗺️ ESPLORA LA MAPPA',
    description: 'Questo è il tuo campo di gioco! Cerca i marker 🔴 per trovare indizi e premi.',
    icon: '🗺️',
    action: 'info',
    position: 'top',
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  // 2. BUZZ - Come ottenere indizi
  {
    id: 'buzz-intro',
    page: '/buzz',
    targetSelector: '[data-onboarding="buzz-button"]',
    title: '🎰 OTTIENI INDIZI',
    description: 'Premi BUZZ per ottenere hint che ti avvicinano al tesoro!',
    icon: '🎰',
    action: 'info',
    position: 'top',
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true,
  },
  // 3. FINE - Sei pronto!
  {
    id: 'ready',
    page: '/map-3d-tiler',
    targetSelector: '[data-onboarding="bottom-nav"]',
    title: '🎉 SEI PRONTO!',
    description: 'Usa la navigazione per esplorare. Buona caccia al tesoro!',
    icon: '🎉',
    action: 'info',
    position: 'top',
    spotlightPadding: 8,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: false,
    isFinalStep: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// 🎯 ACTIVE STEPS - Usa LITE o FULL in base al flag
// ═══════════════════════════════════════════════════════════════
const FULL_STEPS = ONBOARDING_STEPS;
const ACTIVE_STEPS = ONBOARDING_LITE_MODE ? ONBOARDING_STEPS_LITE : FULL_STEPS;

// Raggruppa step per pagina
export const STEPS_BY_PAGE = ACTIVE_STEPS.reduce((acc, step) => {
  if (!acc[step.page]) acc[step.page] = [];
  acc[step.page].push(step);
  return acc;
}, {} as Record<string, OnboardingStep[]>);

// Ordine delle pagine per navigazione
export const PAGE_ORDER = ONBOARDING_LITE_MODE 
  ? ['/map-3d-tiler', '/buzz'] // Lite: solo mappa e buzz
  : ['/home', '/map-3d-tiler', '/buzz', '/intelligence', '/leaderboard']; // Full

export const TOTAL_STEPS = ACTIVE_STEPS.length;

// Re-export ACTIVE steps as the main export
export { ACTIVE_STEPS as ONBOARDING_STEPS_ACTIVE };
