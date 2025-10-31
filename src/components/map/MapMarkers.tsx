// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Map Markers Component - Displays markers from database

import React, { useState, useEffect } from 'react';
import { Popup } from 'react-leaflet';
import { SafeMarker } from '@/components/map/safe/SafeMarker';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';
import { isValidLatLng, logGuard } from '@/lib/map/geoGuards';

interface MarkerData {
  id: string;
  title: string;
  lat: number;
  lng: number;
  active: boolean;
  visible_from: string;
  visible_to: string;
  drop_id?: string;
}

// Custom marker icon for rewards
const createRewardIcon = (rewardType: string) => {
  const iconColors = {
    'BUZZ_FREE': '#00ff88',
    'MESSAGE': '#4da6ff',
    'XP_POINTS': '#ffb347',
    'EVENT_TICKET': '#ff6b9d',
    'BADGE': '#9d50bb'
  };
  
  const color = iconColors[rewardType as keyof typeof iconColors] || '#ffffff';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: #000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${rewardType === 'BUZZ_FREE' ? '⚡' : 
          rewardType === 'MESSAGE' ? '📧' :
          rewardType === 'XP_POINTS' ? '🏆' :
          rewardType === 'EVENT_TICKET' ? '🎫' :
          rewardType === 'BADGE' ? '🏅' : '🎁'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const MapMarkers: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    
    loadMarkers();
    
    // Set up real-time subscription for markers
    const channel = supabase
      .channel('markers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'markers' }, 
        () => {
          console.log('📍 Markers changed, reloading...');
          loadMarkers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const loadMarkers = async () => {
    try {
      console.log('📍 Loading markers from database...');
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('markers')
        .select('*')
        .eq('active', true)
        .or(`visible_from.is.null,visible_from.lte.${now}`)
        .or(`visible_to.is.null,visible_to.gte.${now}`);

      if (error) {
        console.error('❌ Error loading markers:', error);
        toast.error('Errore caricamento marker');
        return;
      }

      console.log(`✅ Loaded ${data?.length || 0} active markers`);
      setMarkers(data || []);
    } catch (error) {
      console.error('❌ Exception loading markers:', error);
      toast.error('Errore durante il caricamento dei marker');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = async (marker: MarkerData) => {
    console.log('📍 Marker clicked:', marker);
    
    try {
      const user = getCurrentUser();
      if (!user?.id) {
        toast.error('Devi essere autenticato per raccogliere reward');
        return;
      }

      // Check if already claimed
      const { data: existingClaim } = await supabase
        .from('marker_claims')
        .select('id')
        .eq('marker_id', marker.id)
        .eq('user_id', user.id)
        .single();

      if (existingClaim) {
        toast.warning('Reward già raccolto!');
        return;
      }

      // Award the reward
      await awardReward(marker, user.id);

      // Record the claim
      const { error: claimError } = await supabase
        .from('marker_claims')
        .insert({
          marker_id: marker.id,
          user_id: user.id,
          reward_type: 'MARKER',
          reward_data: { title: marker.title }
        });

      if (claimError) {
        console.error('❌ Error recording claim:', claimError);
        toast.error('Errore durante la registrazione del reward');
        return;
      }

      toast.success(`🎁 Reward raccolto: ${getRewardDescription(marker)}`);
    } catch (error) {
      console.error('❌ Error claiming marker:', error);
      toast.error('Errore durante la raccolta del reward');
    }
  };

  const awardReward = async (marker: MarkerData, userId: string) => {
    // Simple marker collection - award basic XP
    try {
      await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_xp_amount: 10
      });
      console.log(`🎁 Awarded 10 XP to user ${userId} for marker ${marker.id}`);
    } catch (error) {
      console.error('❌ Error awarding XP:', error);
    }
  };

  const getRewardDescription = (marker: MarkerData): string => {
    return `${marker.title} - 10 XP`;
  };

  if (loading) {
    return null; // Don't show loading state on map
  }

  // Guard robusta: filtra marker con validazione
  const validMarkers = markers.filter(m => {
    const isValid = isValidLatLng(m?.lat, m?.lng);
    
    if (!isValid) {
      logGuard('MapMarkers: marker skipped', {
        id: m?.id,
        title: m?.title,
        lat: m?.lat,
        lng: m?.lng
      });
    }
    
    return isValid;
  });

  return (
    <>
      {validMarkers.map((marker) => (
        <SafeMarker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={createRewardIcon('MARKER')}
          eventHandlers={{
            click: () => handleMarkerClick(marker),
          }}
        >
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {getRewardDescription(marker)}
              </p>
              <button 
                className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:opacity-90"
                onClick={() => handleMarkerClick(marker)}
              >
                Raccogli Reward
              </button>
            </div>
          </Popup>
        </SafeMarker>
      ))}
    </>
  );
};

export default MapMarkers;