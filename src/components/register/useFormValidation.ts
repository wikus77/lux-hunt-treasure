
import { useState } from "react";
import { toast } from "sonner";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useFormValidation = () => {
  const validateForm = (formData: FormData): boolean => {
    const { name, email, password, confirmPassword } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Errore", {
        description: "Completa tutti i campi per continuare.",
        duration: 3000
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Errore", {
        description: "Le password non coincidono.",
        duration: 3000
      });
      return false;
    }

    return true;
  };

  return { validateForm };
};
