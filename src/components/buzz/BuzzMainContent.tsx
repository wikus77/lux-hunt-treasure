
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BuzzButton from "@/components/buzz/BuzzButton";
import { LightbulbIcon, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBuzzFeature } from "./BuzzFeatureWrapper";

export default function BuzzMainContent() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const {
    unlockedClues,
    handleBuzzClick,
    handleClueButtonClick,
    handleResetClues
  } = useBuzzFeature();
  
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  return (
    <section className="flex flex-col items-center justify-center py-6 sm:py-10 h-[70vh] w-full px-3 sm:px-4">
      <div className="text-center mb-6 sm:mb-8 w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Hai bisogno di un indizio extra?</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Premi il pulsante Buzz per ottenere un indizio supplementare a 1,99€
        </p>
      </div>
      
      {/* Pulsante principale BUZZ */}
      <BuzzButton
        onBuzzClick={handleBuzzClick}
        unlockedClues={unlockedClues}
        isMapBuzz={false}
      />
      
      {/* Nuovo pulsante Indizio Istantaneo */}
      <div className="mt-8 sm:mt-12 w-full max-w-md px-3 sm:px-0">
        <Button 
          onClick={handleClueButtonClick}
          className="w-full py-4 sm:py-6 text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-projectx-blue to-projectx-pink hover:opacity-90"
        >
          <LightbulbIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          Ottieni Indizio Istantaneo (1,99€)
        </Button>
        <p className="text-xs sm:text-sm text-center mt-2 text-muted-foreground">
          Ricevi subito una notifica con un nuovo indizio esclusivo
        </p>
      </div>
      
      {/* Pulsante Reset */}
      <div className="mt-4 sm:mt-6 w-full max-w-md px-3 sm:px-0">
        <Button 
          onClick={handleResetClues}
          variant="destructive"
          className="w-full py-2 flex items-center justify-center gap-2"
        >
          <Trash className="w-4 h-4" />
          Azzera Tutti gli Indizi
        </Button>
      </div>
    </section>
  );
}
