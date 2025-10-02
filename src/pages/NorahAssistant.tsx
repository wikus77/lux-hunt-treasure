// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { NorahChatLLM } from '@/components/norah/NorahChatLLM';
import { supabase } from '@/integrations/supabase/client';

const NorahAssistant = () => {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = React.useState<string | null>(null);

  // Get user ID
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const LeftComponent = () => (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLocation('/home')}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <div
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: 'rgba(19, 21, 33, 0.55)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <UnifiedHeader
          profileImage={localStorage.getItem('profileImage')}
          leftComponent={<LeftComponent />}
        />
      </header>

      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0,
        }}
      >
        <div className="max-w-screen-xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent mb-2">
              NORAH AI Assistant
            </h1>
            <p className="text-white/70">
              La tua assistente personale M1SSION™. Chiedi informazioni su BUZZ, piani, Final Shot e
              molto altro!
            </p>
          </div>

          <div style={{ height: 'calc(100dvh - 300px)' }}>
            {userId && <NorahChatLLM userId={userId} />}
            {!userId && <p className="text-white/60">Caricamento...</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NorahAssistant;
