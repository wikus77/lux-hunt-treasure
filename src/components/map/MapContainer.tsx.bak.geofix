// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { useLocation } from 'wouter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fixes.css';
import MapContent from './MapContent';
import MapControls from './MapControls';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';

import HelpDialog from './HelpDialog';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useGeolocation } from '@/hooks/useGeolocation';
import OneSignalTestButton from '@/components/OneSignalTestButton';

import { userDotIcon } from '@/components/map/userDotIcon';
import { toast } from 'sonner';

// Default view (centered on Europe)
const DEFAULT_VIEW: [number, number] = [46.0, 8.0];

// Centers map on user once and shows a user location marker + accuracy circle
const CenterOnUserOnce: React.FC = () => {
  const map = useMap();
  const didCenter = useRef(false);
  const didToast = useRef(false);
  const { status, position } = useGeolocation();

  useEffect(() => {
    if (position && !didCenter.current) {
      didCenter.current = true;
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 13), { animate: true });
    }
  }, [position, map]);

  useEffect(() => {
    if ((status === 'denied' || status === 'error') && !didToast.current) {
      didToast.current = true;
      try { toast.error('Geolocalizzazione non disponibile'); } catch {}
    }
  }, [status]);

  if (!position) return null;

  return (
    <>
      <Marker icon={userDotIcon} position={[position.lat, position.lng]} />
    </>
  );
};

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
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [location] = useLocation();
  
  // Get BUZZ areas
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  
  // GPS-only geolocation - no fallbacks
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initGPSLocation = () => {
      console.log('🗺️ MAP: Tentativo geolocalizzazione GPS...');
      
      if (!('geolocation' in navigator)) {
        console.log('🚫 Geolocation non supportata dal browser');
        toast.error('Geolocalizzazione non supportata dal browser');
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // Cache for 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            console.log('🎯 GPS SUCCESS! Posizione rilevata:', { latitude, longitude });
            setMapCenter([latitude, longitude]);
            toast.success('📍 Posizione rilevata correttamente!');
          }
        },
        (error) => {
          console.log('🚫 GPS Error:', error);
          let message = 'Impossibile rilevare la posizione';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permessi di geolocalizzazione negati';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Posizione non disponibile';
              break;
            case error.TIMEOUT:
              message = 'Timeout geolocalizzazione';
              break;
          }
          
          toast.error(message);
        },
        options
      );
    };

    // Start geolocation immediately
    initGPSLocation();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

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
        map.setView([center?.lat || DEFAULT_VIEW[0], center?.lng || DEFAULT_VIEW[1]], zoom || 13);
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
        // Only center map if we're not restoring from BUZZ payment and have a valid center
        if (!(location as any)?.state?.restorePreviousMapState && mapCenter) {
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
    <div className="map-container-wrapper">
      <LeafletMapContainer 
        center={mapCenter || DEFAULT_VIEW}
        zoom={mapCenter ? 13 : 6}
        className="map-container"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        inertia={true}
        whenReady={handleWhenReady}
      >
        {/* Dark tiles */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />
        <CenterOnUserOnce />
        
        {/* Map Content */}
        <MapContent
          mapRef={mapRef}
          handleMapLoad={handleMapReady}
          searchAreas={searchAreas}
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
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
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingPoint}
          hookHandleMapPointClick={addNewPoint}
          currentWeekAreas={currentWeekAreas}
        />
        
        {/* Map Controls */}
        <MapControls
          requestLocationPermission={requestLocationPermission}
          toggleAddingSearchArea={toggleAddingSearchArea}
          isAddingSearchArea={isAddingSearchArea}
          isAddingMapPoint={isAddingPoint}
          setShowHelpDialog={setShowHelpDialog}
        />
        
      </LeafletMapContainer>
      
      {/* BUZZ Button - only show if we have a valid location */}
      {mapCenter && (
        <BuzzMapButtonSecure 
          onBuzzPress={handleBuzz}
          mapCenter={mapCenter}
          onAreaGenerated={(lat, lng, radius) => {
            console.log('🎯 Area generated:', { lat, lng, radius });
            reloadAreas();
          }}
        />
      )}
      
      {/* Help Dialog */}
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
      
      {/* OneSignal Test Button */}
      <OneSignalTestButton />
    </div>
  );
};

export default MapContainer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
