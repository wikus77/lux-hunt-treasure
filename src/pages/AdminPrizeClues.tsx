
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';
import { useEffect } from 'react';

export default function AdminPrizeClues() {
  useEffect(() => {
    console.log("🟢 AdminPrizeClues page mounted");
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Gestione Premi</h1>
      <h2 className="text-xl text-green-500 mb-4">✅ AdminPrizeClues montato con successo</h2>
      <p className="text-white mb-8">🧪 Questo è un test visivo della pagina AdminPrizeClues</p>
      <AdminPrizeManager />
    </div>
  );
}
