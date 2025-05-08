
import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSubmitButtonProps {
  isSubmitting: boolean;
}

const ContactSubmitButton: React.FC<ContactSubmitButtonProps> = ({ isSubmitting }) => {
  return (
    <Button
      type="submit"
      className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>Invio in corso...</>
      ) : (
        <>
          Invia Messaggio <Send size={16} />
        </>
      )}
    </Button>
  );
};

export default ContactSubmitButton;
