// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { useState } from 'react';
import { Marker } from 'react-leaflet';
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
      {mapPoints
        .map(point => {
          const lat = typeof point.lat === 'number' ? point.lat : (typeof point.latitude === 'number' ? point.latitude : null);
          const lng = typeof point.lng === 'number' ? point.lng : (typeof point.longitude === 'number' ? point.longitude : null);
          if (!Number.isFinite(lat as number) || !Number.isFinite(lng as number)) {
            return null;
          }
          return (
            <Marker 
              key={point.id} 
              position={[lat as number, lng as number]} 
              icon={createMarkerIcon()}
              eventHandlers={{
                click: () => {
                  setActiveMapPoint(point.id);
                  setEditTitle(point.title || '');
                  setEditNote(point.note || '');
                }
          }}
        >
          {/* Popup removed on /map to avoid interference with M1SSION modal */}
        </Marker>
          );
        })}

      {/* New point being added */}
      {newPoint && Number.isFinite(newPoint?.lat) && Number.isFinite(newPoint?.lng) && (
        <Marker 
          position={[newPoint.lat, newPoint.lng]}
          icon={createMarkerIcon()}
        >
          {/* Popup removed on /map to avoid interference with M1SSION modal */}
        </Marker>
      )}
    </>
  );
};

export default MapPopupManager;
