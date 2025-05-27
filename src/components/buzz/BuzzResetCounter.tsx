
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
      console.log("🔄 RESET COUNTER BUZZ per testing...");
      
      // Reset del counter giornaliero
      const { error: counterError } = await supabase
        .from('user_buzz_counter')
        .delete()
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (counterError) {
        console.error("❌ Errore reset counter:", counterError);
        throw counterError;
      }

      console.log("✅ Counter buzz resettato con successo");
      
      toast.success("Counter Buzz resettato!", {
        description: "Ora puoi testare nuovamente il sistema BUZZ",
        duration: 3000,
      });
      
      if (onReset) {
        onReset();
      }
      
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
