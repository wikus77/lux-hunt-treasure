
import { useCallback } from "react";
import { useBuzzClues } from "@/hooks/useBuzzClues";

export const usePricingLogic = () => {
  const { unlockedClues } = useBuzzClues();

  const calculateBuzzMapPrice = useCallback(() => {
    if (unlockedClues >= 0 && unlockedClues <= 10) return 4.99;
    if (unlockedClues <= 15) return 4.99 * 1.2; // +20%
    if (unlockedClues <= 20) return 4.99 * 1.2 * 1.2; // +20% again
    if (unlockedClues <= 25) return 4.99 * 1.2 * 1.2 * 1.2;
    if (unlockedClues <= 30) return 4.99 * 1.2 * 1.2 * 1.2 * 1.2;
    if (unlockedClues <= 35) return 4.99 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2;
    if (unlockedClues <= 40) return 4.99 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2;
    return 4.99 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2; // Maximum price
  }, [unlockedClues]);

  const calculateSearchAreaRadius = useCallback(() => {
    let radius = 300000; // 300km - Base radius
    
    if (unlockedClues > 10 && unlockedClues <= 15) radius *= 0.95;
    if (unlockedClues > 15 && unlockedClues <= 20) radius *= 0.95 * 0.95;
    if (unlockedClues > 20 && unlockedClues <= 25) radius *= 0.95 * 0.95 * 0.95;
    if (unlockedClues > 25 && unlockedClues <= 30) radius *= 0.95 * 0.95 * 0.95 * 0.95;
    if (unlockedClues > 30 && unlockedClues <= 35) radius *= 0.95 * 0.95 * 0.95 * 0.95 * 0.95;
    if (unlockedClues > 35 && unlockedClues <= 40) radius *= 0.95 * 0.95 * 0.95 * 0.95 * 0.95 * 0.95;
    if (unlockedClues > 40) radius *= 0.95 * 0.95 * 0.95 * 0.95 * 0.95 * 0.95 * 0.95;
    
    return Math.max(radius, 5000); // 5km minimum
  }, [unlockedClues]);

  return {
    calculateBuzzMapPrice,
    calculateSearchAreaRadius,
    buzzMapPrice: calculateBuzzMapPrice()
  };
};
