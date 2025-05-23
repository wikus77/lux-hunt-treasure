
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import BottomNavigation from '@/components/layout/BottomNavigation';
import './map/components/ItalyRegionsStyles.css';

// Fix for Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Default location (Rome, Italy)
const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

// Interface for map points
interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  note: string;
  created_at?: string;
}

// Component to handle map initialization and events
const MapController = ({ 
  isAddingPoint, 
  setIsAddingPoint, 
  addNewPoint 
}: { 
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  
  useEffect(() => {
    // Change cursor style based on the current mode
    const mapContainer = map.getContainer();
    
    if (isAddingPoint) {
      mapContainer.style.cursor = 'crosshair';
      toast.info("Clicca sulla mappa per posizionare il punto", { duration: 3000 });
    } else {
      mapContainer.style.cursor = 'grab';
    }
    
    // Add click handler to the map
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingPoint) {
        console.log("📍 Map clicked while in add point mode:", e.latlng);
        addNewPoint(e.latlng.lat, e.latlng.lng);
        setIsAddingPoint(false);
      }
    };

    map.on('click', handleMapClick);
    
    // Cleanup
    return () => {
      mapContainer.style.cursor = 'grab';
      map.off('click', handleMapClick);
    };
  }, [map, isAddingPoint, setIsAddingPoint, addNewPoint]);
  
  return null;
};

// Create a default Leaflet icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Set as default marker icon
L.Marker.prototype.options.icon = DefaultIcon;

// Create a green icon for new points
const NewPointIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const NewMapPage = () => {
  const { user } = useAuth();
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [newPoint, setNewPoint] = useState<{ lat: number; lng: number; title: string; note: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<{ id: string; text: string; timestamp: string }[]>([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Fetch existing map points on mount
  useEffect(() => {
    const fetchMapPoints = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('map_points')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching map points:", error);
          toast.error("Errore nel caricamento dei punti");
          return;
        }

        console.log("📍 Fetched map points:", data);
        setMapPoints(data || []);
      } catch (err) {
        console.error("Exception fetching map points:", err);
        toast.error("Errore nel caricamento dei punti");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapPoints();
  }, [user]);

  // Add a new point to the map
  const addNewPoint = useCallback((lat: number, lng: number) => {
    console.log("📍 Adding new point at:", lat, lng);
    setNewPoint({
      lat,
      lng,
      title: '',
      note: ''
    });
  }, []);

  // Save the point to Supabase
  const savePoint = async () => {
    if (!newPoint || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert([{
          user_id: user.id,
          latitude: newPoint.lat,
          longitude: newPoint.lng,
          title: newPoint.title,
          note: newPoint.note
        }])
        .select();

      if (error) {
        console.error("Error saving map point:", error);
        toast.error("Errore nel salvare il punto");
        return;
      }

      console.log("📍 Saved new point:", data);
      toast.success("Punto salvato con successo");
      
      // Add the new point to the current list
      if (data && data.length > 0) {
        setMapPoints(prev => [...prev, data[0]]);
      }
      
      // Reset new point state
      setNewPoint(null);
    } catch (err) {
      console.error("Exception saving map point:", err);
      toast.error("Errore nel salvare il punto");
    }
  };

  // Handle toggle of add point mode
  const toggleAddPoint = () => {
    setIsAddingPoint(prev => !prev);
    if (!isAddingPoint) {
      toast.info("Clicca sulla mappa per posizionare il punto");
    }
  };

  // Add a new note
  const addNote = () => {
    if (newNote.trim()) {
      const newNoteItem = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date().toLocaleString()
      };
      setNotes([...notes, newNoteItem]);
      setNewNote('');
      setShowNoteInput(false);
      toast.success("Nota aggiunta");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <UnifiedHeader
        leftComponent={<M1ssionText />}
      />
      
      {/* Main content with proper spacing */}
      <div className="container mx-auto px-4 pt-20 pb-2 max-w-6xl">
        <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
          {/* Map container */}
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
            >
              {/* Map controller component */}
              <MapController 
                isAddingPoint={isAddingPoint}
                setIsAddingPoint={setIsAddingPoint}
                addNewPoint={addNewPoint}
              />
              
              {/* TileLayers - same as original */}
              <TileLayer
                attribution='&copy; CartoDB'
                url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              />
              <TileLayer
                attribution='&copy; CartoDB'
                url='https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
              />
              
              {/* Existing map points */}
              {mapPoints.map(point => (
                <Marker 
                  key={point.id}
                  position={[point.latitude, point.longitude]}
                >
                  <Popup closeButton={true}>
                    <div className="p-2">
                      <h3 className="font-bold mb-2">{point.title}</h3>
                      <p>{point.note}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* New point with popup */}
              {newPoint && (
                <Marker 
                  position={[newPoint.lat, newPoint.lng]}
                  icon={NewPointIcon}
                >
                  <Popup
                    closeButton={false}
                    autoClose={false}
                    closeOnClick={false}
                    closeOnEscapeKey={false}
                  >
                    <div className="p-2">
                      <h3 className="font-bold mb-2">Nuovo Punto</h3>
                      <div className="mb-2">
                        <label className="block text-sm mb-1">Titolo</label>
                        <input
                          className="w-full p-1 border rounded"
                          value={newPoint.title}
                          onChange={(e) => setNewPoint({...newPoint, title: e.target.value})}
                          placeholder="Titolo"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm mb-1">Nota</label>
                        <textarea
                          className="w-full p-1 border rounded"
                          value={newPoint.note}
                          onChange={(e) => setNewPoint({...newPoint, note: e.target.value})}
                          placeholder="Nota"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-between">
                        <button 
                          className="px-3 py-1 bg-red-500 text-white rounded"
                          onClick={() => setNewPoint(null)}
                        >
                          Annulla
                        </button>
                        <button 
                          className="px-3 py-1 bg-green-500 text-white rounded"
                          onClick={savePoint}
                        >
                          Salva
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
            
            {/* Add Point Button (positioned in bottom-right of map) */}
            <button
              onClick={toggleAddPoint}
              className={`absolute bottom-4 right-4 z-20 rounded-full p-3 shadow-lg ${
                isAddingPoint 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gradient-to-r from-projectx-blue to-projectx-pink text-white'
              }`}
            >
              {isAddingPoint ? 'Annulla' : 'Aggiungi Punto'}
            </button>
            
            {/* Map instructions overlay */}
            {isAddingPoint && (
              <div className="absolute top-4 left-4 right-4 z-20 bg-black/70 text-white p-4 rounded-lg text-center">
                Clicca sulla mappa per posizionare un nuovo punto
              </div>
            )}
          </div>
        </div>
        
        {/* Map points list section */}
        <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">I tuoi punti sulla mappa</h2>
            
            {/* Add Note Button */}
            <button
              onClick={() => setShowNoteInput(prev => !prev)}
              className={`rounded-full px-4 py-2 shadow-lg ${
                showNoteInput 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gradient-to-r from-projectx-blue to-projectx-pink text-white'
              }`}
            >
              {showNoteInput ? 'Annulla' : 'Aggiungi Nota'}
            </button>
          </div>
          
          {/* Note input section */}
          {showNoteInput && (
            <div className="mb-6 p-3 bg-black/30 border border-white/10 rounded-lg">
              <textarea
                className="w-full p-3 bg-black/50 border border-white/20 rounded-lg text-white mb-3"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Scrivi la tua nota..."
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-projectx-blue to-projectx-pink text-white rounded-full disabled:opacity-50"
                >
                  Salva Nota
                </button>
              </div>
            </div>
          )}
          
          {/* Notes list */}
          {notes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Le tue note</h3>
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="p-3 bg-black/30 border border-white/10 rounded-lg">
                    <p className="text-white">{note.text}</p>
                    <p className="text-xs text-gray-400 mt-2">{note.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Map points list */}
          <div>
            {isLoading ? (
              <p>Caricamento punti...</p>
            ) : mapPoints.length === 0 ? (
              <p>Nessun punto salvato. Aggiungi un punto cliccando sul pulsante "Aggiungi Punto".</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mapPoints.map(point => (
                  <div key={point.id} className="border border-white/10 rounded-lg p-3 bg-black/30">
                    <h3 className="font-bold">{point.title}</h3>
                    <p className="text-sm opacity-80">{point.note}</p>
                    <div className="text-xs opacity-50 mt-2">
                      Lat: {point.latitude.toFixed(4)}, Lng: {point.longitude.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Notes section */}
        <div className="m1ssion-glass-card p-4 sm:p-6 mb-20">
          <h2 className="text-xl font-bold mb-4">Note e appunti</h2>
          <p className="text-white/70 mb-4">
            Mantieni note e appunti importanti sulla tua missione. Aggiungi informazioni rilevanti che possono aiutarti a risolvere il caso.
          </p>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default NewMapPage;
