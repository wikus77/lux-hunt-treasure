
import React, { useState, useCallback, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { DEFAULT_LOCATION } from '@/pages/map/useMapLogic';
import { MapMarker, SearchArea } from '@/components/maps/types';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import BuzzButton from './BuzzButton';

interface MapContainerProps {
  isAddingPoint: boolean;
  setIsAddingPoint: (isAdding: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: MapMarker[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<void>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: MapMarker | null;
  handleSaveNewPoint: (title: string, note: string) => Promise<void>;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  requestLocationPermission: () => void;
  // Search area props
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => Promise<void>;
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (radius: number) => void;
  toggleAddingSearchArea: () => void;
}

function MapEventHandler({ isAddingPoint, addNewPoint, isAddingSearchArea, handleMapClickArea }: { isAddingPoint: boolean; addNewPoint: (lat: number, lng: number) => void, isAddingSearchArea: boolean, handleMapClickArea: (e: any) => Promise<void> }) {
  useMapEvents({
    click: (e) => {
      if (isAddingPoint) {
        addNewPoint(e.latlng.lat, e.latlng.lng);
      }
      if (isAddingSearchArea) {
        handleMapClickArea(e);
      }
    }
  });

  return null;
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
  requestLocationPermission,
  // Search area props
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  setPendingRadius,
  toggleAddingSearchArea,
}: MapContainerProps) => {
  const { toast } = useToast();
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION);
  const [activeSearchAreaId, setActiveSearchAreaId] = useState<string | null>(null); // Add local state for active search area
  const mapRef = useRef<L.Map | null>(null);

  const handleSave = async () => {
    if (!activeMapPoint) return;
    await handleUpdatePoint(activeMapPoint, editTitle, editNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditNote('');
    setActiveMapPoint(null);
  };

  const handleDelete = async () => {
    if (!activeMapPoint) return;
    const success = await deleteMapPoint(activeMapPoint);
    if (success) {
      setIsEditing(false);
      setEditTitle('');
      setEditNote('');
      setActiveMapPoint(null);
    }
  };

  const handleNewSave = async () => {
    if (!newPoint) return;
    await handleSaveNewPoint(editTitle, editNote);
    setIsEditing(false);
  };

  const handleNewCancel = () => {
    handleCancelNewPoint();
    setIsEditing(false);
    setEditTitle('');
    setEditNote('');
  };

  return (
    <div className="relative h-[50vh] sm:h-[60vh] w-full rounded-xl overflow-hidden border border-white/10">
      <LeafletMap
        center={mapCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        className="rounded-xl"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler 
          isAddingPoint={isAddingPoint} 
          addNewPoint={addNewPoint}
          isAddingSearchArea={isAddingSearchArea}
          handleMapClickArea={handleMapClickArea}
        />

        {mapPoints.map(point => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            eventHandlers={{
              click: () => {
                setActiveMapPoint(point.id);
                setEditTitle(point.title);
                setEditNote(point.note);
                setIsEditing(true);
              },
            }}
          >
            <Popup>
              <div>
                <h4 className="font-bold">{point.title}</h4>
                <p>{point.note}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {newPoint && (
          <Marker position={[newPoint.lat, newPoint.lng]}>
            <Popup>
              <div>
                <h4 className="font-bold">Nuovo Punto</h4>
                <input
                  type="text"
                  placeholder="Titolo"
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  placeholder="Note"
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
                <div className="flex justify-between">
                  <Button size="sm" variant="secondary" onClick={handleNewSave}>Salva</Button>
                  <Button size="sm" variant="ghost" onClick={handleNewCancel}>Annulla</Button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {searchAreas.map(area => (
          <Circle
            key={area.id}
            center={[area.lat, area.lng]}
            radius={area.radius}
            color={area.color}
            fillColor={area.color}
            fillOpacity={0.2}
            eventHandlers={{
              click: () => {
                setActiveSearchAreaId(area.id); // Use local state instead
                setActiveSearchArea(area.id);
              },
            }}
          >
            <Popup>
              <div>
                <h4 className="font-bold">{area.label}</h4>
                <p>Raggio: {(area.radius / 1000).toFixed(1)} km</p>
                {activeSearchAreaId === area.id && ( // Use local state
                  <Button size="sm" variant="destructive" onClick={() => deleteSearchArea(area.id)}>
                    Elimina
                  </Button>
                )}
              </div>
            </Popup>
          </Circle>
        ))}
      </LeafletMap>

      {isEditing && activeMapPoint && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-4 rounded-md">
            <h4 className="text-lg font-bold mb-2">Modifica Punto</h4>
            <input
              type="text"
              placeholder="Titolo"
              className="w-full p-2 border rounded mb-2"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              placeholder="Note"
              className="w-full p-2 border rounded mb-2"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
            <div className="flex justify-between">
              <Button size="sm" variant="secondary" onClick={handleSave}>Salva</Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>Annulla</Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>Elimina</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* BuzzButton component */}
      <BuzzButton handleBuzz={handleBuzz} />
      
      <div className="absolute top-2 left-2 flex gap-2">
        <Button size="sm" onClick={requestLocationPermission}>
          Richiedi Posizione
        </Button>
        <Button size="sm" variant={isAddingPoint ? 'secondary' : 'outline'} onClick={() => setIsAddingPoint(!isAddingPoint)}>
          {isAddingPoint ? 'Annulla Punto' : 'Aggiungi Punto'}
        </Button>
        <Button size="sm" variant={isAddingSearchArea ? 'secondary' : 'outline'} onClick={toggleAddingSearchArea}>
          {isAddingSearchArea ? 'Annulla Area' : 'Aggiungi Area'}
        </Button>
      </div>
    </div>
  );
};

export default MapContainer;
