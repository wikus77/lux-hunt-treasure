// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';

export const MissionBadgeInjector = () => {
  const { isEnrolled, isLoading } = useActiveMissionEnrollment();

  useEffect(() => {
    if (isLoading || !isEnrolled) return;

    // Trova il contenitore del titolo in Home
    const titleContainer = document.querySelector('.text-center.my-6');
    if (!titleContainer) {
      console.warn('[MissionBadgeInjector] Title container not found');
      return;
    }

    // Crea il nodo badge se non esiste già
    let badgeNode = document.getElementById('mission-status-badge-portal');
    if (!badgeNode) {
      badgeNode = document.createElement('div');
      badgeNode.id = 'mission-status-badge-portal';
      badgeNode.className = 'flex justify-center my-3';
      
      // Inserisce dopo il titolo H1
      const h1 = titleContainer.querySelector('h1');
      if (h1 && h1.nextSibling) {
        titleContainer.insertBefore(badgeNode, h1.nextSibling);
      } else if (h1) {
        titleContainer.appendChild(badgeNode);
      }
    }

    return () => {
      // Cleanup: rimuovi il nodo quando il componente unmount
      const node = document.getElementById('mission-status-badge-portal');
      if (node) {
        node.remove();
      }
    };
  }, [isLoading, isEnrolled]);

  if (isLoading || !isEnrolled) return null;

  const portalTarget = document.getElementById('mission-status-badge-portal');
  if (!portalTarget) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30"
    >
      <span className="text-xs font-orbitron font-semibold text-[#00D1FF] uppercase tracking-wider">
        ON M1SSION
      </span>
    </motion.div>,
    portalTarget
  );
};
