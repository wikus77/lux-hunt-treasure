// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Living Map™ Feature Flags (ENV + localStorage + querystring fallback)
 */

export function lmEnabled(): boolean {
  try {
    // 1. Check querystring
    const q = new URLSearchParams(window.location.search);
    if (q.get('lmenable') === '1') return true;
    
    // 2. Check localStorage
    const ls = localStorage.getItem('M1_LM_ENABLE');
    if (ls === 'true') return true;
    
    // 3. Check ENV (may not work in all cases)
    const env = import.meta.env.VITE_ENABLE_LIVING_MAP;
    return env === 'true';
  } catch {
    return false;
  }
}

export function lmDebug(): boolean {
  try {
    // 1. Check querystring
    const q = new URLSearchParams(window.location.search);
    if (q.get('lmdebug') === '1') return true;
    
    // 2. Check localStorage
    const ls = localStorage.getItem('M1_LM_DEBUG');
    if (ls === 'true') return true;
    
    // 3. Check ENV
    const env = import.meta.env.VITE_LIVING_MAP_DEBUG;
    return env === 'true';
  } catch {
    return false;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
