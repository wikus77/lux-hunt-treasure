
import React from 'react';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BuzzButtonSecureProps {
  mapCenter: [number, number];
  onAreaGenerated: (lat: number, lng: number, radius: number) => void;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({
  mapCenter,
  onAreaGenerated
}) => {
  const { user } = useAuth();
  const { processBuzzPurchase } = useStripePayment();
  const {
    currentWeekAreas,
    isGenerating,
    generateBuzzMapArea,
    dailyBuzzMapCounter,
    validateUserAccess
  } = useBuzzMapLogic();

  // Calculate current radius and display info
  const currentArea = currentWeekAreas[0];
  const currentRadius = currentArea?.radius_km || 500;
  const displayRadius = currentRadius >= 1 ? `${currentRadius.toFixed(1)}km` : `${(currentRadius * 1000).toFixed(0)}m`;
  
  // Calculate next radius for preview
  const nextRadius = Math.max(5, currentRadius * 0.95);
  
  // REAL AUTHENTICATION CHECK - Developer email only
  const isDeveloper = user?.email === 'wikus77@hotmail.it';

  const handleBuzzMapPress = async () => {
    // CRITICAL FIX: Use REAL authentication validation
    if (!user || !user.id || !user.email) {
      console.error('❌ User not authenticated - REAL AUTH REQUIRED:', {
        userId: user?.id,
        userEmail: user?.email,
        hasUser: !!user
      });
      toast.error('Errore di autenticazione. Effettua il login.');
      return;
    }

    console.log('🔥 BUZZ MAPPA button pressed - REAL AUTH:', {
      userId: user.id,
      userEmail: user.email,
      isDeveloper,
      currentRadius,
      nextRadius,
      mapCenter
    });

    try {
      // CRITICAL: Payment validation for non-developers
      if (!isDeveloper) {
        console.log('💳 Requiring payment for non-developer user');
        
        toast.dismiss();
        toast.info('Elaborazione pagamento...');
        
        const paymentResult = await processBuzzPurchase(true, 1.99);
        
        if (!paymentResult) {
          console.error('❌ Payment failed or cancelled');
          toast.dismiss();
          toast.error('Pagamento richiesto per utilizzare BUZZ MAPPA');
          return;
        }
        
        console.log('✅ Payment successful');
        toast.dismiss();
        toast.success('Pagamento completato con successo');
      }

      // Generate BUZZ MAPPA area with progressive radius
      console.log('🗺️ Generating BUZZ MAPPA area...');
      
      const newArea = await generateBuzzMapArea(mapCenter[0], mapCenter[1]);
      
      if (newArea) {
        console.log('✅ BUZZ MAPPA area generated successfully:', newArea);
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
        
        // Log success for abuse monitoring
        console.log('📊 BUZZ MAPPA generation logged');
      } else {
        console.error('❌ Failed to generate BUZZ MAPPA area');
        toast.error('Errore nella generazione dell\'area BUZZ MAPPA');
      }
    } catch (error) {
      console.error('❌ BUZZ MAPPA error:', error);
      toast.dismiss();
      toast.error('Errore durante l\'utilizzo di BUZZ MAPPA');
    }
  };

  // Button text with current status
  const buttonText = currentWeekAreas.length > 0 
    ? `BUZZ MAPPA – ${dailyBuzzMapCounter} BUZZ settimana – ${displayRadius}`
    : `BUZZ MAPPA (€1.99) – ${dailyBuzzMapCounter} BUZZ settimana – 500.0km`;

  // Button state management - REAL AUTH
  const isButtonDisabled = isGenerating || !user || !user.id;

  return (
    <div className="absolute bottom-4 left-4 z-50">
      <button
        onClick={handleBuzzMapPress}
        disabled={isButtonDisabled}
        className={`
          px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
          ${isButtonDisabled 
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-[#00D1FF] to-[#FF007A] text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isGenerating ? 'Generando...' : buttonText}
      </button>
      
      {/* Preview next radius for existing areas */}
      {currentWeekAreas.length > 0 && !isGenerating && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Prossimo: {nextRadius.toFixed(1)}km (-5%)
        </div>
      )}
    </div>
  );
};

export default BuzzButtonSecure;
