// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { useState, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fixes.css';
import '@/styles/marker-styles.css';

// Component imports
import { QRMapDisplay } from './QRMapDisplay';
import BuzzMapAreas from '@/pages/map/components/BuzzMapAreas';
import SearchAreaMapLayer from '@/pages/map/SearchAreaMapLayer';
import MapPopupManager from './MapPopupManager';
import MapEventHandler from './MapEventHandler';
import { CenterOnUserOnce } from './CenterOnUserOnce';
import BuzzMapButton from './BuzzMapButton';
import MapControls from './MapControls';
import MapZoomControls from './MapZoomControls';
import HelpDialog from './HelpDialog';

// Hooks
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useGeolocation } from '@/hooks/useGeolocation';

// Europe center location for initial map view
const EUROPE_CENTER: [number, number] = [54.5260, 15.2551];

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
  showHelpDialog?: boolean;
  setShowHelpDialog?: (show: boolean) => void;
}

const MapContainer = ({
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
  toggleAddingSearchArea = () => {},
  showHelpDialog = false,
  setShowHelpDialog = () => {}
}: MapContainerProps) => {
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(EUROPE_CENTER);
  const mapRef = useRef<L.Map | null>(null);
  
  // Get user location and BUZZ areas
  const { status, position, enabled } = useGeolocation();
  const geoEnabled = enabled && status === 'granted';
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();

  // Handle map ready with proper iOS optimizations
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    setMapReady(true);
    console.log('🗺️ Map ready with', currentWeekAreas.length, 'BUZZ areas');
    
    // iOS optimizations
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        console.log('🗺️ Map invalidated for iOS');
      }
    }, 100);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '24px',
        overflow: 'hidden'
      }}
    >
      <LeafletMapContainer 
        center={EUROPE_CENTER} 
        zoom={5} // Europe-wide view
        className="map-container w-full h-full"
        style={{ zIndex: 1 }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        inertia={true}
        whenReady={() => {
          const map = mapRef.current;
          if (map) handleMapReady(map);
        }}
      >
        {/* PROFESSIONAL TILE LAYER - CartoDB Dark */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          maxZoom={19}
          minZoom={2}
          subdomains='abcd'
          errorTileUrl='/placeholder.svg'
          updateWhenIdle={false}
          updateWhenZooming={false}
          keepBuffer={2}
        />
        
        {/* User location marker */}
        <CenterOnUserOnce />
        
        {/* BUZZ Map Areas */}
        <BuzzMapAreas areas={currentWeekAreas} />
        
        {/* QR Map Display */}
        <QRMapDisplay userLocation={geoEnabled ? position : null} />
        
        {/* Search Areas */}
        <SearchAreaMapLayer 
          searchAreas={searchAreas} 
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
        />
        
        {/* Map Popup Manager */}
        <MapPopupManager 
          mapPoints={mapPoints}
          activeMapPoint={activeMapPoint}
          setActiveMapPoint={setActiveMapPoint}
          handleUpdatePoint={handleUpdatePoint}
          deleteMapPoint={deleteMapPoint}
          newPoint={newPoint}
          handleSaveNewPoint={handleSaveNewPoint}
          handleCancelNewPoint={handleCancelNewPoint}
        />
        
        {/* Map Event Handler */}
        <MapEventHandler 
          isAddingSearchArea={isAddingSearchArea} 
          handleMapClickArea={handleMapClickArea}
          searchAreas={searchAreas}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingPoint} 
          onMapPointClick={addNewPoint}
        />
        
        {/* M1SSION Style Map Controls - RESTORED */}
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
          {/* Add Point Button */}
          <button
            onClick={() => setIsAddingPoint(!isAddingPoint)}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              isAddingPoint
                ? 'bg-[#00f0ff] border-[#00f0ff] text-black'
                : 'bg-black/70 border-[#00f0ff]/30 text-[#00f0ff] hover:border-[#00f0ff]/60'
            }`}
            title="Aggiungi Punto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Add Area Button */}
          <button
            onClick={toggleAddingSearchArea}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              isAddingSearchArea
                ? 'bg-[#7B2EFF] border-[#7B2EFF] text-white'
                : 'bg-black/70 border-[#7B2EFF]/30 text-[#7B2EFF] hover:border-[#7B2EFF]/60'
            }`}
            title="Crea Area di Ricerca"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </button>
        </div>

        {/* Location Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={requestLocationPermission}
            className="w-12 h-12 rounded-full bg-black/70 border-2 border-[#00f0ff]/30 text-[#00f0ff] hover:border-[#00f0ff]/60 flex items-center justify-center transition-all"
            title="Rileva Posizione"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polygon points="3,11 22,2 13,21 11,13 3,11"></polygon>
            </svg>
          </button>
        </div>

        {/* Help Button */}
        <div className="absolute bottom-4 left-4 z-50">
          <button
            onClick={() => setShowHelpDialog(true)}
            className="w-12 h-12 rounded-full bg-black/70 border-2 border-[#00f0ff]/30 text-[#00f0ff] hover:border-[#00f0ff]/60 flex items-center justify-center transition-all"
            title="Aiuto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <circle cx="12" cy="17" r="0.5" fill="currentColor"></circle>
            </svg>
          </button>
        </div>

        {/* Instructions Overlay */}
        {(isAddingPoint || isAddingSearchArea) && (
          <div className="absolute top-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="bg-black/90 text-white px-6 py-3 rounded-xl shadow-2xl border border-[#00f0ff]/20 backdrop-blur-md">
              {isAddingPoint && (
                <p className="text-sm font-medium">
                  <span className="text-[#00f0ff]">Clicca sulla mappa</span> per aggiungere un punto
                </p>
              )}
              {isAddingSearchArea && (
                <p className="text-sm font-medium">
                  <span className="text-[#7B2EFF]">Clicca sulla mappa</span> per creare un'area di ricerca
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Zoom Controls */}
        <MapZoomControls />
      </LeafletMapContainer>
      
      {/* BUZZ Button */}
      <BuzzMapButton 
        onBuzzPress={handleBuzz}
        mapCenter={mapCenter}
        onAreaGenerated={(lat, lng, radius) => {
          console.log('🎯 Area generated:', { lat, lng, radius });
          reloadAreas();
        }}
      />
      
      {/* Help Dialog */}
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapContainer;