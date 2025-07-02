import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import L from 'leaflet';

interface MapPopupManagerProps {
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any;
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
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');

  // Create custom marker icon
  const createMarkerIcon = () => {
    return L.divIcon({
      className: 'map-point-marker',
      html: `<div style="width: 10px; height: 10px; background-color: #00f0ff; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  return (
    <>
      {/* Existing map points */}
      {mapPoints.map(point => (
        <Marker 
          key={point.id} 
          position={[point.lat || point.latitude, point.lng || point.longitude]} 
          icon={createMarkerIcon()}
          eventHandlers={{
            click: () => {
              setActiveMapPoint(point.id);
              setEditTitle(point.title || '');
              setEditNote(point.note || '');
            }
          }}
        >
          {activeMapPoint === point.id && (
            <Popup 
              eventHandlers={{
                popupclose: () => setActiveMapPoint(null)
              }}
            >
              <div className="p-2 space-y-2">
                <Input 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  placeholder="Titolo punto" 
                  className="mb-2"
                />
                <Textarea 
                  value={editNote} 
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="Note aggiuntive"
                  className="mb-2"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdatePoint(point.id, editTitle, editNote)}
                  >
                    Salva
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteMapPoint(point.id)}
                  >
                    Elimina
                  </Button>
                </div>
              </div>
            </Popup>
          )}
        </Marker>
      ))}

      {/* New point being added */}
      {newPoint && (
        <Marker 
          position={[newPoint.lat, newPoint.lng]}
          icon={createMarkerIcon()}
        >
          <Popup 
            eventHandlers={{
              popupclose: handleCancelNewPoint
            }}
            autoPan
          >
            <div className="p-2 space-y-2">
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Titolo punto" 
                className="mb-2"
                autoFocus
              />
              <Textarea 
                value={note} 
                onChange={e => setNote(e.target.value)}
                placeholder="Note aggiuntive"
                className="mb-2"
                rows={3}
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSaveNewPoint(title, note)}
                >
                  Salva
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleCancelNewPoint}
                >
                  Annulla
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default MapPopupManager;
