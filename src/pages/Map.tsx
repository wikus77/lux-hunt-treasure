
import React, { useState } from "react";
import { MapPin, StickyNote, Plus, X } from "lucide-react";
import { MapNoteList } from "@/components/maps/MapNoteList";
import InteractiveGlobe from "@/components/maps/InteractiveGlobe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { MapMarker } from "@/components/maps/MapMarkers";

const Map = () => {
  const [markers, setMarkers] = useState<MapMarker[]>(() => {
    const savedMarkers = localStorage.getItem('mapMarkers');
    return savedMarkers ? JSON.parse(savedMarkers) : [];
  });
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        title: "Nota vuota",
        description: "Inserisci del testo per la tua nota.",
        variant: "destructive",
      });
      return;
    }

    const newMarker: MapMarker = {
      id: `marker-${Date.now()}`,
      position: { lat: 0, lng: 0 },
      note: newNote,
      createdAt: new Date().toISOString(),
    };

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    localStorage.setItem('mapMarkers', JSON.stringify(updatedMarkers));
    setNewNote('');
    setShowNoteForm(false);

    toast({
      title: "Nota aggiunta",
      description: "La tua nota è stata salvata con successo.",
    });
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-projectx-neon-blue">Mappa Interattiva</h2>
      </div>

      <div className="w-full h-[50vh] rounded-lg overflow-hidden border border-projectx-deep-blue glass-card mb-4 relative">
        <InteractiveGlobe />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-projectx-neon-blue">
          <StickyNote className="w-5 h-5" /> Note Salvate
        </h3>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setShowNoteForm(!showNoteForm)}
        >
          {showNoteForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showNoteForm ? 'Annulla' : 'Aggiungi Nota'}
        </Button>
      </div>

      {showNoteForm && (
        <div className="mb-6 p-4 bg-projectx-deep-blue/40 backdrop-blur-sm rounded-md">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Scrivi la tua nota qui..."
            className="mb-3 resize-none bg-black/50 border-projectx-deep-blue"
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddNote} size="sm">
              Salva Nota
            </Button>
          </div>
        </div>
      )}

      <MapNoteList
        markers={markers}
        setActiveMarker={setActiveMarker}
      />
    </div>
  );
};

export default Map;
