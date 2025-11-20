/**
 * © 2025 Joseph MULÉ – M1SSION™ – MISSION BADGE AFFIXER
 * Zero-flicker badge positioning with anchor shadow + observers
 */

import React, { useLayoutEffect, useRef, useState } from 'react';

interface MissionBadgeAffixerProps {
  badgeContent: React.ReactNode;
  headerTitleSelector?: string;
}

const ANCHOR_ID = 'm1-badge-anchor';
const DEBOUNCE_MS = 150;

export const MissionBadgeAffixer: React.FC<MissionBadgeAffixerProps> = ({
  badgeContent,
  headerTitleSelector = 'h1'
}) => {
  const [isReady, setIsReady] = useState(false);
  const [fallbackPos, setFallbackPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);

  useLayoutEffect(() => {
    const setupAnchor = () => {
      requestAnimationFrame(() => {
        const titleElement = document.querySelector(headerTitleSelector);
        if (!titleElement) {
          console.warn('[MissionBadgeAffixer] Title element not found');
          
          // Fallback: try again after 100ms
          setTimeout(setupAnchor, 100);
          return;
        }

        // Find or create anchor
        let anchor = document.getElementById(ANCHOR_ID);
        if (!anchor) {
          anchor = document.createElement('span');
          anchor.id = ANCHOR_ID;
          anchor.style.display = 'inline-block';
          anchor.style.width = '0';
          anchor.style.height = '0';
          anchor.style.visibility = 'hidden';
          
          // Insert after title
          titleElement.parentNode?.insertBefore(anchor, titleElement.nextSibling);
          console.log('[MissionBadgeAffixer] Anchor created');
        }

        // Position badge relative to anchor
        if (containerRef.current && anchor) {
          const anchorRect = anchor.getBoundingClientRect();
          containerRef.current.style.position = 'fixed';
          containerRef.current.style.top = `${anchorRect.top}px`;
          containerRef.current.style.left = `${anchorRect.left + 10}px`;
          containerRef.current.style.zIndex = '50';
          
          setIsReady(true);
          console.log('[MissionBadgeAffixer] Badge positioned');
        }
      });
    };

    // Initial setup with slight delay for layout stability
    const initialTimer = setTimeout(setupAnchor, 50);

    // Mutation observer for DOM changes
    const observer = new MutationObserver(() => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      
      debounceTimer.current = window.setTimeout(() => {
        const anchor = document.getElementById(ANCHOR_ID);
        if (anchor && !anchor.isConnected) {
          console.log('[MissionBadgeAffixer] Anchor lost, re-attaching');
          setupAnchor();
        }
      }, DEBOUNCE_MS);
    });

    // Resize observer for position updates
    const resizeObserver = new ResizeObserver(() => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      
      debounceTimer.current = window.setTimeout(() => {
        setupAnchor();
      }, DEBOUNCE_MS);
    });

    const titleElement = document.querySelector(headerTitleSelector);
    if (titleElement) {
      observer.observe(titleElement.parentElement || document.body, {
        childList: true,
        subtree: true
      });
      resizeObserver.observe(titleElement);
    }

    // Fallback positioning after 500ms if anchor not ready
    const fallbackTimer = setTimeout(() => {
      if (!isReady && !fallbackPos) {
        const titleElement = document.querySelector(headerTitleSelector);
        if (titleElement) {
          const rect = titleElement.getBoundingClientRect();
          setFallbackPos({
            top: rect.top,
            left: rect.right + 10
          });
          console.log('[MissionBadgeAffixer] Using fallback positioning');
        }
      }
    }, 500);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(fallbackTimer);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [headerTitleSelector, isReady, fallbackPos]);

  if (!isReady && !fallbackPos) {
    return null; // Don't render until positioned
  }

  return (
    <div
      ref={containerRef}
      style={
        fallbackPos
          ? {
              position: 'fixed',
              top: `${fallbackPos.top}px`,
              left: `${fallbackPos.left}px`,
              zIndex: 50
            }
          : undefined
      }
      className="mission-badge-container"
    >
      {badgeContent}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
