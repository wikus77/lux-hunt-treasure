// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { NorahChatLLM } from '@/components/norah/NorahChatLLM';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const NorahAssistant = () => {
  const { t } = useTranslation();
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
        <div className="w-full h-full px-0 md:px-4 md:max-w-screen-xl md:mx-auto">
          <div className="mb-4 md:mb-6 px-4 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent mb-2">
              {t('norah_ai_assistant')}
            </h1>
            <p className="text-sm md:text-base text-white/70">
              {t('assistant_description')}
            </p>
          </div>

          <div className="h-full" data-onboarding="ai-chat">
            {userId && <NorahChatLLM userId={userId} />}
            {!userId && <p className="text-white/60 px-4">{t('loading')}</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NorahAssistant;
