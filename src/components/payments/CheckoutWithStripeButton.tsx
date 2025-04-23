
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Un semplice pulsante per avviare il pagamento Stripe Checkout.
 */
interface CheckoutWithStripeButtonProps {
  amountCents?: number;      // opzionale, se vuoi controllare l'importo da fuori
  description?: string;      // descrizione prodotto
  label?: string;            // testo del bottone
}

const DEFAULT_LABEL = "Paga con Carta (Stripe)";
const DEFAULT_DESCRIPTION = "Pagamento online sicuro via Stripe";

export default function CheckoutWithStripeButton({
  amountCents,
  description = DEFAULT_DESCRIPTION,
  label = DEFAULT_LABEL,
}: CheckoutWithStripeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      // Puoi personalizzare l'importo e la descrizione se lato Edge Function li leggi dai parametri
      const response = await fetch("/functions/v1/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sb-access-token") || ""}`
        },
        body: JSON.stringify({
          amountCents,
          description,
        })
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      // Hanlding errore lato back
      throw new Error(data?.error || "Errore avvio sessione pagamento Stripe.");
    } catch (err: any) {
      toast.error("Errore Stripe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300"
      onClick={handleStripeCheckout}
      disabled={loading}
    >
      {loading && <Loader2 className="animate-spin w-4 h-4" />}
      <span>{label}</span>
      <svg width="24" height="24" viewBox="0 0 32 32" aria-label="Stripe logo">
        <rect width="32" height="32" rx="8" fill="#635bff"/>
        <text x="16" y="21" fontSize="13" fill="#fff" textAnchor="middle" fontFamily="Arial Black">Stripe</text>
      </svg>
    </Button>
  );
}
