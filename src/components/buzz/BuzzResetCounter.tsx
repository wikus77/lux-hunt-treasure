
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BuzzResetCounterProps {
  userId: string;
  onReset?: () => void;
}

const BuzzResetCounter: React.FC<BuzzResetCounterProps> = ({ userId, onReset }) => {
  const handleResetCounter = async () => {
    try {
      console.log("🔄 RESET COUNTER BUZZ IMMEDIATO per user:", userId);
      
      // Reset completo del counter giornaliero - DELETE di tutti i record per oggi
      const today = new Date().toISOString().split('T')[0];
      console.log("📅 Data di reset:", today);
      
      const { error: counterError, data: deletedRecords } = await supabase
        .from('user_buzz_counter')
        .delete()
        .eq('user_id', userId)
        .eq('date', today)
        .select();

      if (counterError) {
        console.error("❌ Errore reset counter:", counterError);
        throw counterError;
      }

      console.log("✅ Record eliminati:", deletedRecords);
      console.log("✅ Counter buzz resettato completamente per la data:", today);
      
      // Callback immediato per aggiornare il parent component
      if (onReset) {
        onReset();
      }
      
      // Toast di successo
      toast.success("Counter Buzz resettato!", {
        description: "Il sistema è pronto per nuovi test. Counter azzerato a 0/50.",
        duration: 3000,
      });
      
      // Forza un refresh completo della pagina per garantire sincronizzazione totale
      console.log("🔄 Forzando refresh completo della pagina...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("❌ Errore durante reset counter:", error);
      toast.error("Errore nel reset del counter", {
        description: "Impossibile resettare il counter buzz",
        duration: 3000,
      });
    }
  };

  return (
    <Button
      onClick={handleResetCounter}
      variant="outline"
      size="sm"
      className="bg-red-900/20 hover:bg-red-800/30 border-red-500/30 text-red-300 hover:text-red-200"
    >
      🔄 Reset Counter (TEST)
    </Button>
  );
};

export default BuzzResetCounter;
