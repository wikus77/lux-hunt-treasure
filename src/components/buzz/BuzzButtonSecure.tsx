
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader, Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

interface BuzzButtonSecureProps {
  userId: string;
  onSuccess: () => void;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({ userId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [buzzCount, setBuzzCount] = useState(0);
  const { user } = useAuth();
  const { createBuzzNotification } = useNotificationManager();
  const { addNotification } = useNotifications();
  const { processBuzzPurchase, loading: stripeLoading } = useStripePayment();

  // CRITICAL FIX: Calcolo prezzo dinamico BUZZ INDIZIO
  const calculateBuzzPrice = (count: number): number => {
    if (count <= 10) return 7.99;
    if (count <= 20) return 9.99;
    if (count <= 30) return 13.99;
    if (count <= 40) return 19.99;
    return 29.99;
  };

  // CRITICAL FIX: Enhanced BUZZ con FORZATURA Stripe OBBLIGATORIA
  const handleBuzzClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    // CRITICAL FIX: Developer bypass COMPLETO
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 DEVELOPER BYPASS: Saltando Stripe per indizio');
      toast.success('🔧 Developer: Stripe bypassed - Generando indizio...');
      handleBuzzSuccess();
      return;
    }

    // CRITICAL FIX: FORZATURA STRIPE OBBLIGATORIA per tutti i non-developer
    const currentPrice = calculateBuzzPrice(buzzCount + 1);
    
    try {
      console.log(`💳 FORZATURA STRIPE: Checkout OBBLIGATORIO per BUZZ ${currentPrice}€`);
      toast.info(`💳 Pagamento obbligatorio: ${currentPrice}€ per BUZZ indizio`);
      
      // BLOCCO TOTALE: Stripe deve essere completato
      const stripeSuccess = await processBuzzPurchase(false, currentPrice);
      
      if (stripeSuccess) {
        console.log('✅ STRIPE COMPLETATO per BUZZ');
        toast.success(`✅ Pagamento completato (${currentPrice}€)! Generando indizio...`);
        setTimeout(() => handleBuzzSuccess(), 500);
      } else {
        console.log('❌ STRIPE FALLITO: BLOCCO indizio');
        toast.error('❌ Pagamento richiesto per BUZZ - Indizio NON generato');
        return;
      }
    } catch (error) {
      console.error('❌ ERRORE STRIPE BUZZ:', error);
      toast.error('❌ Errore processo pagamento BUZZ');
      return;
    }
  };

  const handleBuzzSuccess = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 GENERAZIONE INDIZIO: Target 1.5s');
      
      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId,
          generateMap: false
        }
      });

      if (error) {
        console.error('❌ GENERAZIONE INDIZIO FALLITA:', error);
        toast.error('Errore nella generazione dell\'indizio');
        return;
      }

      if (data?.success) {
        setBuzzCount(prev => prev + 1);
        
        // CRITICAL FIX: Notifica FORZATA con retry x20
        let notificationCreated = false;
        let attempts = 0;
        
        while (!notificationCreated && attempts < 20) {
          attempts++;
          try {
            console.log(`📨 NOTIFICA BUZZ tentativo ${attempts}/20`);
            
            // PRIMA: createBuzzNotification per notifiche sistema
            await createBuzzNotification(
              "🎯 Nuovo Indizio Sbloccato",
              data.clue_text || "Nuovo indizio generato per la tua missione!"
            );
            
            // SECONDA: addNotification per /notifications
            await addNotification(
              "🎯 Nuovo Indizio Sbloccato",
              data.clue_text || "Nuovo indizio generato per la tua missione!",
              "buzz"
            );
            
            notificationCreated = true;
            console.log(`✅ NOTIFICA BUZZ creata al tentativo ${attempts}`);
          } catch (notifError) {
            console.error(`❌ Notifica tentativo ${attempts} fallito:`, notifError);
            if (attempts < 20) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }
        
        if (!notificationCreated) {
          console.error('❌ Fallimento notifica dopo 20 tentativi');
          toast.info('💾 Indizio salvato, notifica in fallback');
        }
        
        toast.success('🎯 Nuovo indizio sbloccato!');
        onSuccess();
      } else {
        toast.error(data?.errorMessage || 'Errore nella generazione dell\'indizio');
      }
    } catch (error) {
      console.error('❌ BUZZ ERROR:', error);
      toast.error('Errore imprevisto nella generazione dell\'indizio');
    } finally {
      setIsLoading(false);
    }
  };

  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper;
  const loading = isLoading || stripeLoading;
  const currentPrice = calculateBuzzPrice(buzzCount + 1);

  return (
    <motion.div
      className="relative flex justify-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* CRITICAL FIX: Pulsante ROTONDO originale */}
      <motion.button
        onClick={handleBuzzClick}
        disabled={loading}
        className={`relative w-32 h-32 rounded-full font-bold text-lg transition-all duration-300 overflow-hidden ${
          isBlocked 
            ? 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700' 
            : 'bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] hover:shadow-[0_0_30px_15px_rgba(255,0,128,0.65)]'
        } text-white`}
        style={{
          animation: loading ? "none" : "buzzGlow 2s infinite ease-in-out",
          boxShadow: loading ? 'none' : '0 0 25px 8px rgba(255,0,128,0.55)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Effetto alone pulsante RIPRISTINATO */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] opacity-60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {loading ? (
            <Loader className="h-8 w-8 animate-spin mb-1" />
          ) : isBlocked ? (
            <CreditCard className="h-8 w-8 mb-1" />
          ) : (
            <motion.div
              className="w-8 h-8 bg-white rounded-full mb-1"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          <span className="text-sm text-center leading-tight">
            {loading ? 'Generando...' : 
             isBlocked ? `BUZZ\n(${currentPrice}€)` :
             `BUZZ\n${isDeveloper ? '[DEV]' : `(${currentPrice}€)`}`}
          </span>
        </div>
        
        {/* Indicatore stato premium */}
        {!isBlocked && isDeveloper && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
      </motion.button>
      
      <style>
        {`
        @keyframes buzzGlow {
          0% { box-shadow: 0 0 20px rgba(255, 0, 204, 0.7); }
          50% { box-shadow: 0 0 40px rgba(255, 0, 204, 0.9), 0 0 50px rgba(0, 207, 255, 0.6); }
          100% { box-shadow: 0 0 20px rgba(255, 0, 204, 0.7); }
        }
        `}
      </style>
    </motion.div>
  );
};

export default BuzzButtonSecure;
