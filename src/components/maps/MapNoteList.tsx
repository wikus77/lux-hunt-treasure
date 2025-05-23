
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Note {
  id: string;
  note: string;
  importance: 'high' | 'medium' | 'low';
}

interface MapNoteListProps {
  notes: Note[];
  onImportanceClick: (id: string) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const getImportanceColor = (importance: string): string => {
  switch (importance) {
    case 'high':
      return 'bg-gradient-to-r from-red-500 to-pink-500';
    case 'medium':
      return 'bg-gradient-to-r from-cyan-500 to-blue-500';
    case 'low':
      return 'bg-gradient-to-r from-green-500 to-emerald-500';
    default:
      return 'bg-gradient-to-r from-cyan-500 to-blue-500';
  }
};

const MapNoteList: React.FC<MapNoteListProps> = ({
  notes,
  onImportanceClick,
  onEditNote,
  onDeleteNote,
}) => {
  if (notes.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed border-gray-600 rounded-[24px] text-gray-400">
        <p>Nessuna nota</p>
        <p className="text-sm mt-1">Clicca sul pulsante '+' per aggiungere una nota</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="note-box bg-[#0b0b0b] border-[1px] border-cyan-500/20 rounded-[24px] p-4 transition-all hover:border-cyan-500/40"
          style={{boxShadow: '0 0 6px rgba(0, 255, 255, 0.15)'}}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-3 h-3 rounded-full mt-1.5 cursor-pointer flex-shrink-0 ${getImportanceColor(note.importance)}`}
              onClick={() => onImportanceClick(note.id)}
              title="Cambia priorità"
            />
            <div className="flex-1">
              <p className="text-white break-words">{note.note}</p>
            </div>
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-white/10"
                onClick={() => onEditNote(note)}
              >
                <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-red-900/20"
                onClick={() => onDeleteNote(note.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapNoteList;
