
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EmailSubmitButtonProps {
  isSending: boolean;
  onSubmit: () => void;
}

const EmailSubmitButton: React.FC<EmailSubmitButtonProps> = ({ isSending, onSubmit }) => {
  return (
    <Button 
      className="w-full"
      onClick={onSubmit}
      disabled={isSending}
    >
      {isSending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Invio in corso...
        </>
      ) : (
        "Invia Email"
      )}
    </Button>
  );
};

export default EmailSubmitButton;
