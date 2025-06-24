
import { useState, useEffect } from 'react';

export const useBuzzMapPricing = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(7.99);
  const [radiusKm, setRadiusKm] = useState(3);
  const [generationCount, setGenerationCount] = useState(0);

  const incrementGeneration = () => {
    setGenerationCount(prev => prev + 1);
    // Dynamic pricing based on generation count
    const newPrice = Math.min(29.99, 7.99 + (generationCount * 2.2));
    setBuzzMapPrice(newPrice);
    // Radius increases slightly with each generation
    setRadiusKm(prev => Math.min(10, prev + 0.5));
  };

  return {
    buzzMapPrice,
    radiusKm,
    generationCount,
    incrementGeneration
  };
};
