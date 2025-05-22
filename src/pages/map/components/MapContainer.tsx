
import React from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import MapEventHandler from './MapEventHandler';
import { Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';

interface MapContainerProps {
  center: [number, number];
  handleMapLoad: () => void;
  markers: Array<any>;
  isAddingMarker: boolean;
  handleMapClickMarker: (e: any) => void;
  activeMarker: string | null;
  setActiveMarker: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  deleteMarker: (id: string) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  center,
  handleMapLoad,
  markers,
  isAddingMarker,
  handleMapClickMarker,
  activeMarker,
  setActiveMarker,
  saveMarkerNote,
  deleteMarker
}) => {
  return (
    <LeafletMapContainer 
      center={center} 
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
    </LeafletMapContainer>
  );
};

export default MapContainer;
