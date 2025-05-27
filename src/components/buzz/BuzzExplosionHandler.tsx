
import { useEffect, useRef, useState } from "react";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";
import { toast } from "sonner";

interface BuzzExplosionHandlerProps {
  showExplosion: boolean;
  onExplosionCompleted: () => void;
}

const BuzzExplosionHandler = ({ showExplosion, onExplosionCompleted }: BuzzExplosionHandlerProps) => {
  const [explosionFadeOut, setExplosionFadeOut] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (showExplosion) {
      setExplosionFadeOut(false);
      timerRef.current = window.setTimeout(() => {
        setExplosionFadeOut(true);
      }, 2500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showExplosion]);

  function handleExplosionFadeOutComplete() {
    setExplosionFadeOut(false);
    onExplosionCompleted();
    toast.success("Indizio sbloccato!", {
      description: "Controlla la sezione Notifiche per vedere l'indizio extra."
    });
  }

  return (
    <ClueUnlockedExplosion
      open={showExplosion}
      fadeOut={explosionFadeOut}
      onFadeOutEnd={handleExplosionFadeOutComplete}
    />
  );
};

export default BuzzExplosionHandler;
