
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { Loader } from "lucide-react";

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
        toast.success("Nuovo indizio sbloccato!", {
          description: response.clue_text,
        });
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
    <Button
      className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-300 hover:shadow-red-500/30 hover:scale-105"
      onClick={handleBuzzPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader className="w-8 h-8 animate-spin" />
      ) : (
        <span className="text-xl font-bold">BUZZ</span>
      )}
    </Button>
  );
};

export default BuzzButton;
