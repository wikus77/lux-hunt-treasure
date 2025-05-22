
import React, { useState } from 'react';
import { useMapLogic } from './useMapLogic';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NotesSection = () => {
  const { markers, handleAddMarker, saveMarkerNote } = useMapLogic();
  const [search, setSearch] = useState('');
  
  const filteredMarkers = search 
    ? markers.filter(marker => 
        marker.note.toLowerCase().includes(search.toLowerCase()))
    : markers;
    
  return (
    <div>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="text-[#00D1FF]" size={20} />
        Punti di interesse
      </h3>
      
      <div className="flex mb-4 gap-2">
        <Input
          placeholder="Cerca nelle note..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-black/20 border-white/10"
        />
        <Button 
          onClick={handleAddMarker}
          size="icon"
        >
          <Plus size={18} />
        </Button>
      </div>

      {filteredMarkers.length === 0 ? (
        <div className="text-center p-6 text-gray-400">
          <p>Nessun punto di interesse salvato.</p>
          <p className="text-sm mt-1">Aggiungi punti sulla mappa per prendere note.</p>
          <Button
            onClick={handleAddMarker}
            variant="outline"
            className="mt-4"
          >
            <Plus size={16} className="mr-1" /> Aggiungi punto
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMarkers.map(marker => (
            <div 
              key={marker.id}
              className="border border-white/10 bg-black/20 rounded-lg p-3 hover:bg-black/30 transition-colors"
            >
              <div className="flex gap-2 items-start">
                <MapPin className="text-[#00D1FF] mt-1 shrink-0" size={16} />
                <textarea 
                  className="flex-1 bg-transparent text-sm resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[#00D1FF]/30 rounded p-1"
                  defaultValue={marker.note}
                  placeholder="Aggiungi nota..."
                  rows={2}
                  onBlur={(e) => saveMarkerNote(marker.id, e.target.value)}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2 text-right">
                Lat: {marker.lat.toFixed(4)}, Lng: {marker.lng.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesSection;
