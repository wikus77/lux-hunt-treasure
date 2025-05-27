
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { supabase } from "@/integrations/supabase/client";

interface BuzzButtonProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  userId: string;
  onSuccess: () => void;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({
  isLoading,
  setIsLoading,
  setError,
  userId,
  onSuccess
}) => {
  const { callBuzzApi } = useBuzzApi();
  const { createBuzzNotification } = useNotificationManager();
  const [buzzCost, setBuzzCost] = useState<number>(1.99);
  const [dailyCount, setDailyCount] = useState<number>(0);

  // Carica il costo attuale del buzz
  useEffect(() => {
    const loadBuzzCost = async () => {
      if (!userId) return;
      
      try {
        console.log("📊 Caricamento dati buzz per user:", userId);
        
        // Ottieni il conteggio giornaliero attuale
        const today = new Date().toISOString().split('T')[0];
        const { data: countData, error: countError } = await supabase
          .from('user_buzz_counter')
          .select('buzz_count')
          .eq('user_id', userId)
          .eq('date', today)
          .single();

        const currentCount = countData?.buzz_count || 0;
        console.log("📈 Conteggio attuale buzz:", currentCount);
        setDailyCount(currentCount);

        // Calcola il costo per il prossimo buzz
        const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
          daily_count: currentCount + 1
        });

        if (costError) {
          console.error("Errore nel calcolo del costo:", costError);
          return;
        }

        const newCost = costData || 1.99;
        console.log("💰 Costo calcolato per prossimo buzz:", newCost);
        setBuzzCost(newCost);
      } catch (error) {
        console.error("Errore nel caricamento del costo buzz:", error);
      }
    };

    loadBuzzCost();
  }, [userId]);

  const handleBuzzPress = async () => {
    if (isLoading || !userId) return;
    
    console.log("🚀 Iniziando processo BUZZ per user:", userId);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await callBuzzApi({ 
        userId, 
        generateMap: false 
      });
      
      if (response.success) {
        console.log("✅ Risposta BUZZ API ricevuta:", response);
        
        // Aggiorna il costo per il prossimo utilizzo
        const newDailyCount = dailyCount + 1;
        setDailyCount(newDailyCount);
        
        const { data: newCostData } = await supabase.rpc('calculate_buzz_price', {
          daily_count: newDailyCount + 1
        });
        if (newCostData) setBuzzCost(newCostData);

        // Ottieni il contenuto dinamico reale dell'indizio
        const dynamicClueContent = response.clue_text || `Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`;
        
        console.log("📝 Contenuto dinamico indizio:", dynamicClueContent);

        // Registra immediatamente la notifica su Supabase con il contenuto reale
        try {
          console.log("💾 Inserendo notifica in Supabase...");
          const { error: notificationError, data: insertedNotification } = await supabase
            .from('user_notifications')
            .insert({
              user_id: userId,
              type: 'buzz',
              title: 'Nuovo Indizio Buzz',
              message: dynamicClueContent,
              is_read: false,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (notificationError) {
            console.error("❌ Errore inserimento notifica:", notificationError);
          } else {
            console.log("✅ Notifica inserita con successo:", insertedNotification);
          }
        } catch (notifError) {
          console.error("❌ Errore creazione notifica:", notifError);
        }

        // Create toast notification con contenuto dinamico
        toast.success("Nuovo indizio sbloccato!", {
          description: dynamicClueContent,
        });
        
        // Create app notification in the BUZZ category con contenuto reale
        try {
          await createBuzzNotification(
            "Nuovo Indizio Buzz", 
            dynamicClueContent
          );
          console.log("✅ Buzz notification created successfully with dynamic content");
        } catch (notifError) {
          console.error("❌ Failed to create Buzz notification:", notifError);
        }
        
        onSuccess();
      } else {
        console.error("❌ Errore risposta BUZZ API:", response.error);
        setError(response.error || "Errore sconosciuto");
        toast.error("Errore", {
          description: response.error || "Si è verificato un errore durante l'elaborazione dell'indizio",
        });
      }
    } catch (error) {
      console.error("❌ Errore durante la chiamata a Buzz API:", error);
      setError("Si è verificato un errore di comunicazione con il server");
      toast.error("Errore di connessione", {
        description: "Impossibile contattare il server. Riprova più tardi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determina se il buzz è bloccato (oltre 50 utilizzi giornalieri)
  const isBlocked = dailyCount >= 50 || buzzCost <= 0;

  return (
    <motion.button
      className="w-60 h-60 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(123,46,255,0.7)] focus:outline-none disabled:opacity-50"
      onClick={handleBuzzPress}
      disabled={isLoading || isBlocked}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      initial={{ boxShadow: "0 0 0px rgba(123, 46, 255, 0)" }}
      animate={{ 
        boxShadow: ["0 0 12px rgba(123, 46, 255, 0.35)", "0 0 35px rgba(0, 209, 255, 0.7)", "0 0 12px rgba(123, 46, 255, 0.35)"]
      }}
      transition={{ 
        boxShadow: { repeat: Infinity, duration: 3 },
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
      style={{
        animation: isBlocked ? "none" : "buzzButtonGlow 3s infinite ease-in-out"
      }}
    >
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#7B2EFF] via-[#00D1FF] to-[#FF59F8] opacity-90 rounded-full" />
      
      {!isBlocked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0.4, scale: 1 }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      )}
      
      {!isBlocked && (
        <motion.div
          className="absolute -inset-1 rounded-full blur-xl"
          style={{ background: "linear-gradient(to right, #7B2EFF, #00D1FF, #FF59F8)", opacity: 0.5 }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full z-10">
        {isLoading ? (
          <Loader className="w-12 h-12 animate-spin text-white" />
        ) : isBlocked ? (
          <>
            <span className="text-2xl font-bold text-red-300 tracking-wider">
              BLOCCATO
            </span>
            <span className="text-xs text-red-200 mt-1">
              Limite giornaliero raggiunto
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-white tracking-wider glow-text">
              BUZZ!
            </span>
            <span className="text-sm text-white/90 mt-1 font-medium">
              €{buzzCost.toFixed(2)}
            </span>
            <span className="text-xs text-white/70">
              {dailyCount}/50 oggi
            </span>
          </>
        )}
      </div>

      <style>
        {`
        @keyframes buzzButtonGlow {
          0% { box-shadow: 0 0 8px rgba(255, 89, 248, 0.6); }
          50% { box-shadow: 0 0 22px rgba(255, 89, 248, 0.8), 0 0 35px rgba(0, 209, 255, 0.5); }
          100% { box-shadow: 0 0 8px rgba(255, 89, 248, 0.6); }
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(0, 209, 255, 0.6);
        }
        `}
      </style>
    </motion.button>
  );
};

export default BuzzButton;
