
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
      
      // STEP 1: Reset completo del counter giornaliero - DELETE di tutti i record per oggi
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
      
      // STEP 2: Callback immediato per aggiornare il parent component
      if (onReset) {
        onReset();
      }
      
      // STEP 3: Toast di successo
      toast.success("Counter Buzz resettato!", {
        description: "Il sistema è pronto per nuovi test. Counter azzerato a 0/50.",
        duration: 3000,
      });
      
      // STEP 4: Invalida qualsiasi cache del browser e forza refresh completo
      console.log("🔄 Invalidando cache e forzando refresh completo...");
      
      // Cancella eventuali cache locali
      localStorage.removeItem('buzzCounter');
      localStorage.removeItem('dailyBuzzCount');
      sessionStorage.clear();
      
      // Forza un refresh completo della pagina per garantire sincronizzazione totale
      setTimeout(() => {
        console.log("🔄 Eseguendo refresh completo della pagina...");
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("❌ Errore durante reset counter:", error);
      toast.error("Errore nel reset del counter", {
        description: "Impossibile resettare il counter buzz",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleResetCounter}
        variant="outline"
        size="sm"
        className="bg-red-900/20 hover:bg-red-800/30 border-red-500/30 text-red-300 hover:text-red-200"
      >
        🔄 Reset Counter (TEST)
      </Button>
      <p className="text-xs text-white/50 text-center">
        Azzera il limite giornaliero per test
      </p>
    </div>
  );
};

export default BuzzResetCounter;
