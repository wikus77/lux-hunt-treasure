// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { useFirstLoginQuiz } from '@/hooks/useFirstLoginQuiz';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import FirstLoginQuizModal from '@/components/modals/FirstLoginQuizModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FirstLoginQuizManager: React.FC = () => {
  const { needsQuiz, isLoading, markQuizCompleted, markQuizSkipped } = useFirstLoginQuiz();
  const { getCurrentUser } = useUnifiedAuth();
  const user = getCurrentUser();

  const handleQuizComplete = async (playerType: any) => {
    if (playerType) {
      // Quiz completed successfully - investigative_style already saved by EnhancedPersonalityQuiz
      markQuizCompleted();
      toast.success('Quiz completato! Il tuo profilo è stato aggiornato.', {
        description: `Sei un ${playerType.name}!`
      });
    } else {
      // User skipped the quiz - already saved first_login_completed by EnhancedPersonalityQuiz
      markQuizSkipped();
      toast.info('Quiz saltato. Riapparirà domani all\'apertura dell\'app.', {
        description: 'Potrai completarlo anche dalla tua area profilo.'
      });
    }
  };

  // Don't render if loading or quiz not needed
  if (isLoading || !needsQuiz || !user) {
    return null;
  }

  return (
    <FirstLoginQuizModal
      isOpen={needsQuiz}
      onComplete={handleQuizComplete}
      userId={user.id}
    />
  );
};

export default FirstLoginQuizManager;
