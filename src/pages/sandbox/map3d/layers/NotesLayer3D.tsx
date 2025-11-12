// Notes Layer for MapLibre 3D - Map notes/points overlay
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, X } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note: string;
}

interface NotesLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
}

const NotesLayer3D: React.FC<NotesLayer3DProps> = ({ map, enabled }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('map3d-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<{ title: string; note: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('map3d-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (!map || !enabled) return;

    const updatePositions = () => {
      const newPositions = new Map<string, { x: number; y: number }>();
      notes.forEach(note => {
        const point = map.project([note.lng, note.lat]);
        newPositions.set(note.id, { x: point.x, y: point.y });
      });
      setPositions(newPositions);
    };

    updatePositions();
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);

    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
    };
  }, [map, notes, enabled]);

  const handleSave = () => {
    if (!editingNote || !selectedNote) return;
    
    setNotes(prev => prev.map(n => 
      n.id === selectedNote 
        ? { ...n, title: editingNote.title, note: editingNote.note }
        : n
    ));
    setSelectedNote(null);
    setEditingNote(null);
    toast.success('Nota salvata');
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote === id) {
      setSelectedNote(null);
      setEditingNote(null);
    }
    toast.success('Nota rimossa');
  };

  if (!enabled) return null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 13 }}>
        {notes.map((note) => {
          const pos = positions.get(note.id);
          if (!pos) return null;

          return (
            <div
              key={note.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => {
                setSelectedNote(note.id);
                setEditingNote({ title: note.title, note: note.note });
              }}
            >
              <MapPin
                className="text-purple-500"
                size={24}
                fill={note.note ? '#a855f7' : 'transparent'}
                style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.8))' }}
              />
            </div>
          );
        })}
      </div>

      {selectedNote && editingNote && (
        <div 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md p-4"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="bg-black/90 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Modifica Nota</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedNote(null);
                  setEditingNote(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                value={editingNote.title}
                onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                placeholder="Titolo"
                className="bg-black/50 border-purple-500/30"
              />
              <Textarea
                value={editingNote.note}
                onChange={e => setEditingNote({ ...editingNote, note: e.target.value })}
                placeholder="Descrizione..."
                rows={3}
                className="bg-black/50 border-purple-500/30"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedNote)}
                  className="flex-1"
                >
                  Elimina
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Salva
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotesLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
