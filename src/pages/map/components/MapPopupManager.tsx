
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { MapMarker } from '@/components/maps/types';
import MapPointPopup from '../MapPointPopup';
import L from 'leaflet';

interface MapPopupManagerProps {
  mapPoints: MapMarker[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<void>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: MapMarker | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
}

const MapPopupManager: React.FC<MapPopupManagerProps> = ({
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint
}) => {
  // Create a custom icon for better visibility
  const pointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'neon-marker-icon'
  });
  
  // Create a custom icon for the new point (different color)
  const newPointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'neon-marker-icon'
  });

  console.log("🗺️ MapPopupManager rendering:", { 
    mapPointsCount: mapPoints.length, 
    activeMapPoint, 
    newPoint: newPoint ? "YES" : "NO" 
  });
  
  return (
    <>
      {/* Display existing map points */}
      {mapPoints.map(point => {
        console.log("📍 Rendering map point:", point.id, point.lat, point.lng);
        return (
          <Marker 
            key={point.id}
            position={[point.lat, point.lng]}
            icon={pointIcon}
            eventHandlers={{
              click: () => {
                console.log("📍 Existing marker clicked, ID:", point.id);
                setActiveMapPoint(point.id);
              }
            }}
            pane="markerPane"
          >
            {activeMapPoint === point.id && (
              <Popup
                closeButton={true}
                autoClose={false}
                closeOnClick={false}
              >
                <MapPointPopup
                  point={point}
                  onSave={(title, note) => handleUpdatePoint(point.id, title, note)}
                  onCancel={() => setActiveMapPoint(null)}
                  onDelete={() => deleteMapPoint(point.id)}
                />
              </Popup>
            )}
          </Marker>
        );
      })}
      
      {/* Display new point being added */}
      {newPoint && (
        <Marker 
          position={[newPoint.lat, newPoint.lng]} 
          icon={newPointIcon}
          pane="markerPane"
        >
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
    </>
  );
};

export default MapPopupManager;
