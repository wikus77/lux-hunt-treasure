// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React from 'react';
import { Marker } from 'react-leaflet';
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
            html: `<div style="width: 10px; height: 10px; background-color: #00f0ff; border-radius: 50%;"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
          })}
        />
      ))}

      {/* New point being added - NO POPUP, only marker */}
      {newPoint && (
        <Marker 
          position={[newPoint.lat, newPoint.lng]}
          icon={L.divIcon({
            className: 'map-point-marker',
            html: `<div style="width: 10px; height: 10px; background-color: #00f0ff; border-radius: 50%;"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
          })}
        />
      )}
    </>
  );
};

export default MapPopupManager;
