
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, X } from "lucide-react";
import MapNoteList from "@/components/maps/MapNoteList";
import NoteColorBanner from "@/components/maps/NoteColorBanner";

type Importance = "high" | "medium" | "low";
type LocalNote = {
  id: string;
  note: string;
  importance: Importance;
};

const NotesSection: React.FC = () => {
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editingNote, setEditingNote] = useState<LocalNote | null>(null);
  const [showColorBanner, setShowColorBanner] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const addNote = () => {
    if (noteText.trim().length === 0) return;
    
    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, note: noteText.trim() }
          : note
      ));
      setEditingNote(null);
    } else {
      setNotes([
        ...notes,
        { id: Date.now().toString(), note: noteText.trim(), importance: "medium" }
      ]);
    }
    
    setNoteText("");
    setShowInput(false);
  };

  const handleEditNote = (note: LocalNote) => {
    setEditingNote(note);
    setNoteText(note.note);
    setShowInput(true);
  };

  const handleImportanceClick = (id: string) => {
    setSelectedNoteId(id);
    setShowColorBanner(true);
  };

  const handleColorSelect = (importance: Importance) => {
    if (selectedNoteId) {
      setNotes(notes.map(note =>
        note.id === selectedNoteId
          ? { ...note, importance }
          : note
      ));
      setShowColorBanner(false);
      setSelectedNoteId(null);
    }
  };

  const deleteNote = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questa nota?")) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const clearAllNotes = () => {
    if (confirm("Sei sicuro di voler eliminare tutte le note?")) {
      setNotes([]);
    }
  };

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
            onClick={() => {
              if (!showInput) {
                setEditingNote(null);
                setNoteText("");
              }
              setShowInput(v => !v);
            }}
            aria-label={editingNote ? "Annulla modifica" : "Aggiungi nota"}
          >
            {showInput ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      {showInput && (
        <div className="mb-3 flex items-center gap-2">
          <input
            className="flex-1 rounded bg-background/80 px-3 py-2 mr-2 text-white border border-projectx-deep-blue/50 focus:outline-none"
            maxLength={120}
            value={noteText}
            placeholder={editingNote ? "Modifica nota..." : "Scrivi una nota..."}
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
            {editingNote ? "Modifica" : "Salva"}
          </Button>
        </div>
      )}
      <MapNoteList
        notes={notes}
        onImportanceClick={handleImportanceClick}
        onEditNote={handleEditNote}
        onDeleteNote={deleteNote}
      />
      <NoteColorBanner
        open={showColorBanner}
        onClose={() => setShowColorBanner(false)}
        onSelectColor={handleColorSelect}
      />
    </>
  );
};

export default NotesSection;
