/**
 * M1SSION™ Glass Design System
 * Unified visual tokens for AAA game-feel overlays
 * Based on the beloved OnboardingOverlay.tsx style
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════

export const M1SSION_COLORS = {
  // Primary Palette
  cyan: '#00D1FF',
  cyanDark: '#00A3CC',
  cyanGlow: 'rgba(0, 209, 255, 0.5)',
  
  // Accent Palette
  magenta: '#FF59F8',
  magentaGlow: 'rgba(255, 89, 248, 0.5)',
  
  // Success/Reward Palette
  gold: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.6)',
  green: '#00FF88',
  greenGlow: 'rgba(0, 255, 136, 0.5)',
  
  // Warning/Error Palette
  amber: '#FFB800',
  amberGlow: 'rgba(255, 184, 0, 0.5)',
  red: '#FF4444',
  redGlow: 'rgba(255, 68, 68, 0.5)',
  
  // Background
  bgDark: 'rgba(15, 23, 42, 0.98)',
  bgDarker: 'rgba(10, 15, 30, 0.98)',
  bgGlass: 'rgba(0, 12, 24, 0.95)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GLASS PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export type GlassVariant = 'success' | 'warning' | 'error' | 'neutral' | 'gold';

export interface GlassPreset {
  background: string;
  border: string;
  boxShadow: string;
  glowColor: string;
  textColor: string;
  accentColor: string;
}

export const GLASS_PRESETS: Record<GlassVariant, GlassPreset> = {
  // ✅ Success Green (Tutorial/Onboarding inspired)
  success: {
    background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
    border: '2px solid rgba(0, 255, 136, 0.5)',
    boxShadow: '0 0 40px rgba(0, 255, 136, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    glowColor: M1SSION_COLORS.greenGlow,
    textColor: M1SSION_COLORS.green,
    accentColor: M1SSION_COLORS.cyan,
  },
  
  // ⚠️ Warning Amber (Non-aggressive)
  warning: {
    background: 'linear-gradient(145deg, rgba(40, 30, 10, 0.98), rgba(60, 45, 15, 0.95))',
    border: '2px solid rgba(255, 184, 0, 0.5)',
    boxShadow: '0 0 40px rgba(255, 184, 0, 0.25), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    glowColor: M1SSION_COLORS.amberGlow,
    textColor: M1SSION_COLORS.amber,
    accentColor: M1SSION_COLORS.gold,
  },
  
  // 🔴 Critical Red (Real errors only)
  error: {
    background: 'linear-gradient(145deg, rgba(40, 15, 15, 0.98), rgba(60, 20, 20, 0.95))',
    border: '2px solid rgba(255, 68, 68, 0.5)',
    boxShadow: '0 0 40px rgba(255, 68, 68, 0.25), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    glowColor: M1SSION_COLORS.redGlow,
    textColor: M1SSION_COLORS.red,
    accentColor: '#FF8888',
  },
  
  // 🔵 Neutral Cyan (Default M1SSION)
  neutral: {
    background: 'linear-gradient(145deg, rgba(0, 20, 40, 0.98), rgba(0, 40, 60, 0.95))',
    border: '2px solid rgba(0, 209, 255, 0.5)',
    boxShadow: '0 0 40px rgba(0, 209, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    glowColor: M1SSION_COLORS.cyanGlow,
    textColor: M1SSION_COLORS.cyan,
    accentColor: M1SSION_COLORS.magenta,
  },
  
  // 🏆 Gold (Milestones, Level Up, Rewards)
  gold: {
    background: 'linear-gradient(145deg, rgba(30, 25, 10, 0.98), rgba(50, 40, 15, 0.95))',
    border: '2px solid rgba(255, 215, 0, 0.6)',
    boxShadow: '0 0 50px rgba(255, 215, 0, 0.35), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
    glowColor: M1SSION_COLORS.goldGlow,
    textColor: M1SSION_COLORS.gold,
    accentColor: M1SSION_COLORS.magenta,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const MOTION_PRESETS = {
  // Toast entrance (slide down + fade)
  toastEnter: {
    initial: { opacity: 0, y: -60, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -40, scale: 0.95 },
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
  
  // Modal entrance (scale + rotate)
  modalEnter: {
    initial: { opacity: 0, scale: 0.8, rotateX: -10 },
    animate: { opacity: 1, scale: 1, rotateX: 0 },
    exit: { opacity: 0, scale: 0.9, rotateX: 5 },
    transition: { type: 'spring', damping: 15, stiffness: 200 },
  },
  
  // Icon bounce
  iconBounce: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', damping: 12, stiffness: 200, delay: 0.15 },
  },
  
  // Text stagger
  textStagger: (delay: number) => ({
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay, duration: 0.3 },
  }),
  
  // Glow pulse
  glowPulse: {
    animate: {
      boxShadow: [
        '0 0 30px rgba(0, 209, 255, 0.4)',
        '0 0 50px rgba(0, 209, 255, 0.6)',
        '0 0 30px rgba(0, 209, 255, 0.4)',
      ],
    },
    transition: { duration: 2, repeat: Infinity },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get preset by event type
// ═══════════════════════════════════════════════════════════════════════════

export function getGlassVariantForEvent(eventType: string): GlassVariant {
  switch (eventType) {
    // Success events
    case 'BUZZ_SUCCESS':
    case 'BATTLE_WIN':
    case 'PULSE_BREAKER_CASHOUT':
    case 'BUZZ_MAP_CLUE_FOUND':
    case 'MARKER_REWARD_CLAIMED':
    case 'LEADERBOARD_POSITION_UP':
      return 'success';
    
    // Gold/Reward events
    case 'MILESTONE_REACHED':
    case 'LEVEL_UP':
    case 'RANK_UP':
    case 'M1U_CREDITED':
    case 'CASHBACK_ACCRUED':
      return 'gold';
    
    // Warning events
    case 'BUZZ_INSUFFICIENT_M1U':
    case 'LEADERBOARD_POSITION_DOWN':
      return 'warning';
    
    // Error events
    case 'BUZZ_FAIL':
    case 'PULSE_BREAKER_CRASH':
    case 'BATTLE_LOSE':
      return 'error';
    
    // Default neutral
    default:
      return 'neutral';
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

