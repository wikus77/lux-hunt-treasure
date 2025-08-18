// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// QRValidatePage: ingresso da /qr/:code → salva redirect e instrada a login/redeem

import React, { useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { KEY as POST_LOGIN_KEY } from '@/utils/postLoginRedirectFixed';

const QRValidatePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { navigate } = useWouterNavigation();
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const actedRef = useRef(false);

  useEffect(() => {
    console.log('QR_VALIDATE • mount', { path: window.location.pathname, code });
    if (!code) return;

    if (actedRef.current) return;
    if (isLoading) return; // wait auth to settle

    // Always store target for post-login deep-link recovery
    const target = `/qr/${encodeURIComponent(code)}`;
    try {
      localStorage.setItem(POST_LOGIN_KEY, target);
    } catch {}

    if (!isAuthenticated) {
      console.log('QR_VALIDATE • not auth → /login, saved redirect');
      actedRef.current = true;
      const loginUrl = `/login?redirect=${encodeURIComponent(target)}`;
      navigate(loginUrl);
      return;
    }

    console.log('QR_VALIDATE • auth → redirect to map');
    actedRef.current = true;
    navigate('/map'); // Redirect to map instead of broken QR pages
  }, [code, isAuthenticated, isLoading, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="text-center">
        <h1 className="text-xl font-semibold">QR Validate</h1>
        <p className="mt-2 text-sm opacity-70">Codice: <span className="font-mono">{code}</span></p>
      </section>
    </main>
  );
};

export default QRValidatePage;
