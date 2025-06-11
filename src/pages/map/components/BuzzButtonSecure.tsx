
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
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas,
    areas,
    deletePreviousBuzzMapAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  // CRITICAL FIX: Enhanced counter tracking
  useEffect(() => {
    const mapCounter = areas.filter(area => 
      area.user_id === (user?.id || '00000000-0000-4000-a000-000000000000')
    ).length;
    setRealBuzzMapCounter(mapCounter);
  }, [areas, user?.id]);

  // CRITICAL FIX: Calcolo prezzo dinamico CORRETTO
  const calculateDynamicPrice = (generationCount: number): number => {
    if (generationCount <= 10) return 7.99;
    if (generationCount <= 20) return 9.99;
    if (generationCount <= 30) return 13.99;
    if (generationCount <= 40) return 19.99;
    return 29.99;
  };

  // CRITICAL FIX: Calcolo raggio con riduzione 5% EFFETTIVA
  const calculateRadiusReduction = (generation: number): number => {
    if (generation === 1) return 500;
    return Math.max(5, 500 * Math.pow(0.95, generation - 1));
  };

  // CRITICAL FIX: Enhanced secure BUZZ MAP con FORZATURA STRIPE OBBLIGATORIA
  const handleSecureBuzzMapClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    // CRITICAL FIX: Developer bypass COMPLETO
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 DEVELOPER BYPASS: Saltando Stripe completamente');
      toast.success('🔧 Developer: Stripe bypassed - Generando area...');
      generateBuzzMapAreaInternal();
      return;
    }

    // CRITICAL FIX: FORZATURA STRIPE OBBLIGATORIA per tutti i non-developer
    const currentPrice = calculateDynamicPrice(realBuzzMapCounter + 1);
    
    try {
      console.log(`💳 FORZATURA STRIPE: Apertura checkout OBBLIGATORIO per ${currentPrice}€`);
      toast.info(`💳 Pagamento obbligatorio: ${currentPrice}€ per BUZZ MAPPA`);
      
      // BLOCCO TOTALE: Stripe deve essere completato
      const stripeSuccess = await processBuzzPurchase(true, currentPrice);
      
      if (stripeSuccess) {
        console.log('✅ STRIPE COMPLETATO: Procedo con generazione');
        toast.success(`✅ Pagamento completato (${currentPrice}€)! Generando area...`);
        setTimeout(() => generateBuzzMapAreaInternal(), 500);
      } else {
        console.log('❌ STRIPE FALLITO: BLOCCO TOTALE esecuzione');
        toast.error('❌ Pagamento richiesto - Area NON generata');
        return;
      }
    } catch (error) {
      console.error('❌ ERRORE STRIPE:', error);
      toast.error('❌ Errore processo pagamento');
      return;
    }
  };

  const generateBuzzMapAreaInternal = async () => {
    console.log('🚀 GENERAZIONE AREA: Avvio con cancellazione forzata');
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    // CRITICAL FIX: Calcolo raggio CORRETTO con riduzione 5%
    const nextGeneration = realBuzzMapCounter + 1;
    const newRadius = calculateRadiusReduction(nextGeneration);
    
    console.log(`📊 CALCOLO RAGGIO: Gen ${nextGeneration} = ${newRadius}km (riduzione 5%)`);
    
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      console.log('✅ AREA GENERATA:', newArea);
      setRealBuzzMapCounter(nextGeneration);
      await reloadAreas();
      
      if (handleBuzz) handleBuzz();
      
      // CRITICAL FIX: Notifica FORZATA con retry x20
      let notificationCreated = false;
      let attempts = 0;
      
      while (!notificationCreated && attempts < 20) {
        attempts++;
        try {
          await createMapBuzzNotification(
            "🗺️ Area BUZZ Mappa Generata",
            `Nuova area: ${newArea.radius_km.toFixed(1)}km - Gen ${nextGeneration}`
          );
          notificationCreated = true;
          console.log(`✅ NOTIFICA CREATA al tentativo ${attempts}`);
        } catch (error) {
          console.error(`❌ Notifica tentativo ${attempts} fallito:`, error);
          if (attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
    } else {
      console.error('❌ GENERAZIONE FALLITA');
      toast.error('❌ Errore generazione area');
    }
  };

  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper;
  const isLoading = isGenerating || stripeLoading;
  const currentPrice = calculateDynamicPrice(realBuzzMapCounter + 1);
  
  // CRITICAL FIX: Display raggio CORRETTO con riduzione 5%
  const displayRadius = () => {
    if (activeArea) {
      return activeArea.radius_km.toFixed(1);
    }
    const nextGen = realBuzzMapCounter + 1;
    const calculatedRadius = calculateRadiusReduction(nextGen);
    return calculatedRadius.toFixed(1);
  };
  
  const maxGenerations = isDeveloper ? 50 : 25;
  const canGenerate = realBuzzMapCounter < maxGenerations;
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        className="relative"
        whileHover={{ scale: canGenerate ? 1.05 : 1 }}
        whileTap={{ scale: canGenerate ? 0.95 : 1 }}
      >
        <Button
          onClick={handleSecureBuzzMapClick}
          disabled={isLoading || !canGenerate}
          className={`buzz-button relative overflow-hidden whitespace-nowrap ${
            !canGenerate
              ? 'bg-gradient-to-r from-red-600 to-red-800 cursor-not-allowed' 
              : isBlocked 
                ? 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700' 
                : 'bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)]'
          } text-white px-8 py-3 rounded-full font-bold tracking-wide text-base transition-all duration-300`}
          style={{
            animation: (isLoading || !canGenerate) ? "none" : "buzzGlow 2s infinite ease-in-out",
            minWidth: 'fit-content',
            boxShadow: (isLoading || !canGenerate) ? 'none' : '0 0 20px 6px rgba(255,0,128,0.45)'
          }}
        >
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : !canGenerate ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : isBlocked ? (
            <CreditCard className="mr-2 h-4 w-4" />
          ) : (
            <CircleIcon className="mr-2 h-4 w-4" />
          )}
          <span>
            {isLoading ? 'Generando...' : 
             !canGenerate ? `LIMITE RAGGIUNTO (${maxGenerations})` :
             isBlocked ? `BUZZ MAPPA (${currentPrice}€)` :
             `BUZZ MAPPA (${displayRadius()}km) (${currentPrice}€) - ${realBuzzMapCounter}/${maxGenerations} ${isDeveloper ? '[DEV]' : ''}`}
          </span>
        </Button>
        
        {isRippling && canGenerate && (
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
