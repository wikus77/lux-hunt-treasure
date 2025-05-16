'use client';
import { useEffect } from 'react';
import AdminPrizeForm from './AdminPrizeForm';

export default function Admin() {
  useEffect(() => {
    document.title = 'Admin Dashboard - M1SSION';
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">🛠 Pannello Amministratore</h1>
      <AdminPrizeForm />
    </div>
  );
}
