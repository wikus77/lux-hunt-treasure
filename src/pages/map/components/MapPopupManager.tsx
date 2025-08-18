// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import * as L from 'leaflet';

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

  return (
    <>
      {/* Existing map points - NO POPUP, only markers */}
      {mapPoints.map(point => (
        <Marker 
          key={point.id} 
          position={[point.lat, point.lng]} 
          eventHandlers={{
            click: () => {
              setActiveMapPoint(point.id);
              setEditTitle(point.title || '');
              setEditNote(point.note || '');
            }
          }}
          icon={L.divIcon({
            className: 'map-point-marker',
            html: `<div style="width: 12px; height: 12px; background-color: #00f0ff; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,240,255,0.8);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })}
        >
          {activeMapPoint === point.id && (
            <Popup
              closeButton={true}
              closeOnClick={false}
              className="map-point-popup"
              eventHandlers={{
                remove: () => setActiveMapPoint(null)
              }}
            >
              <div className="p-4 min-w-[250px]">
                <h3 className="font-bold mb-2">Modifica Punto</h3>
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Titolo punto"
                    className="w-full"
                  />
                  <Textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Note aggiuntive"
                    className="w-full min-h-[80px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await deleteMapPoint(point.id);
                        setActiveMapPoint(null);
                      }}
                    >
                      Elimina
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveMapPoint(null)}
                    >
                      Annulla
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await handleUpdatePoint(point.id, editTitle, editNote);
                        setActiveMapPoint(null);
                      }}
                    >
                      Salva
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Marker>
      ))}

      {/* New point being added with popup */}
      {newPoint && (
        <Marker 
          position={[newPoint.lat, newPoint.lng]}
          icon={L.divIcon({
            className: 'map-point-marker-new',
            html: `<div style="width: 12px; height: 12px; background-color: #ff0080; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(255,0,128,0.9); animation: pulse 1.5s infinite;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })}
        >
          <Popup
            closeButton={true}
            closeOnClick={false}
            className="map-point-popup-new"
            eventHandlers={{
              remove: handleCancelNewPoint
            }}
          >
            <div className="p-4 min-w-[250px]">
              <h3 className="font-bold mb-2">Nuovo Punto</h3>
              <div className="space-y-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo punto (obbligatorio)"
                  className="w-full"
                />
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note aggiuntive"
                  className="w-full min-h-[80px]"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleCancelNewPoint();
                      setTitle('');
                      setNote('');
                    }}
                  >
                    Annulla
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (title.trim()) {
                        handleSaveNewPoint(title, note);
                        setTitle('');
                        setNote('');
                      }
                    }}
                    disabled={!title.trim()}
                  >
                    Salva Punto
                  </Button>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default MapPopupManager;
