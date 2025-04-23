
import React from "react";
import { CircleDot, Pencil } from "lucide-react";

type Importance = "high" | "medium" | "low";
type LocalNote = {
  id: string;
  note: string;
  importance: Importance;
};

type MapNoteListProps = {
  notes: LocalNote[];
  toggleImportance: (id: string) => void;
  onEditNote: (note: LocalNote) => void;
};

// Updated colors with gradient effects
const importanceColors: Record<Importance, { from: string; to: string }> = {
  high: { from: "#FF4D6B", to: "#FF193C" },
  medium: { from: "#FF9466", to: "#FF6B1E" },
  low: { from: "#4ADE80", to: "#22c55e" }
};

const MapNoteList = ({ notes, toggleImportance, onEditNote }: MapNoteListProps) => {
  const sortedNotes = [...notes].sort((a, b) => {
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  return (
    <div className="mt-6">
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            Nessuna nota aggiunta. Aggiungi una nota con il "+" a destra.
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={`note-${note.id}`}
              className="p-3 rounded-md bg-projectx-deep-blue/40 backdrop-blur-sm flex gap-2 items-center cursor-pointer"
              onClick={() => onEditNote(note)}
            >
              <button
                aria-label="Cambia importanza"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleImportance(note.id);
                }}
                className="flex-shrink-0 mr-3 focus:outline-none"
                style={{ background: "none", border: "none", padding: 0 }}
                type="button"
              >
                <CircleDot
                  className="w-3 h-3"
                  style={{
                    color: importanceColors[note.importance].to,
                    fill: importanceColors[note.importance].from,
                    filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))'
                  }}
                />
              </button>
              <div className="flex-1 text-sm text-white truncate">
                {note.note || (
                  <span className="text-gray-400 italic">Nessuna nota</span>
                )}
              </div>
              <Pencil className="w-4 h-4 text-gray-400" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MapNoteList;
