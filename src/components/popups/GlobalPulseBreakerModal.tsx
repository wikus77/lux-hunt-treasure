/**
 * GLOBAL PULSE BREAKER MODAL
 * Renderizza il modal Pulse Breaker globalmente, controllato dallo store
 * Usa createPortal per assicurarsi che sia sempre sopra tutto
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { PulseBreaker } from '@/features/pulse-breaker/components/PulseBreaker';
import { usePulseBreakerStore } from '@/stores/pulseBreakerStore';

export const GlobalPulseBreakerModal: React.FC = () => {
  const { isOpen, closePulseBreaker } = usePulseBreakerStore();
  const [location] = useLocation();

  // 🚫 Non mostrare su pagine pubbliche
  const isPublicPage = location === '/landing' || location === '/spectator' || location === '/register' || location === '/login';
  
  // Non renderizzare nulla se non è aperto o su pagine pubbliche
  if (!isOpen || isPublicPage) return null;

  // Usa createPortal per renderizzare direttamente nel body
  return createPortal(
    <PulseBreaker 
      isOpen={isOpen} 
      onClose={closePulseBreaker} 
    />,
    document.body
  );
};

