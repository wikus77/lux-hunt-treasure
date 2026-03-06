/**
 * Global M1U Credit Overlay — Strategy B: headless event propagator only.
 * Listens to m1u-credit-event, propagates m1u-credited + m1u-balance-changed after delay.
 * Does NOT render a second M1UPill; the pill already on the page (e.g. Home) animates.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useRef } from 'react';
import { M1U_CREDIT_EVENT, M1UCreditEventDetail } from './m1uCreditEvent';

const OVERLAY_DISPATCH_DELAY_MS = 120;
const OVERLAY_VISIBLE_MS = 2800;

export const GlobalM1UCreditOverlay: React.FC = () => {
  const lastCreditIdRef = useRef<string | null>(null);
  const animatingRef = useRef(false);
  const timeoutDispatchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleCreditEvent = (e: Event) => {
      const detail = (e as CustomEvent<M1UCreditEventDetail>).detail;
      if (!detail?.amount || detail.amount <= 0) return;
      if (lastCreditIdRef.current === detail.id) return;
      if (animatingRef.current) return;

      lastCreditIdRef.current = detail.id;
      animatingRef.current = true;

      if (timeoutDispatchRef.current) clearTimeout(timeoutDispatchRef.current);
      if (timeoutHideRef.current) clearTimeout(timeoutHideRef.current);

      timeoutDispatchRef.current = setTimeout(() => {
        timeoutDispatchRef.current = null;
        window.dispatchEvent(new CustomEvent('m1u-credited', { detail: { amount: detail.amount } }));
        window.dispatchEvent(new CustomEvent('m1u-balance-changed', { detail: { type: 'credit', amount: detail.amount } }));
      }, OVERLAY_DISPATCH_DELAY_MS);

      timeoutHideRef.current = setTimeout(() => {
        timeoutHideRef.current = null;
        animatingRef.current = false;
        lastCreditIdRef.current = null;
      }, OVERLAY_VISIBLE_MS);
    };

    window.addEventListener(M1U_CREDIT_EVENT, handleCreditEvent);
    return () => {
      window.removeEventListener(M1U_CREDIT_EVENT, handleCreditEvent);
      if (timeoutDispatchRef.current) clearTimeout(timeoutDispatchRef.current);
      if (timeoutHideRef.current) clearTimeout(timeoutHideRef.current);
    };
  }, []);

  return null;
};
