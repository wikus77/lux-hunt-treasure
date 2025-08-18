// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { useState, useRef, useEffect } from 'react';
import UnifiedMapContainer from './UnifiedMapContainer';
import { useLocation } from 'wouter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fixes.css';
import MapContent from './MapContent';
import MapControls from './MapControls';
import BuzzMapButton from '@/components/map/BuzzMapButton';
import MapZoomControls from './MapZoomControls';
import HelpDialog from './HelpDialog';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { userDotIcon } from '@/components/map/userDotIcon';
import { toast } from 'sonner';

// Default location (Milan)
const DEFAULT_LOCATION: [number, number] = [45.4642, 9.19];

// REMOVED: CenterOnUserOnce moved to separate component file

interface MapContainerProps {
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  isAddingSearchArea?: boolean;
  handleMapClickArea?: (e: any) => void;
  searchAreas?: any[];
  setActiveSearchArea?: (id: string | null) => void;
  deleteSearchArea?: (id: string) => Promise<boolean>;
  setPendingRadius?: (value: number) => void;
  requestLocationPermission?: () => void;
  toggleAddingSearchArea?: () => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  isAddingPoint,
  setIsAddingPoint,
  addNewPoint,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint,
  handleBuzz,
  isAddingSearchArea = false,
  handleMapClickArea = () => {},
  searchAreas = [],
  setActiveSearchArea = () => {},
  deleteSearchArea = async () => false,
  setPendingRadius = () => {},
  requestLocationPermission = () => {},
  toggleAddingSearchArea = () => {}
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [location] = useLocation();
  
  // Get BUZZ areas
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();

  // Handle map ready
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    (window as any).leafletMap = map; // Store map reference globally for restoration
    setMapReady(true);
    
    // 🗺️ RESTORE MAP POSITION AFTER BUZZ PAYMENT
    if ((location as any)?.state?.restorePreviousMapState) {
      const saved = localStorage.getItem("map_state_before_buzz");
      if (saved) {
        const { center, zoom } = JSON.parse(saved);
        console.log('🎯 Restoring map state after BUZZ payment:', { center, zoom });
        map.setView([center?.lat || DEFAULT_LOCATION[0], center?.lng || DEFAULT_LOCATION[1]], zoom || 13);
        localStorage.removeItem("map_state_before_buzz");
      }
    }
    
    // iOS Capacitor fixes
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        console.log('🗺️ Map invalidated for iOS');
      }
    }, 100);
    
    // Additional iOS fix
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        // Only center map if we're not restoring from BUZZ payment
        if (!(location as any)?.state?.restorePreviousMapState) {
          map.setView(mapCenter, map.getZoom());
        }
        console.log('🗺️ Map re-centered for iOS');
      }
    }, 500);
  };

  // Force map update on mount for iOS
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && mapReady) {
        mapRef.current.invalidateSize();
        console.log('🗺️ Map force invalidated on mount');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [mapReady]);

  // Handle whenReady event - no parameters expected by React Leaflet
  const handleWhenReady = () => {
    // The map instance will be available through the MapContent component
    console.log('🗺️ Map is ready');
  };

  return (
    <UnifiedMapContainer
      isAddingPoint={isAddingPoint}
      setIsAddingPoint={setIsAddingPoint}
      addNewPoint={addNewPoint}
      mapPoints={mapPoints}
      activeMapPoint={activeMapPoint}
      setActiveMapPoint={setActiveMapPoint}
      handleUpdatePoint={handleUpdatePoint}
      deleteMapPoint={deleteMapPoint}
      newPoint={newPoint}
      handleSaveNewPoint={handleSaveNewPoint}
      handleCancelNewPoint={handleCancelNewPoint}
      isAddingSearchArea={isAddingSearchArea}
      handleMapClickArea={handleMapClickArea}
      searchAreas={searchAreas}
      setActiveSearchArea={setActiveSearchArea}
      deleteSearchArea={deleteSearchArea}
      setPendingRadius={setPendingRadius}
    />
  );
};

export default MapContainer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
