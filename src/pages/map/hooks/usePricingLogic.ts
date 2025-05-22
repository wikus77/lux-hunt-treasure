
import { useState, useCallback } from 'react';
import { useStripePayment } from '@/hooks/useStripePayment';
import { toast } from 'sonner';

export const usePricingLogic = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(1.99);
  const { processBuzzPurchase, loading } = useStripePayment();
  
  // Calculate radius based on price
  const calculateSearchAreaRadius = () => {
    // Basic calculation for now - can be made more complex later
    // 1.99 EUR = 50km radius
    const baseRadius = 50000; // 50km in meters
    return baseRadius;
  };
  
  // Handle payment for map buzz
  const handlePayment = useCallback(async () => {
    try {
      // Process the map buzz payment
      const data = await processBuzzPurchase(true, buzzMapPrice);
      
      if (data) {
        toast.info("Redirezione al pagamento in corso...");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Errore durante il pagamento");
      return false;
    }
  }, [buzzMapPrice, processBuzzPurchase]);
  
  return {
    buzzMapPrice,
    setBuzzMapPrice,
    calculateSearchAreaRadius,
    handlePayment,
    loading
  };
};
