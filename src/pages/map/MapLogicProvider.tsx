
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Circle, Popup, Marker } from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LOCATION } from './useMapLogic';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import { Circle as CircleIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapLogic } from './useMapLogic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
const MapEventHandler = ({ isAddingMarker, handleMapClickMarker, markers }) => {
  const map = useMapEvents({
    click: (e) => {
      if (isAddingMarker) {
        console.log("Map clicked in MapEventHandler:", e.latlng);
        console.log("Cursore impostato su crosshair");
        // Convert Leaflet event to format expected by handleMapClickMarker
        const simulatedGoogleMapEvent = {
          latLng: {
            lat: () => e.latlng.lat,
            lng: () => e.latlng.lng
          }
        };
        handleMapClickMarker(simulatedGoogleMapEvent);
      }
    }
  });
  
  // Change cursor style based on the current action state
  useEffect(() => {
    if (!map) return;
    
    if (isAddingMarker) {
      map.getContainer().style.cursor = 'crosshair';
      console.log("Cursore cambiato in crosshair");
      toast.info("Clicca sulla mappa per posizionare il punto", {
        duration: 3000
      });
    } else {
      map.getContainer().style.cursor = 'grab';
      console.log("Cursore ripristinato a grab");
    }
    
    return () => {
      if (map) map.getContainer().style.cursor = 'grab';
    };
  }, [isAddingMarker, map]);
  
  // Ensure markers are visible in the viewport if we have any
  useEffect(() => {
    if (markers.length > 0 && map) {
      const bounds = L.latLngBounds([]);
      markers.forEach(marker => {
        bounds.extend([marker.lat, marker.lng]);
      });
      
      // Only fit bounds if we have valid bounds
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [markers, map]);
  
  return null;
};

const MapLogicProvider = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { 
    handleBuzz, 
    buzzMapPrice, 
    markers,
    isAddingMarker, 
    handleMapClickMarker, 
    activeMarker,
    setActiveMarker,
    saveMarkerNote,
    deleteMarker,
    handleAddMarker
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

  useEffect(() => {
    console.log("Current markers:", markers);
  }, [markers]);

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
        
        {/* Display markers */}
        {markers.map(marker => (
          <Marker 
            key={marker.id} 
            position={[marker.lat, marker.lng]}
            eventHandlers={{
              click: () => setActiveMarker(marker.id)
            }}
          >
            {activeMarker === marker.id && (
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h4 className="font-medium mb-2">Punto di interesse</h4>
                  <textarea 
                    className="w-full p-2 bg-black/20 border border-white/20 rounded text-sm mb-3"
                    placeholder="Aggiungi nota..."
                    defaultValue={marker.note}
                    rows={3}
                    onBlur={(e) => saveMarkerNote(marker.id, e.target.value)}
                  />
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteMarker(marker.id)}
                      className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                    >
                      Elimina
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setActiveMarker(null)}
                    >
                      Chiudi
                    </Button>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Map event handler */}
        <MapEventHandler 
          isAddingMarker={isAddingMarker} 
          handleMapClickMarker={handleMapClickMarker}
          markers={markers}
        />
      </MapContainer>

      {/* Bottom buttons */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-4">
        <Button
          onClick={handleAddMarker}
          className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white shadow-[0_0_10px_rgba(0,209,255,0.5)] hover:shadow-[0_0_15px_rgba(0,209,255,0.7)]"
        >
          <MapPin className="mr-1 h-4 w-4" />
          Aggiungi punto
        </Button>
        
        <Button
          onClick={handleBuzz}
          className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white shadow-[0_0_10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_15px_rgba(217,70,239,0.7)]"
        >
          <CircleIcon className="mr-1 h-4 w-4" />
          BUZZ {buzzMapPrice.toFixed(2)}€
        </Button>
      </div>

      {/* Adding Marker Instructions Overlay */}
      {isAddingMarker && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/80 p-4 rounded-lg text-center max-w-md border border-[#00D1FF]/50 shadow-[0_0_15px_rgba(0,209,255,0.3)]">
            <p className="text-white font-medium">Clicca sulla mappa per posizionare il punto di interesse</p>
            <p className="text-sm text-gray-300 mt-1">Puoi aggiungere una nota dopo aver creato il punto</p>
          </div>
        </div>
      )}

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
