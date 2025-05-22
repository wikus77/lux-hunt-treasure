
import { useState, useEffect } from 'react';

export const usePricingLogic = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(1.99);
  
  // Calculate radius based on price
  const calculateSearchAreaRadius = () => {
    // Basic calculation for now - can be made more complex later
    // 1.99 EUR = 50km radius
    const baseRadius = 50000; // 50km in meters
    return baseRadius;
  };
  
  return {
    buzzMapPrice,
    setBuzzMapPrice,
    calculateSearchAreaRadius
  };
};
