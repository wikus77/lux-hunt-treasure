
import React from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { useNotificationManager } from "@/hooks/useNotificationManager";

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

  const handleBuzzPress = async () => {
    if (isLoading || !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await callBuzzApi({ 
        userId, 
        generateMap: false 
      });
      
      if (response.success) {
        // Create toast notification
        toast.success("Nuovo indizio sbloccato!", {
          description: response.clue_text,
        });
        
        // Create app notification in the BUZZ category
        try {
          await createBuzzNotification(
            "Nuovo Indizio Buzz", 
            response.clue_text || "Hai sbloccato un nuovo indizio!"
          );
          console.log("Buzz notification created successfully");
        } catch (notifError) {
          console.error("Failed to create Buzz notification:", notifError);
        }
        
        onSuccess();
      } else {
        setError(response.error || "Errore sconosciuto");
        toast.error("Errore", {
          description: response.error || "Si è verificato un errore durante l'elaborazione dell'indizio",
        });
      }
    } catch (error) {
      console.error("Errore durante la chiamata a Buzz API:", error);
      setError("Si è verificato un errore di comunicazione con il server");
      toast.error("Errore di connessione", {
        description: "Impossibile contattare il server. Riprova più tardi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      className="w-60 h-60 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(123,46,255,0.7)] focus:outline-none"
      onClick={handleBuzzPress}
      disabled={isLoading}
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
        animation: "buzzButtonGlow 3s infinite ease-in-out"
      }}
    >
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#7B2EFF] via-[#00D1FF] to-[#FF59F8] opacity-90 rounded-full" />
      
      {/* Animated pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0.4, scale: 1 }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-full blur-xl"
        style={{ background: "linear-gradient(to right, #7B2EFF, #00D1FF, #FF59F8)", opacity: 0.5 }}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      
      {/* Button content */}
      <div className="absolute inset-0 flex items-center justify-center rounded-full z-10">
        {isLoading ? (
          <Loader className="w-12 h-12 animate-spin text-white" />
        ) : (
          <span className="text-3xl font-bold text-white tracking-wider glow-text">
            BUZZ!
          </span>
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
