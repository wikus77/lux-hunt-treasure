
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader, Lock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { useAuth } from '@/hooks/useAuth';

export interface BuzzButtonSecureProps {
  handleBuzz?: () => void;
  radiusKm?: number;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({ 
  handleBuzz, 
  radiusKm = 500,
  mapCenter,
  onAreaGenerated
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const [realBuzzMapCounter, setRealBuzzMapCounter] = useState(0);
  const { user } = useAuth();
  const { createMapBuzzNotification } = useNotificationManager();
  const { processBuzzPurchase, loading: stripeLoading } = useStripePayment();
  const {
    hasValidPayment,
    canAccessPremium,
    remainingBuzz,
    subscriptionTier,
    loading: verificationLoading,
    requireBuzzPayment
  } = usePaymentVerification();
  
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas,
    areas,
    deletePreviousBuzzMapAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  // Enhanced counter tracking
  useEffect(() => {
    const mapCounter = areas.filter(area => 
      area.user_id === (user?.id || '00000000-0000-4000-a000-000000000000')
    ).length;
    setRealBuzzMapCounter(mapCounter);
    console.log('📊 RIPARAZIONE: Map counter aggiornato:', mapCounter);
  }, [areas, user?.id]);

  // CRITICAL FIX: Calcolo prezzo dinamico BUZZ MAPPA secondo logica richiesta
  const calculateDynamicPrice = (generationCount: number): number => {
    if (generationCount <= 10) return 7.99;
    if (generationCount <= 20) return 9.99;
    if (generationCount <= 30) return 13.99;
    if (generationCount <= 40) return 19.99;
    if (generationCount <= 50) return 29.99;
    return 29.99; // Massimo
  };

  // CRITICAL FIX: Enhanced secure BUZZ MAP con FORZATURA STRIPE OBBLIGATORIA
  const handleSecureBuzzMapClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    // CRITICAL FIX: Developer bypass con logging dettagliato
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 RIPARAZIONE: Developer bypass attivo - STRIPE SALTATO');
      console.log('💳 RIPARAZIONE: Modalità developer - pagamento simulato');
      toast.success('🔧 Developer: Stripe bypassed - Generando area...');
      generateBuzzMapAreaInternal();
      return;
    }

    // CRITICAL FIX: FORZATURA STRIPE OBBLIGATORIA per tutti i non-developer
    console.log('💳 RIPARAZIONE: NON-DEVELOPER - FORZANDO Stripe checkout OBBLIGATORIO');
    
    const currentPrice = calculateDynamicPrice(realBuzzMapCounter + 1);
    
    try {
      console.log(`💳 RIPARAZIONE: Apertura OBBLIGATORIA Stripe checkout per BUZZ MAP at ${currentPrice}€...`);
      toast.info(`💳 Pagamento obbligatorio: ${currentPrice}€ per BUZZ MAPPA`);
      
      // FORZATURA STRIPE OBBLIGATORIA - BLOCCO ESECUZIONE SE FALLISCE
      const stripeSuccess = await processBuzzPurchase(true, currentPrice);
      
      if (stripeSuccess) {
        console.log('✅ RIPARAZIONE: Stripe payment completato per BUZZ MAP');
        toast.success(`✅ Pagamento completato (${currentPrice}€)! Generando area BUZZ MAPPA...`);
        
        // Continua con generazione area dopo pagamento
        setTimeout(() => {
          generateBuzzMapAreaInternal();
        }, 1500); // Ridotto per rispettare i 1.5s richiesti
      } else {
        console.log('❌ RIPARAZIONE: Stripe payment fallito o cancellato - BLOCCO ESECUZIONE');
        toast.error('❌ Pagamento richiesto per BUZZ MAPPA - Area NON generata');
        return; // BLOCCO TOTALE se Stripe fallisce
      }
      return;
    } catch (error) {
      console.error('❌ RIPARAZIONE: Errore Stripe payment per BUZZ MAP:', error);
      toast.error('❌ Errore nel processo di pagamento BUZZ MAPPA - Esecuzione bloccata');
      return; // BLOCCO TOTALE se Stripe ha errori
    }
  };

  const generateBuzzMapAreaInternal = async () => {
    console.log('🚀 RIPARAZIONE: Avvio generazione area con forzatura cancellazione...');
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 RIPARAZIONE: BUZZ COORDINATES:', { centerLat, centerLng });
    
    // Genera nuova area (cancellazione avviene dentro generateBuzzMapArea)
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      console.log('🎉 RIPARAZIONE: BUZZ MAP SUCCESS - Area generata', newArea);

      // Aggiorna contatore
      setRealBuzzMapCounter(1); // Sempre 1 dato che cancelliamo le aree precedenti
      
      await reloadAreas();
      
      if (handleBuzz) {
        handleBuzz();
      }
      
      // CRITICAL FIX: Creazione notifica forzata con persistenza garantita
      let notificationCreated = false;
      let attempts = 0;
      
      while (!notificationCreated && attempts < 20) { // Aumentato a 20 tentativi
        attempts++;
        try {
          console.log(`📨 RIPARAZIONE: BUZZ MAP notification tentativo ${attempts}/20`);
          await createMapBuzzNotification(
            "🗺️ Area BUZZ Mappa Generata",
            `Nuova area di ricerca Mission: ${newArea.radius_km.toFixed(1)}km di raggio - Riduzione 5% attiva`
          );
          notificationCreated = true;
          console.log(`✅ RIPARAZIONE: BUZZ MAP notification creata al tentativo ${attempts}`);
        } catch (notifError) {
          console.error(`❌ RIPARAZIONE: BUZZ MAP notification tentativo ${attempts} fallito:`, notifError);
          if (attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Ridotto per velocità
          }
        }
      }
      
      if (!notificationCreated) {
        console.error('❌ RIPARAZIONE: Fallimento creazione notifica dopo 20 tentativi');
      }
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
      
    } else {
      console.error('❌ RIPARAZIONE: BUZZ MAP - Area generation failed');
      toast.error('❌ Errore generazione area BUZZ MAP');
    }
  };

  // CRITICAL FIX: Enhanced display logic
  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper; // Non-developers necessitano sempre pagamento
  const isLoading = isGenerating || stripeLoading || verificationLoading;
  
  const displayRadius = () => {
    if (activeArea) {
      return activeArea.radius_km.toFixed(1);
    }
    // CRITICAL FIX: Calcolo raggio con riduzione 5% per generazione
    const baseRadius = 500;
    const reductionFactor = Math.pow(0.95, realBuzzMapCounter);
    const calculatedRadius = Math.max(5, baseRadius * reductionFactor);
    return calculatedRadius.toFixed(1);
  };
  
  const displayGeneration = () => {
    return realBuzzMapCounter || 0;
  };
  
  // CRITICAL FIX: Enhanced generation limits
  const maxGenerations = isDeveloper ? 50 : 25; // Aumentato per test developer
  const canGenerate = displayGeneration() < maxGenerations;
  const currentPrice = calculateDynamicPrice(realBuzzMapCounter + 1);
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        className="relative"
        whileHover={{ scale: (isBlocked && !canGenerate) ? 1 : 1.05 }}
        whileTap={{ scale: (isBlocked && !canGenerate) ? 1 : 0.95 }}
      >
        <Button
          onClick={handleSecureBuzzMapClick}
          disabled={isLoading || (!isDeveloper && !canGenerate)}
          className={`buzz-button relative overflow-hidden whitespace-nowrap ${
            (isBlocked && !canGenerate)
              ? 'bg-gradient-to-r from-red-600 to-red-800 cursor-not-allowed' 
              : isBlocked 
                ? 'bg-gradient-to-r from-orange-600 to-orange-800 cursor-pointer hover:from-orange-500 hover:to-orange-700' 
                : 'bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)]'
          } text-white px-8 py-3 rounded-full font-bold tracking-wide text-base transition-all duration-300`}
          style={{
            animation: (!canGenerate || isBlocked) ? "none" : "buzzGlow 2s infinite ease-in-out",
            minWidth: 'fit-content',
            boxShadow: (!canGenerate || isBlocked) ? 'none' : '0 0 20px 6px rgba(255,0,128,0.45)'
          }}
        >
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (!canGenerate && !isDeveloper) ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : isBlocked ? (
            <CreditCard className="mr-2 h-4 w-4" />
          ) : (
            <CircleIcon className="mr-2 h-4 w-4" />
          )}
          <span>
            {isLoading ? 'Generando...' : 
             (!canGenerate && !isDeveloper) ? `LIMITE RAGGIUNTO (${maxGenerations})` :
             isBlocked ? `BUZZ MAPPA (${currentPrice}€)` :
             `BUZZ MAPPA (${displayRadius()}km) - ${displayGeneration()}/${maxGenerations} ${isDeveloper ? '[DEV]' : ''}`}
          </span>
          
          {!isBlocked && canGenerate && (hasValidPayment || isDeveloper) && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </Button>
        
        {isRippling && !isBlocked && canGenerate && (
          <motion.div
            className="absolute inset-0 border-2 border-cyan-400 rounded-full"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </motion.div>
      
      <style>
        {`
        @keyframes buzzGlow {
          0% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
          50% { box-shadow: 0 0 22px rgba(255, 0, 204, 0.88), 0 0 33px rgba(0, 207, 255, 0.55); }
          100% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
        }
        `}
      </style>
    </div>
  );
};

export default BuzzButtonSecure;
