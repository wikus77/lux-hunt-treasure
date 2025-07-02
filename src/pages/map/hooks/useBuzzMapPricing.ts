
import { useState, useEffect } from 'react';
import { useBuzzClues } from '@/hooks/useBuzzClues';

export const useBuzzMapPricing = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(7.99);
  const [radiusKm, setRadiusKm] = useState(100);
  const { unlockedClues } = useBuzzClues();

  useEffect(() => {
    const clueCount = unlockedClues || 0;
    
    if (clueCount <= 10) {
      setBuzzMapPrice(7.99);
      setRadiusKm(100);
    } else if (clueCount <= 20) {
      setBuzzMapPrice(9.99);
      setRadiusKm(95);
    } else if (clueCount <= 30) {
      setBuzzMapPrice(13.99);
      setRadiusKm(90);
    } else if (clueCount <= 40) {
      setBuzzMapPrice(19.99);
      setRadiusKm(85);
    } else {
      setBuzzMapPrice(29.99);
      setRadiusKm(80);
    }
  }, [unlockedClues]);

  return {
    buzzMapPrice,
    radiusKm
  };
};
