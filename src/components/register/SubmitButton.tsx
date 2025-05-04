
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting }) => {
  return (
    <Button
      type="submit"
      className="w-full neon-button-cyan"
      disabled={isSubmitting}
    >
      {isSubmitting ? "Registrazione in corso..." : "Registrati Ora"}
    </Button>
  );
};

export default SubmitButton;
