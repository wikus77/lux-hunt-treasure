'use client';
import { useEffect } from 'react';

export default function Admin() {
  useEffect(() => {
    document.title = 'Admin Test - M1SSION';
  }, []);

  return (
    <div style={{ color: 'white', padding: '4rem', textAlign: 'center' }}>
      ✅ TEST DI ADMIN ATTIVO<br />
      Se vedi questo messaggio, la pagina funziona.<br />
      Il problema è **solo** dentro `AdminPrizeForm`.
    </div>
  );
}
