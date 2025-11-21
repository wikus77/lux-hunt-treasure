
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ContactSubmitButtonProps {
  isSubmitting: boolean;
  progress: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ContactSubmitButton = ({ 
  isSubmitting, 
  progress,
  disabled = false, 
  children 
}: ContactSubmitButtonProps) => {
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleClick = () => {
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      // Reset after 3 seconds to allow retry if needed
      setTimeout(() => setHasBeenClicked(false), 3000);
    }
  };

  const isDisabled = disabled || isSubmitting || hasBeenClicked;

  return (
    <Button
      type="submit"
      onClick={handleClick}
      disabled={isDisabled}
      className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00B8E6] hover:to-[#6A25CC] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner size="sm" className="text-white" />
          Invio in corso...
        </div>
      ) : hasBeenClicked ? (
        "Inviato..."
      ) : (
        children || "Invia Messaggio"
      )}
    </Button>
  );
};
