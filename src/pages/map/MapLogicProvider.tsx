
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Circle, Popup, Marker } from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LOCATION, useMapLogic } from './useMapLogic';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import { Circle as CircleIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchAreaMapLayer from './SearchAreaMapLayer';
import MapPointPopup from './MapPointPopup';

// Fix for Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map events
const MapEventHandler = ({ 
  isAddingSearchArea, 
  handleMapClickArea, 
  searchAreas, 
  setPendingRadius,
  isAddingMapPoint,
  onMapPointClick
}) => {
  const map = useMapEvents({
    click: (e) => {
      if (isAddingSearchArea) {
        console.log("MAP CLICKED FOR SEARCH AREA", e.latlng);
        
        // Convert Leaflet event to format expected by handleMapClickArea
        const simulatedGoogleMapEvent = {
          latLng: {
            lat: () => e.latlng.lat,
            lng: () => e.latlng.lng
          }
        };
        
        // Call the handler to create the area
        handleMapClickArea(simulatedGoogleMapEvent);
      } else if (isAddingMapPoint) {
        console.log("MAP CLICKED FOR MAP POINT", e.latlng);
        onMapPointClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  
  // Change cursor style based on the current action state - IMPROVED IMMEDIATE CURSOR CHANGE
  useEffect(() => {
    if (!map) return;
    
    const mapContainer = map.getContainer();
    
    // Force an immediate cursor change with timeout of 0ms
    setTimeout(() => {
      if (isAddingSearchArea) {
        mapContainer.style.cursor = 'crosshair';
        console.log("Cursore cambiato in crosshair per area");
        toast.info("Clicca sulla mappa per posizionare l'area", {
          duration: 3000
        });
      } else if (isAddingMapPoint) {
        mapContainer.style.cursor = 'crosshair';
        console.log("Cursore cambiato in crosshair per punto");
        toast.info("Clicca sulla mappa per posizionare il punto", {
          duration: 3000
        });
      } else {
        mapContainer.style.cursor = 'grab';
        console.log("Cursore ripristinato a grab");
      }
    }, 0);
    
    return () => {
      if (map) mapContainer.style.cursor = 'grab';
    };
  }, [isAddingSearchArea, isAddingMapPoint, map]);
  
  // Ensure search areas are visible in the viewport
  useEffect(() => {
    if (searchAreas.length > 0 && map) {
      const bounds = L.latLngBounds([]);
      searchAreas.forEach(area => {
        bounds.extend([area.lat, area.lng]);
      });
      
      // Only fit bounds if we have valid bounds
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [searchAreas, map]);
  
  return null;
};

const MapLogicProvider = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [newPoint, setNewPoint] = useState(null);
  
  const { 
    handleBuzz, 
    buzzMapPrice, 
    searchAreas, 
    isAddingSearchArea, 
    handleMapClickArea, 
    setActiveSearchArea, 
    deleteSearchArea,
    setPendingRadius,
    mapPoints,
    isAddingMapPoint,
    setIsAddingMapPoint,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    toggleAddingMapPoint,
    requestLocationPermission
  } = useMapLogic();
  
  // Function to handle map load event
  const handleMapLoad = useCallback(() => {
    console.log("Map component mounted and ready");
    setMapLoaded(true);
  }, []);

  // Simulate a small loading delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapLoaded(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [mapLoaded]);

  // Handle map point click when adding a new point
  const handleMapPointClick = (lat, lng) => {
    console.log("Map point click detected at:", lat, lng);
    setNewPoint({
      id: 'new',
      lat,
      lng,
      title: '',
      note: '',
      position: { lat, lng }
    });
    setIsAddingMapPoint(false);
    
    // Change cursor back to grab after adding a point
    const mapContainers = document.querySelectorAll('.leaflet-container');
    mapContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.style.cursor = 'grab';
      }
    });
    
    toast.success("Punto posizionato. Inserisci titolo e nota.", {
      duration: 3000
    });
  };

  // Handle save of new map point
  const handleSaveNewPoint = async (title, note) => {
    if (newPoint) {
      console.log("Salvando nuovo punto con titolo:", title);
      await addMapPoint({
        lat: newPoint.lat,
        lng: newPoint.lng,
        title,
        note
      });
      setNewPoint(null);
    }
  };

  // Handle update of existing map point
  const handleUpdatePoint = async (id, title, note) => {
    await updateMapPoint(id, { title, note });
    setActiveMapPoint(null);
  };

  // Handle cancel of new point
  const handleCancelNewPoint = () => {
    setNewPoint(null);
    toast.info('Aggiunta punto annullata');
  };

  if (!mapLoaded) return <LoadingScreen />;

  return (
    <div 
      className="rounded-[24px] overflow-hidden relative w-full" 
      style={{ 
        height: '70vh', 
        minHeight: '500px',
        width: '100%',
        display: 'block',
        position: 'relative'
      }}
    >
      <MapContainer 
        center={DEFAULT_LOCATION} 
        zoom={15}
        style={{ 
          height: '100%', 
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
        className="z-10"
        whenReady={handleMapLoad}
      >
        {/* Balanced tone TileLayer - not too dark, not too light */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        {/* Add labels layer separately for better visibility and control */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
        />
        
        {/* Display search areas */}
        <SearchAreaMapLayer 
          searchAreas={searchAreas} 
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
        />
        
        {/* Display map points */}
        {mapPoints.map(point => (
          <Marker 
            key={point.id}
            position={[point.lat, point.lng]}
            eventHandlers={{
              click: () => setActiveMapPoint(point.id)
            }}
          >
            {activeMapPoint === point.id && (
              <Popup>
                <MapPointPopup
                  point={point}
                  onSave={(title, note) => handleUpdatePoint(point.id, title, note)}
                  onCancel={() => setActiveMapPoint(null)}
                  onDelete={() => deleteMapPoint(point.id)}
                />
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Display new point being added */}
        {newPoint && (
          <Marker position={[newPoint.lat, newPoint.lng]}>
            <Popup
              closeButton={false}
              autoClose={false}
              closeOnClick={false}
              closeOnEscapeKey={false}
              autoPan={true}
              className="point-popup"
            >
              <MapPointPopup
                point={newPoint}
                isNew={true}
                onSave={handleSaveNewPoint}
                onCancel={handleCancelNewPoint}
              />
            </Popup>
          </Marker>
        )}
        
        {/* Map event handler */}
        <MapEventHandler 
          isAddingSearchArea={isAddingSearchArea} 
          handleMapClickArea={handleMapClickArea}
          searchAreas={searchAreas}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingMapPoint}
          onMapPointClick={handleMapPointClick}
        />
      </MapContainer>

      {/* Location button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={requestLocationPermission}
          className="bg-black/50 hover:bg-black/70 text-white border border-white/20"
          size="sm"
        >
          <MapPin className="mr-1 h-4 w-4" />
          Posizione
        </Button>
      </div>

      {/* BUZZ button - centered at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <Button
          onClick={handleBuzz}
          className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white shadow-[0_0_10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_15px_rgba(217,70,239,0.7)]"
        >
          <CircleIcon className="mr-1 h-4 w-4" />
          BUZZ {buzzMapPrice.toFixed(2)}€
        </Button>
      </div>

      {/* Adding Area Instructions Overlay */}
      {isAddingSearchArea && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/80 p-4 rounded-lg text-center max-w-md border border-[#00D1FF]/50 shadow-[0_0_15px_rgba(0,209,255,0.3)]">
            <p className="text-white font-medium">Clicca sulla mappa per posizionare l'area di interesse</p>
            <p className="text-sm text-gray-300 mt-1">L'area verrà creata nel punto selezionato</p>
          </div>
        </div>
      )}

      {/* Adding Point Instructions Overlay */}
      {isAddingMapPoint && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/80 p-4 rounded-lg text-center max-w-md border border-[#39FF14]/50 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            <p className="text-white font-medium">Clicca sulla mappa per posizionare il punto di interesse</p>
            <p className="text-sm text-gray-300 mt-1">Potrai aggiungere un titolo e una nota dopo aver posizionato il punto</p>
          </div>
        </div>
      )}

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
