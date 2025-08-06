// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EnhancedPersonalityQuiz from '@/components/profile/EnhancedPersonalityQuiz';

interface FirstLoginQuizModalProps {
  isOpen: boolean;
  onComplete: (playerType: any) => void;
  userId: string;
}

const FirstLoginQuizModal: React.FC<FirstLoginQuizModalProps> = ({ 
  isOpen, 
  onComplete, 
  userId 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 border-none bg-transparent">
        <EnhancedPersonalityQuiz onComplete={onComplete} userId={userId} />
      </DialogContent>
    </Dialog>
  );
};

export default FirstLoginQuizModal;