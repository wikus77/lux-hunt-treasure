/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Panel Users Page - Dedicated page for user management with realtime updates
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { useProfileImage } from '@/hooks/useProfileImage';
import { usePanelAccessProtection } from '@/hooks/usePanelAccessProtection';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import UsersRealtimePanel from '@/components/panel/UsersRealtimePanel';

const PanelUsersPage: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { profileImage } = useProfileImage();
  const { isWhitelisted, isValidating, accessDeniedReason } = usePanelAccessProtection();

  // Security check
  if (!isWhitelisted) {
    if (isValidating) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center">
          <div className="text-center">
            <Spinner className="h-12 w-12 text-[#4361ee] mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">Validazione Accesso M1SSION PANEL™</p>
            <p className="text-gray-400 text-sm mt-2">Verifica clearance in corso...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">⛔ Accesso Negato</h1>
          <p className="text-gray-400 mb-4">Solo gli amministratori possono accedere a questa pagina</p>
          
          <div className="bg-black/50 p-4 rounded-lg text-left text-xs font-mono">
            <h3 className="text-red-400 mb-2">Debug Info:</h3>
            <p className="text-gray-300">Email: {user?.email}</p>
            <p className="text-gray-300">Motivo: {accessDeniedReason}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
      <Helmet>
        <title>M1SSION PANEL™ - Users (Realtime)</title>
        <meta name="description" content="Gestione utenti con aggiornamenti in tempo reale - M1SSION PANEL™" />
      </Helmet>
      
      <UnifiedHeader profileImage={profileImage} />
      
      <div 
        className="px-4 py-8"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Torna al Panel
            </button>
            <h1 className="text-2xl font-bold text-white">Users (Realtime)</h1>
          </div>

          <UsersRealtimePanel />
        </div>
      </div>
    </div>
  );
};

export default PanelUsersPage;