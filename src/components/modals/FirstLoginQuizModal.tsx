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
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent">
        <div className="max-h-[95vh] overflow-y-auto">
          <EnhancedPersonalityQuiz onComplete={onComplete} userId={userId} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstLoginQuizModal;