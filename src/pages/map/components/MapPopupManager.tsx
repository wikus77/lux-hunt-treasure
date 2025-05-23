
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { MapMarker } from '@/components/maps/types';
import MapPointPopup from '../MapPointPopup';

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
  return (
    <>
      {/* Display map points */}
      {mapPoints.map(point => (
        <Marker 
          key={point.id}
          position={[point.lat, point.lng]}
          eventHandlers={{
            click: () => {
              console.log("Marcatore esistente cliccato, ID:", point.id);
              setActiveMapPoint(point.id);
            }
          }}
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
    </>
  );
};

export default MapPopupManager;
