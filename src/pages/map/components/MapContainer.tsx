
import React, { useMemo, useRef, useCallback } from 'react';
import { MapContainer as LeafletMapContainer } from 'react-leaflet';
import { useMapView } from '../hooks/useMapView';
import { MapContent } from './MapContent';
import { MapControls } from './MapControls';
import TechnicalStatus from './TechnicalStatus';

export interface MapContainerProps {
  mapRef: React.RefObject<any>;
  onMapClick: (e: any) => void;
  selectedWeek: number;
  isAddingPoint: boolean;
  setIsAddingPoint: React.Dispatch<React.SetStateAction<boolean>>;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: {
    id: string;
    lat: number;
    lng: number;
    title: string;
    note: string;
    position: { lat: number; lng: number };
  }[];
  activeMapPoint: string | null;
  setActiveMapPoint: React.Dispatch<React.SetStateAction<string | null>>;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  requestLocationPermission: () => void;
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setActiveSearchArea: React.Dispatch<React.SetStateAction<string | null>>;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
  toggleAddingSearchArea: () => void;
  showHelpDialog: boolean;
  setShowHelpDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapRef,
  onMapClick,
  selectedWeek,
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
  requestLocationPermission,
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  setPendingRadius,
  toggleAddingSearchArea,
  showHelpDialog,
  setShowHelpDialog
}) => {
  // CRITICAL FIX: Single source of truth for map configuration
  const mapViewConfig = useMapView();
  const isMapInitialized = useRef(false);
  const internalMapRef = useRef<any>(null);
  
  // CRITICAL FIX: Memoize map configuration to prevent re-renders
  const mapConfiguration = useMemo(() => ({
    center: mapViewConfig.mapCenter,
    zoom: mapViewConfig.mapZoom,
    className: "w-full h-full relative z-0",
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true, // Better performance
    maxZoom: 19,
    minZoom: 3,
    worldCopyJump: false, // Prevent world duplication
    closePopupOnClick: false
  }), [mapViewConfig.mapCenter, mapViewConfig.mapZoom]);

  // CRITICAL FIX: Stable click handler to prevent re-renders
  const handleMapClick = useCallback((e: any) => {
    if (!isMapInitialized.current) return;
    onMapClick(e);
  }, [onMapClick]);

  // CRITICAL FIX: Map ready handler to prevent premature interactions - FIXED TS2322
  const handleMapReady = useCallback(() => {
    console.log('🗺️ CRITICAL: Map initialized and ready');
    isMapInitialized.current = true;
    
    // Single size invalidation after mount
    setTimeout(() => {
      if (internalMapRef.current) {
        internalMapRef.current.invalidateSize();
      }
    }, 100);
  }, []);

  // CRITICAL FIX: Map reference handler - FIXED TS2540
  const handleMapReference = useCallback((map: any) => {
    if (map) {
      // Store in internal ref (mutable)
      internalMapRef.current = map;
      
      // Update external ref if provided - FIXED: Check if ref has current property
      if (mapRef && 'current' in mapRef && mapRef.current !== undefined) {
        // CRITICAL FIX: Only assign if the ref is mutable
        try {
          (mapRef as React.MutableRefObject<any>).current = map;
        } catch (error) {
          console.warn('🔧 MapRef is read-only, using internal ref instead');
        }
      }
    }
  }, [mapRef]);

  return (
    <div className="relative w-full h-full">
      <LeafletMapContainer 
        ref={handleMapReference}
        {...mapConfiguration}
        onClick={handleMapClick}
        whenReady={handleMapReady}
      >
        <MapContent selectedWeek={selectedWeek} />
        <MapControls />
      </LeafletMapContainer>
      
      <TechnicalStatus />
    </div>
  );
};

export default MapContainer;
