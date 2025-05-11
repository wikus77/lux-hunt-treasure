
import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ContactSubmitButtonProps {
  isSubmitting: boolean;
  progress: number;
  disabled?: boolean; // We've added this prop as optional
}

const ContactSubmitButton: React.FC<ContactSubmitButtonProps> = ({ isSubmitting, progress, disabled = false }) => {
  return (
    <div className="space-y-2">
      {isSubmitting && (
        <Progress 
          value={progress} 
          className="h-1.5 bg-black/30"
          indicatorClassName="bg-gradient-to-r from-cyan-400 to-blue-600" 
        />
      )}
      <Button
        type="submit"
        className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? (
          <>Invio in corso...</>
        ) : (
          <>
            Invia Messaggio <Send size={16} />
          </>
        )}
      </Button>
    </div>
  );
};

export default ContactSubmitButton;
