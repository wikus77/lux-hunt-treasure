
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

// Type for callback function
type GenerateAreaCallback = (radius?: number) => string | null;

export const usePaymentEffects = (generateAreaCallback: GenerateAreaCallback) => {
  const [isMapBuzzActive, setIsMapBuzzActive] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const location = useLocation();

  // Handle successful payments returning from payment page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromParam = params.get('from');
    const statusParam = params.get('status');
    const sessionParam = params.get('session');
    
    // If returning from a successful map buzz payment
    if (fromParam === 'map' && statusParam === 'success' && sessionParam?.includes('map_buzz_') && !paymentSuccess) {
      try {
        setPaymentSuccess(true);
        
        // Generate search area with default radius (500km)
        const areaId = generateAreaCallback(500000);
        
        if (areaId) {
          toast.success("Area di ricerca generata con successo!", {
            description: "Un'area di ricerca è stata aggiunta alla tua mappa.",
            duration: 5000,
          });
        } else {
          toast.error("Errore nella generazione dell'area", {
            description: "C'è stato un problema durante la generazione dell'area di ricerca.",
            duration: 5000,
          });
        }
        
        // Reset the URL to avoid duplicate operations on refresh
        window.history.replaceState({}, document.title, '/map');
      } catch (error) {
        console.error("Errore nel processo di generazione area post-pagamento:", error);
        toast.error("Errore nel processo", {
          description: "Si è verificato un errore durante il processo. Riprova più tardi.",
        });
      }
    }
  }, [location, paymentSuccess, generateAreaCallback]);

  return {
    isMapBuzzActive,
    setIsMapBuzzActive,
    paymentSuccess,
    setPaymentSuccess
  };
};
