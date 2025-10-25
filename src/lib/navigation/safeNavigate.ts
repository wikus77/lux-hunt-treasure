/**
 * Safe Navigation Helper - Compatible with embedded contexts
 * Uses Wouter router when available, fallback to window.location
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useLocation } from 'wouter';

/**
 * Safe navigation hook that works in both router and non-router contexts
 * Compatible with embedded components in Home container
 */
export function useSafeNavigate() {
  try {
    // Try to use Wouter's navigation (the router used by this app)
    const [, setLocation] = useLocation();
    return (path: string) => {
      try {
        setLocation(path);
      } catch {
        // If setLocation fails, fallback to direct navigation
        window.location.href = path;
      }
    };
  } catch {
    // If useLocation is not available (outside router context), use direct navigation
    return (path: string) => {
      window.location.href = path;
    };
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
