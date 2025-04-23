
import React from "react";
import { CircleDot } from "lucide-react";

// Usa la stessa tipologia delle note con importanza
type Importance = "high" | "medium" | "low";
type LocalNote = {
  id: string;
  note: string;
  importance: Importance;
};
type MapNoteListProps = {
  notes: LocalNote[];
  toggleImportance: (id: string) => void;
};

// Colori associati alle importanze
const importanceColors: Record<Importance, string> = {
  high: "#ea384c",
  medium: "#F97316",
  low: "#22c55e"
};

const MapNoteList = ({ notes, toggleImportance }: MapNoteListProps) => {
  // Sort notes by importance
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
              className="p-3 rounded-md bg-projectx-deep-blue/40 backdrop-blur-sm flex gap-2 items-center"
            >
              <button
                aria-label="Cambia importanza"
                onClick={() => toggleImportance(note.id)}
                className="flex-shrink-0 mr-3 focus:outline-none"
                style={{ background: "none", border: "none", padding: 0 }}
                type="button"
              >
                <CircleDot
                  className="w-4 h-4" // Reduced from w-6 h-6 to w-4 h-4 (20% smaller)
                  style={{
                    color: importanceColors[note.importance],
                    fill: importanceColors[note.importance]
                  }}
                />
              </button>
              <div className="flex-1 text-sm text-white truncate">
                {note.note || (
                  <span className="text-gray-400 italic">Nessuna nota</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MapNoteList;
