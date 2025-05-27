
import { useEffect, useRef, useState } from "react";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";
import { toast } from "sonner";

interface BuzzExplosionHandlerProps {
  show: boolean;
  onCompleted: () => void;
}

const BuzzExplosionHandler = ({ show, onCompleted }: BuzzExplosionHandlerProps) => {
  const [explosionFadeOut, setExplosionFadeOut] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (show) {
      setExplosionFadeOut(false);
      timerRef.current = window.setTimeout(() => {
        setExplosionFadeOut(true);
      }, 2500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show]);

  function handleExplosionFadeOutComplete() {
    setExplosionFadeOut(false);
    onCompleted();
    toast.success("Indizio sbloccato!", {
      description: "Controlla la sezione Notifiche per vedere l'indizio extra."
    });
  }

  return (
    <ClueUnlockedExplosion
      open={show}
      fadeOut={explosionFadeOut}
      onFadeOutEnd={handleExplosionFadeOutComplete}
    />
  );
};

export default BuzzExplosionHandler;
