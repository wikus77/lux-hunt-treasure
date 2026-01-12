// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * QR WIN SANDBOX PAGE
 * 
 * Pagina isolata per simulare l'esperienza utente
 * dopo scansione QR del gratta e vinci M1SSION.
 * 
 * Non impatta produzione.
 * Route: /sandbox/qr-win
 */

import React from 'react';
import QrWinFlow from '@/components/sandbox/qrwin/QrWinFlow';

const QrWinSandboxPage: React.FC = () => {
  return <QrWinFlow />;
};

export default QrWinSandboxPage;
