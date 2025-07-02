
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BuzzApiParams {
  userId: string;
  generateMap?: boolean;
  coordinates?: { lat: number; lng: number };
}

interface BuzzApiResponse {
  success: boolean;
  map_area?: {
    id: string;
    lat: number;
    lng: number;
    radius_km: number;
  };
  lat?: number;
  lng?: number;
  radius_km?: number;
  generation_number?: number;
  clue_text?: string;
  error?: string;
  errorMessage?: string;
}

export const useBuzzApi = () => {
  const [loading, setLoading] = useState(false);

  const callBuzzApi = async (params: BuzzApiParams): Promise<BuzzApiResponse> => {
    setLoading(true);
    
    try {
      if (params.generateMap && params.coordinates) {
        // Generate new map area
        const { data, error } = await supabase
          .from('user_map_areas')
          .insert({
            user_id: params.userId,
            lat: params.coordinates.lat,
            lng: params.coordinates.lng,
            radius_km: 100,
            week: 1
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating map area:', error);
          return {
            success: false,
            error: error.message,
            errorMessage: error.message
          };
        }

        return {
          success: true,
          lat: data.lat,
          lng: data.lng,
          radius_km: data.radius_km,
          generation_number: 1,
          map_area: {
            id: data.id,
            lat: data.lat,
            lng: data.lng,
            radius_km: data.radius_km
          }
        };
      }

      // For regular BUZZ calls, generate a clue
      const clueText = `Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`;
      
      return {
        success: true,
        clue_text: clueText
      };
    } catch (error) {
      console.error('BuzzApi error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        errorMessage: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    callBuzzApi,
    loading
  };
};
