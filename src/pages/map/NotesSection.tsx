
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";
import MapNoteList from "@/components/maps/MapNoteList";

// Nuova tipologia per la nota locale (con importanza)
type Importance = "high" | "medium" | "low";
type LocalNote = {
  id: string;
  note: string;
  importance: Importance;
};

type NotesSectionProps = {
  // markers e clearAllMarkers non più necessari qui
};

const importanceColors: Record<Importance, string> = {
  high: "#ea384c",
  medium: "#F97316",
  low: "#22c55e"
};

const NotesSection: React.FC = () => {
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Aggiunta nota
  const addNote = () => {
    if (noteText.trim().length === 0) return;
    setNotes([
      ...notes,
      { id: Date.now().toString(), note: noteText.trim(), importance: "medium" }
    ]);
    setNoteText("");
    setShowInput(false);
  };

  // Cambio importanza
  const toggleImportance = (id: string) => {
    setNotes(notes =>
      notes.map(n =>
        n.id !== id
          ? n
          : {
              ...n,
              importance:
                n.importance === "low"
                  ? "medium"
                  : n.importance === "medium"
                  ? "high"
                  : "low"
            }
      )
    );
  };

  // Cancella tutte le note
  const clearAllNotes = () => setNotes([]);

  return (
    <>
      <div className="flex justify-between mt-4 mb-2 items-center">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-lime-400" />
          Le tue note
        </h2>
        <div className="flex gap-2 items-center">
          {notes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllNotes}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              Cancella tutto
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="ml-2"
            onClick={() => setShowInput(v => !v)}
            aria-label="Aggiungi nota"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {showInput && (
        <div className="mb-3 flex items-center gap-2">
          <input
            className="flex-1 rounded bg-background/80 px-3 py-2 mr-2 text-white border border-projectx-deep-blue/50 focus:outline-none"
            maxLength={120}
            value={noteText}
            placeholder="Scrivi una nota..."
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addNote() }}
            autoFocus
          />
          <Button
            variant="default"
            size="sm"
            onClick={addNote}
            disabled={noteText.trim().length === 0}
          >
            Salva
          </Button>
        </div>
      )}
      <MapNoteList
        notes={notes}
        toggleImportance={toggleImportance}
      />
    </>
  );
};

export default NotesSection;
