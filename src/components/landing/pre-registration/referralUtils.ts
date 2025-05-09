
import { toast } from "sonner";

export const generateReferralCode = (name: string): string => {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePrefix}${randomStr}`;
};

export const copyToClipboard = (text: string, successMessage: string = "Codice copiato negli appunti!"): void => {
  navigator.clipboard.writeText(text);
  toast.success(successMessage, {
    description: "Condividilo con i tuoi amici per guadagnare crediti."
  });
};

export const generateShareEmailContent = (code: string): { subject: string; body: string } => {
  const subject = "Unisciti a me su M1SSION!";
  const body = `Ciao,\n\nHo pensato che M1SSION potrebbe interessarti! È una nuova esperienza di gioco dove puoi vincere premi reali risolvendo missioni.\n\nUsa il mio codice invito per ricevere crediti bonus: ${code}\n\nRegistrati qui: ${window.location.origin}\n\nA presto!`;
  
  return { subject, body };
};
