
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, MapPin, AlertTriangle } from 'lucide-react';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useBuzzMapPricing } from '../hooks/useBuzzMapPricing';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

interface BuzzMapButtonProps {
  onBuzzSuccess?: (area: any) => void;
  disabled?: boolean;
  currentLocation?: { lat: number; lng: number };
}

const BuzzMapButton: React.FC<BuzzMapButtonProps> = ({
  onBuzzSuccess,
  disabled = false,
  currentLocation
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthContext();
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  const { buzzMapPrice, radiusKm } = useBuzzMapPricing();
  const { callBuzzApi } = useBuzzApi();

  const handleBuzzPress = async () => {
    if (!user?.id || isGenerating) return;

    setIsGenerating(true);
    
    try {
      const coordinates = currentLocation || { lat: 41.9028, lng: 12.4964 };
      
      console.log('🗺️ BUZZ MAPPA: Generating area at coordinates:', coordinates);
      
      const response = await callBuzzApi({
        userId: user.id,
        generateMap: true,
        coordinates
      });

      if (response.success && response.map_area) {
        console.log('✅ BUZZ MAPPA: Area generated successfully:', response.map_area);
        
        toast.success(`Nuova area BUZZ generata!`, {
          description: `Raggio: ${response.map_area.radius_km.toFixed(1)} km`
        });

        await reloadAreas();
        
        if (onBuzzSuccess) {
          onBuzzSuccess(response.map_area);
        }
      } else {
        console.error('❌ BUZZ MAPPA: Generation failed:', response.errorMessage);
        toast.error(response.errorMessage || 'Errore durante la generazione dell\'area');
      }
    } catch (error) {
      console.error('❌ BUZZ MAPPA: Exception:', error);
      toast.error('Errore durante la generazione dell\'area');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasActiveArea = currentWeekAreas.length > 0;
  const buttonText = hasActiveArea 
    ? `RIDUCI AREA (€${buzzMapPrice.toFixed(2)})`
    : `BUZZ MAPPA (€${buzzMapPrice.toFixed(2)})`;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleBuzzPress}
        disabled={disabled || isGenerating}
        className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0099CC] hover:from-[#00B8E6] hover:to-[#0088BB] text-black font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
            <span>Generando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span>{buttonText}</span>
          </div>
        )}
      </Button>

      {hasActiveArea && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>Area attiva: {radiusKm.toFixed(1)} km di raggio</span>
        </div>
      )}

      {!hasActiveArea && (
        <div className="flex items-center gap-2 text-sm text-yellow-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Nessuna area attiva. Premi BUZZ per generarne una!</span>
        </div>
      )}
    </div>
  );
};

export default BuzzMapButton;
