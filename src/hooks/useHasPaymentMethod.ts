
import { useCallback } from "react";

// Simulazione: puoi eventualmente legare a Supabase o a uno stato globale
export default function useHasPaymentMethod() {
  // In una vera app andresti a vedere nel backend la presenza di un metodo registrato!
  // Qui simuliamo con localStorage per demo.
  const hasPaymentMethod = !!localStorage.getItem("payment_method_saved");

  // Funzione per salvarlo (da chiamare dopo un pagamento andato a buon fine)
  const savePaymentMethod = useCallback(() => {
    localStorage.setItem("payment_method_saved", "true");
  }, []);

  const clearPaymentMethod = useCallback(() => {
    localStorage.removeItem("payment_method_saved");
  }, []);

  return { hasPaymentMethod, savePaymentMethod, clearPaymentMethod };
}
