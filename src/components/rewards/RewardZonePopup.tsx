// © 2025 M1SSION™ – Reward Zone Discovery Popup
// Appare all'ingresso nell'app per guidare l'utente verso i marker rewards

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { X, MapPin, Navigation, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

const STORAGE_KEY = 'm1ssion_reward_popup_dismissed';
const POPUP_ID = 'reward-zone';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title?: string;
}

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const RewardZonePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useUnifiedAuth();
  const registerActivePopup = useEntityOverlayStore((s) => s.registerActivePopup);
  const unregisterActivePopup = useEntityOverlayStore((s) => s.unregisterActivePopup);
  const isPopupInteractionActive = useEntityOverlayStore((s) => s.isPopupInteractionActive);

  // 🆕 v9: Registra/deregistra popup per bloccare Shadow
  useEffect(() => {
    if (isVisible) {
      registerActivePopup(POPUP_ID);
    } else {
      unregisterActivePopup(POPUP_ID);
    }
    return () => {
      unregisterActivePopup(POPUP_ID);
    };
  }, [isVisible, registerActivePopup, unregisterActivePopup]);

  // Get user position
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          console.log('[RewardZonePopup] 📍 User position:', pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('[RewardZonePopup] Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [isAuthenticated]);

  // Check if popup should show (with queue management)
  useEffect(() => {
    console.log('[RewardZonePopup] 🎯 Checking popup visibility, isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('[RewardZonePopup] ❌ Not authenticated, skipping popup');
      return;
    }
    
    const dismissed = localStorage.getItem(STORAGE_KEY);
    console.log('[RewardZonePopup] 🎯 Dismissed status:', dismissed);
    
    if (dismissed === 'true') {
      console.log('[RewardZonePopup] ❌ Already dismissed, skipping popup');
      setIsVisible(false);
      return;
    }

    // Show popup after 1 minute
    console.log('[RewardZonePopup] ⏰ Popup will show in 1 minute...');
    const timer = setTimeout(() => {
      // ✅ FIX 23/12/2025: Non mostrare se ci sono micro-missions o altri popup attivi
      if (isPopupInteractionActive) {
        console.log('[RewardZonePopup] ⏸️ Skipped - other popup active');
        return;
      }
      console.log('[RewardZonePopup] ✅ Showing popup NOW!');
      setIsVisible(true);
    }, 60000); // 60 seconds = 1 minuto

    return () => clearTimeout(timer);
  }, [isAuthenticated, isPopupInteractionActive]);

  // Load markers for random selection
  useEffect(() => {
    if (!isAuthenticated || !isVisible) return;

    const loadMarkers = async () => {
      try {
        const { data, error } = await supabase
          .from('markers')
          .select('id, lat, lng, title')
          .eq('active', true)
          .limit(100);

        if (!error && data) {
          setMarkers(data);
        }
      } catch (e) {
        console.warn('[RewardZonePopup] Error loading markers:', e);
      }
    };

    loadMarkers();
  }, [isAuthenticated, isVisible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleDontShowAgain = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  }, []);

  const findNearestMarker = (markerList: MarkerData[]): MarkerData | null => {
    if (markerList.length === 0) return null;
    
    if (!userPosition) {
      // No user position, return first marker
      console.log('[RewardZonePopup] No user position, using first marker');
      return markerList[0];
    }

    let nearest = markerList[0];
    let minDistance = calculateDistance(userPosition.lat, userPosition.lng, nearest.lat, nearest.lng);

    for (const marker of markerList) {
      const distance = calculateDistance(userPosition.lat, userPosition.lng, marker.lat, marker.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = marker;
      }
    }

    console.log('[RewardZonePopup] 🎯 Nearest marker found:', nearest.id, 'at', Math.round(minDistance), 'meters');
    return nearest;
  };

  const handleFlyToReward = () => {
    console.log('[RewardZonePopup] 🎯 FlyTo clicked, markers count:', markers.length, 'userPosition:', userPosition);
    
    if (markers.length === 0) {
      console.warn('[RewardZonePopup] No markers available, loading...');
      // Try to load markers if empty
      const loadAndFly = async () => {
        try {
          const { data } = await supabase
            .from('markers')
            .select('id, lat, lng, title')
            .eq('active', true)
            .limit(100);
          
          if (data && data.length > 0) {
            const nearestMarker = findNearestMarker(data);
            if (nearestMarker) executeFlytTo(nearestMarker);
          } else {
            console.error('[RewardZonePopup] No markers in database');
          }
        } catch (e) {
          console.error('[RewardZonePopup] Error loading markers:', e);
        }
      };
      loadAndFly();
      return;
    }

    // Find nearest marker to user position
    const nearestMarker = findNearestMarker(markers);
    if (nearestMarker) executeFlytTo(nearestMarker);
  };

  const executeFlytTo = useCallback((marker: MarkerData) => {
    console.log('[RewardZonePopup] 🎯 Flying to marker:', marker.id, marker.lat, marker.lng);
    
    // Store in sessionStorage for MapTiler3D to read
    const target = {
      lat: marker.lat,
      lng: marker.lng,
      markerId: marker.id,
      radius: 125, // 125m radius = 250m diameter
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('reward_zone_target', JSON.stringify(target));
    console.log('[RewardZonePopup] 🎯 Target saved to sessionStorage:', target);

    setIsVisible(false);
    
    // Navigate to map with zoom 15 (can't see marker at this zoom)
    const mapUrl = `/map-3d-tiler#15/${marker.lat}/${marker.lng}/0/60`;
    console.log('[RewardZonePopup] 🎯 Navigating to:', mapUrl);
    navigate(mapUrl);
    
    // Dispatch event for MapTiler3D to process target (in case map is already mounted)
    setTimeout(() => {
      console.log('[RewardZonePopup] 🎯 Dispatching reward-zone-fly-to event');
      window.dispatchEvent(new CustomEvent('reward-zone-fly-to'));
    }, 100);
  }, [navigate]);

  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10003] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 20, 30, 0.95) 50%, rgba(16, 185, 129, 0.1) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>

          {/* Header with glow effect */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.5) 0%, transparent 70%)'
              }}
            />
            
            {/* Icon */}
            <motion.div
              className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)'
              }}
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.4)',
                  '0 0 40px rgba(16, 185, 129, 0.8)',
                  '0 0 20px rgba(16, 185, 129, 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="relative text-2xl font-bold text-white mb-1">
              <span className="text-emerald-400">99</span> MARKER REWARDS
            </h2>
            <p className="relative text-emerald-300/80 text-sm font-medium tracking-wider">
              HIDDEN TREASURES AWAIT
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm leading-relaxed">
                  Abbiamo nascosto <span className="text-emerald-400 font-bold">99 marker rewards</span> di colore verde sulla mappa. 
                  Trovandoli potrai riscattare premi esclusivi!
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/60 text-sm leading-relaxed">
                  Premi il pulsante per volare verso una <span className="text-cyan-400">zona di 250 metri</span> dove 
                  si nasconde un marker. Dovrai cercarlo!
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <Button
              onClick={handleFlyToReward}
              disabled={markers.length === 0}
              className="w-full h-12 text-base font-bold"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Navigation className="w-5 h-5 mr-2" />
              🎯 FLY TO REWARD ZONE
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 h-10 border-white/20 text-white/70 hover:bg-white/10"
              >
                Più tardi
              </Button>
              <Button
                onClick={handleDontShowAgain}
                variant="ghost"
                className="flex-1 h-10 text-white/50 hover:text-white/70 hover:bg-white/5"
              >
                Non mostrare più
              </Button>
            </div>
          </div>

          {/* Bottom glow */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, transparent, #10b981, transparent)'
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default RewardZonePopup;

