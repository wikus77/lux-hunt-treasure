
import React from 'react';
import { X, Edit2, CircleDot, Trash2 } from 'lucide-react';

type Importance = "high" | "medium" | "low";

type MapNote = {
  id: string;
  note: string;
  importance: Importance;
};

interface MapNoteListProps {
  notes: MapNote[];
  onImportanceClick?: (id: string) => void;
  onEditNote?: (note: MapNote) => void;
  onDeleteNote?: (id: string) => void; 
}

const getImportanceStyle = (importance: Importance) => {
  switch (importance) {
    case "high":
      return "border-red-500 bg-red-900/20";
    case "medium":
      return "border-amber-500 bg-amber-900/20";
    case "low":
      return "border-green-500 bg-green-900/20";
    default:
      return "border-slate-500 bg-slate-900/20";
  }
};

const getImportanceColor = (importance: Importance) => {
  switch (importance) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-amber-500";
    case "low":
      return "text-green-500";
    default:
      return "text-white/70";
  }
};

const MapNoteList: React.FC<MapNoteListProps> = ({ 
  notes, 
  onImportanceClick,
  onEditNote, 
  onDeleteNote 
}) => {
  const handleDeleteClick = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa nota?")) {
      onDeleteNote?.(id);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="py-4 text-center text-white/50 italic text-sm">
        Nessuna nota aggiunta
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
      {notes.map((note) => (
        <div 
          key={note.id} 
          className={`rounded p-2.5 border flex justify-between items-center gap-2 ${getImportanceStyle(note.importance)}`}
        >
          <div className="flex-1 text-sm text-white/90">
            {note.note}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Color indicator button */}
            <button
              onClick={() => onImportanceClick?.(note.id)}
              className="p-1.5 rounded-full hover:bg-white/10 focus:outline-none"
              aria-label="Cambia priorità"
            >
              <CircleDot className={`w-4 h-4 ${getImportanceColor(note.importance)}`} />
            </button>
            
            {/* Edit button */}
            <button
              onClick={() => onEditNote?.(note)}
              className="p-1.5 rounded-full hover:bg-white/10 focus:outline-none text-white/70 hover:text-white"
              aria-label="Modifica nota"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            {/* Delete button */}
            <button
              onClick={() => handleDeleteClick(note.id)}
              className="p-1.5 rounded-full hover:bg-red-900/30 focus:outline-none text-white/70 hover:text-red-400"
              aria-label="Elimina nota"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapNoteList;
