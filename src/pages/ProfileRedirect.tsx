/**
 * ProfileRedirect — Redirect automatico da /profile a /settings/agent-profile
 * Mantiene retrocompatibilità per vecchi link e cache
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect } from 'react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const ProfileRedirect = () => {
  const { navigate } = useWouterNavigation();
  
  useEffect(() => {
    // Redirect immediato a /settings/agent-profile
    navigate('/settings/agent-profile', { replace: true });
  }, [navigate]);
  
  // Mostra nulla durante il redirect
  return null;
};

export default ProfileRedirect;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
